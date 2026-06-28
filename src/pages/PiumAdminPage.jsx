import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const CATEGORY_LABELS = {
  health_beauty: "🏥 건강·뷰티",
  small_biz:     "🏪 소상공인·창업",
  education:     "📚 교육·학습",
  ai_tool:       "🤖 AI 활용",
  productivity:  "🛠️ 업무·생산성",
  lifestyle:     "🌿 생활·편의",
  hobby:         "🎨 취미·창작",
  community:     "🏘️ 지역·커뮤니티",
  media:         "📰 정보·미디어",
  expert_tool:   "💼 전문가 도구",
};

const COMPLETENESS_LABELS = {
  seed:   "🌱 씨앗",
  sprout: "🌿 새싹",
  bloom:  "🌸 활짝",
};

const TABS = [
  { key: "submitted", label: "대기중" },
  { key: "approved",  label: "승인됨" },
  { key: "rejected",  label: "반려됨" },
];

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false,
  });
}

export default function PiumAdminPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("submitted");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("apps")
      .select(`
        id, title, summary, app_url, thumbnail_url,
        features, how_to_use, target_users,
        category, completeness, price_model, price,
        story_article_url, slug, status, created_at, maker_id,
        users:maker_id ( nickname )
      `)
      .eq("status", tab)
      .order("created_at", { ascending: false });

    if (!error) setApps(data ?? []);
    setLoading(false);
  }, [tab]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function updateStatus(appId, newStatus, confirmMsg) {
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(appId + newStatus);
    const { error } = await supabase
      .from("apps")
      .update({ status: newStatus })
      .eq("id", appId);
    if (error) {
      alert("처리 중 오류가 발생했습니다: " + error.message);
    } else {
      await fetchApps();
    }
    setActionLoading(null);
  }

  const font = "'Noto Sans KR', sans-serif";
  const GREEN = "#16a34a";
  const PURPLE = "#7c3aed";

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", fontFamily: font }}>
      {/* 헤더 */}
      <div style={{
        background: "linear-gradient(135deg, #dcfce7 0%, #ede9fe 100%)",
        borderBottom: "1.5px solid #d1fae5",
        padding: "32px 24px 24px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🌱</div>
        <h1 style={{
          fontSize: 26, fontWeight: 800, margin: 0,
          background: `linear-gradient(90deg, ${GREEN}, ${PURPLE})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: "'Noto Serif KR', serif",
        }}>
          피움 앱 승인 관리
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, marginTop: 6 }}>
          {profile?.nickname ?? "관리자"}님 · 제출된 앱을 검토하고 승인·반려해 주세요
        </p>
      </div>

      {/* 탭 */}
      <div style={{
        display: "flex", gap: 0, maxWidth: 860, margin: "0 auto",
        padding: "20px 16px 0",
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "12px 0", fontSize: 16, fontWeight: tab === t.key ? 700 : 500,
              fontFamily: font, cursor: "pointer", border: "none", outline: "none",
              borderBottom: tab === t.key ? `3px solid ${GREEN}` : "3px solid #e5e7eb",
              background: "transparent",
              color: tab === t.key ? GREEN : "#6b7280",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 17 }}>
            불러오는 중...
          </div>
        ) : apps.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "white", borderRadius: 16,
            border: "1.5px solid #e5e7eb", color: "#9ca3af", fontSize: 17,
          }}>
            {tab === "submitted" && "대기중인 앱이 없어요 🌱"}
            {tab === "approved"  && "승인된 앱이 없어요"}
            {tab === "rejected"  && "반려된 앱이 없어요"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {apps.map(app => (
              <AppCard
                key={app.id}
                app={app}
                tab={tab}
                actionLoading={actionLoading}
                onApprove={() => updateStatus(app.id, "approved", `"${app.title}" 앱을 승인할까요?`)}
                onReject={() => updateStatus(app.id, "rejected", `"${app.title}" 앱을 반려할까요?`)}
                onToRejected={() => updateStatus(app.id, "rejected", `"${app.title}" 앱을 반려로 변경할까요?`)}
                onToApproved={() => updateStatus(app.id, "approved", `"${app.title}" 앱을 승인으로 변경할까요?`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppCard({ app, tab, actionLoading, onApprove, onReject, onToRejected, onToApproved }) {
  const font = "'Noto Sans KR', sans-serif";
  const GREEN = "#16a34a";
  const RED   = "#dc2626";
  const BLUE  = "#2563eb";

  const isActing = (s) => actionLoading === app.id + s;

  return (
    <div style={{
      background: "white", borderRadius: 16,
      border: "1.5px solid #e5e7eb",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      {/* 상단: 썸네일 + 기본정보 */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* 썸네일 */}
        <div style={{ width: 120, minHeight: 120, flexShrink: 0, background: "#f3f4f6" }}>
          {app.thumbnail_url ? (
            <img
              src={app.thumbnail_url}
              alt={app.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 120 }}
            />
          ) : (
            <div style={{
              width: "100%", minHeight: 120, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 36, color: "#d1d5db",
            }}>🌱</div>
          )}
        </div>

        {/* 기본 정보 */}
        <div style={{ flex: 1, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "#111827", fontFamily: font }}>
              {app.title}
            </h2>
            <span style={{
              fontSize: 13, padding: "3px 10px", borderRadius: 20,
              background: "#f0fdf4", color: GREEN, border: `1px solid #bbf7d0`,
              fontWeight: 600, whiteSpace: "nowrap",
            }}>
              {CATEGORY_LABELS[app.category] ?? app.category}
            </span>
            <span style={{
              fontSize: 13, padding: "3px 10px", borderRadius: 20,
              background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe",
              fontWeight: 600, whiteSpace: "nowrap",
            }}>
              {COMPLETENESS_LABELS[app.completeness] ?? app.completeness}
            </span>
          </div>

          <p style={{ margin: "8px 0 4px", fontSize: 15, color: "#374151", lineHeight: 1.5 }}>
            {app.summary}
          </p>

          <div style={{ fontSize: 14, color: "#6b7280", display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            <span>👤 {app.users?.nickname ?? app.maker_id}</span>
            <span>
              {app.price_model === "free"
                ? "🆓 무료"
                : `💳 유료${app.price ? ` · 희망가 ${app.price.toLocaleString()}원` : ""}`}
            </span>
            <span>🕐 {formatDate(app.created_at)}</span>
          </div>

          {/* 앱 링크 */}
          <a
            href={app.app_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", marginTop: 10,
              fontSize: 14, color: BLUE, textDecoration: "none",
              border: `1px solid #bfdbfe`, borderRadius: 8,
              padding: "5px 14px", background: "#eff6ff",
              fontWeight: 600,
            }}
          >
            🔗 앱 바로가기 ↗
          </a>
        </div>
      </div>

      {/* 상세 내용 */}
      <div style={{
        borderTop: "1px solid #f3f4f6",
        padding: "14px 20px",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "12px 24px", fontSize: 14,
      }}>
        {app.features && (
          <DetailRow label="핵심 기능" value={app.features} />
        )}
        {app.how_to_use && (
          <DetailRow label="사용법" value={app.how_to_use} />
        )}
        {app.target_users && (
          <DetailRow label="대상 사용자" value={app.target_users} />
        )}
        {app.story_article_url && (
          <div>
            <span style={{ fontWeight: 700, color: "#374151" }}>연결 기사 </span>
            <a
              href={app.story_article_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: BLUE, fontSize: 13 }}
            >
              기사 보기 ↗
            </a>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div style={{
        borderTop: "1px solid #f3f4f6",
        padding: "14px 20px",
        display: "flex", gap: 12, justifyContent: "flex-end",
      }}>
        {tab === "submitted" && (
          <>
            <ActionBtn
              onClick={onReject}
              loading={isActing("rejected")}
              color={RED} bg="#fef2f2" border="#fecaca"
            >
              ❌ 반려
            </ActionBtn>
            <ActionBtn
              onClick={onApprove}
              loading={isActing("approved")}
              color="white" bg={GREEN} border={GREEN}
            >
              ✅ 승인
            </ActionBtn>
          </>
        )}
        {tab === "approved" && (
          <ActionBtn
            onClick={onToRejected}
            loading={isActing("rejected")}
            color={RED} bg="#fef2f2" border="#fecaca"
          >
            반려로 변경
          </ActionBtn>
        )}
        {tab === "rejected" && (
          <ActionBtn
            onClick={onToApproved}
            loading={isActing("approved")}
            color={GREEN} bg="#f0fdf4" border="#bbf7d0"
          >
            승인으로 변경
          </ActionBtn>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <span style={{ fontWeight: 700, color: "#374151" }}>{label} </span>
      <span style={{ color: "#6b7280", whiteSpace: "pre-line" }}>{value}</span>
    </div>
  );
}

function ActionBtn({ onClick, loading, color, bg, border, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "10px 22px", fontSize: 15, fontWeight: 700,
        fontFamily: "'Noto Sans KR', sans-serif",
        color, background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
      }}
    >
      {loading ? "처리중..." : children}
    </button>
  );
}
