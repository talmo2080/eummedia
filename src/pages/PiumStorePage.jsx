import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const font  = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN  = "#16a34a";
const PURPLE = "#7c3aed";

/* ── 카테고리 정의 ── */
const CATEGORIES = [
  { key: "health_beauty", label: "건강·뷰티",    emoji: "🏥", bg: "#fce7f3", color: "#9d174d" },
  { key: "small_biz",     label: "소상공인·창업", emoji: "🏪", bg: "#dbeafe", color: "#1e40af" },
  { key: "education",     label: "교육·학습",    emoji: "📚", bg: "#fef9c3", color: "#854d0e" },
  { key: "ai_tool",       label: "AI 활용",      emoji: "🤖", bg: "#ede9fe", color: "#5b21b6" },
  { key: "productivity",  label: "업무·생산성",  emoji: "🛠️", bg: "#ccfbf1", color: "#134e4a" },
  { key: "lifestyle",     label: "생활·편의",    emoji: "🌿", bg: "#dcfce7", color: "#14532d" },
  { key: "hobby",         label: "취미·창작",    emoji: "🎨", bg: "#ffedd5", color: "#9a3412" },
  { key: "community",     label: "지역·커뮤니티", emoji: "🏘️", bg: "#ccfbf1", color: "#065f46" },
  { key: "media",         label: "정보·미디어",  emoji: "📰", bg: "#e0f2fe", color: "#075985" },
  { key: "expert_tool",   label: "전문가 도구",  emoji: "💼", bg: "#ede9fe", color: "#4c1d95" },
];
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

/* ── 캐러셀 슬라이드 (표시 순서: 새싹→잎사귀→꽃) ── */
const SLIDES = [
  {
    /* side-3: 새싹, 글씨 왼쪽 */
    title:    "경험이 기술을 입다",
    accent:   "기술",           // 민트 포인트 단어
    sub:      "비개발자가 만든 진짜 웹앱",
    cta:      "둘러보기",
    ctaTo:    "#apps",
    bg:       "/pium-side-3.jpg",
    side:     "left",
  },
  {
    /* side-2: 잎사귀, 글씨 오른쪽 */
    title:    "앱보다 사람입니다",
    accent:   "사람",
    sub:      "이 앱을 피운 메이커를 만나보세요",
    cta:      "메이커 만나기",
    ctaTo:    "/pium-submit",
    bg:       "/pium-side-2.jpg",
    side:     "right",
  },
  {
    /* side-1: 꽃, 글씨 오른쪽 */
    title:    "당신의 경험도 피어납니다",
    accent:   "경험",
    sub:      "지금 둘러보고, 직접 피워보세요",
    cta:      "내 앱 피우기",
    ctaTo:    "/pium-submit",
    bg:       "/pium-side-1.jpg",
    side:     "right",
  },
];

/* ══════════════════════════════════════
   히어로 캐러셀
══════════════════════════════════════ */
const CAROUSEL_CSS = `
  @keyframes pium-glow-breath {
    0%, 100% { opacity: 0.55; filter: blur(18px); }
    50%       { opacity: 0.85; filter: blur(24px); }
  }
  @keyframes pium-node-blink {
    0%, 90%, 100% { opacity: 0; }
    95%           { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pium-glow, .pium-node { animation: none !important; }
  }

  .pium-carousel-wrap {
    position: relative; overflow: hidden;
    border-radius: 20px; margin: 20px 16px 0;
    box-shadow: 0 6px 32px rgba(0,0,0,0.18);
    background: #0d2a1e;
  }
  .pium-slide-bg {
    position: relative;
    min-height: 280px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  /* 스크림: side별로 방향 반전 */
  .pium-scrim-left {
    position: absolute; inset: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.30) 45%, transparent 70%);
  }
  .pium-scrim-right {
    position: absolute; inset: 0;
    background: linear-gradient(to left, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.30) 45%, transparent 70%);
  }

  /* 텍스트 영역 */
  .pium-text-left {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 52%;
    display: flex; flex-direction: column; justify-content: center;
    padding: 40px 20px 60px 40px;
    text-align: left;
  }
  .pium-text-right {
    position: absolute; top: 0; right: 0; bottom: 0;
    width: 52%;
    display: flex; flex-direction: column; justify-content: center;
    padding: 40px 40px 60px 20px;
    text-align: left;
  }

  /* 빛 애니메이션 */
  .pium-glow {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
    animation: pium-glow-breath 4s ease-in-out infinite;
  }
  .pium-node {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
    animation: pium-node-blink 3.5s ease-in-out infinite;
  }

  /* 모바일 */
  @media (max-width: 640px) {
    .pium-slide-bg { min-height: 0; background-position: center top; }
    .pium-slide-bg::before {
      content: ''; display: block; padding-top: 56%;
    }
    .pium-scrim-left, .pium-scrim-right {
      background: rgba(0,0,0,0.55);
    }
    .pium-text-left, .pium-text-right {
      position: absolute; inset: 0;
      width: 100%;
      align-items: center; text-align: center;
      padding: 20px 24px 52px;
      justify-content: flex-end;
    }
  }
`;

function renderTitle(title, accent) {
  if (!accent) return <span>{title}</span>;
  const parts = title.split(accent);
  return (
    <>
      {parts[0]}
      <span style={{ color: "#10B981" }}>{accent}</span>
      {parts[1]}
    </>
  );
}

function HeroCarousel() {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const timerRef = useRef(null);

  const go = useCallback((idx) => {
    setCur((idx + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => go(cur + 1), 6000);
    return () => clearInterval(timerRef.current);
  }, [cur, go]);

  function handleCta(to) {
    if (to.startsWith("#")) {
      document.getElementById("apps")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(to);
    }
  }

  const slide = SLIDES[cur];
  const isLeft = slide.side === "left";

  return (
    <div className="pium-carousel-wrap">
      <style>{CAROUSEL_CSS}</style>

      {/* 배경 이미지 */}
      <div
        className="pium-slide-bg"
        style={{ backgroundImage: `url('${slide.bg}')` }}
      >
        {/* 빛 애니메이션 — 배경 글로우 */}
        <div className="pium-glow" style={{
          width: 220, height: 220,
          background: "radial-gradient(circle, rgba(16,185,129,0.30) 0%, transparent 70%)",
          bottom: -40, [isLeft ? "right" : "left"]: "30%",
          animationDelay: "0s",
        }} />
        <div className="pium-glow" style={{
          width: 140, height: 140,
          background: "radial-gradient(circle, rgba(107,31,92,0.25) 0%, transparent 70%)",
          top: 20, [isLeft ? "right" : "left"]: "10%",
          animationDelay: "2s",
        }} />
        {/* 노드 반짝임 */}
        <div className="pium-node" style={{
          width: 8, height: 8,
          background: "#10B981",
          boxShadow: "0 0 12px 4px rgba(16,185,129,0.7)",
          top: "35%", [isLeft ? "right" : "left"]: "22%",
          animationDelay: "1.2s",
        }} />
        <div className="pium-node" style={{
          width: 6, height: 6,
          background: "#a78bfa",
          boxShadow: "0 0 10px 3px rgba(167,139,250,0.6)",
          top: "60%", [isLeft ? "right" : "left"]: "38%",
          animationDelay: "2.8s",
        }} />

        {/* 방향별 스크림 */}
        <div className={isLeft ? "pium-scrim-left" : "pium-scrim-right"} />

        {/* 텍스트 영역 */}
        <div className={isLeft ? "pium-text-left" : "pium-text-right"}>
          <h2 style={{
            fontSize: "clamp(20px, 3.6vw, 36px)", fontWeight: 800,
            fontFamily: font, letterSpacing: "0.02em",
            color: "#FFFFFF", margin: "0 0 10px", lineHeight: 1.30,
            textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          }}>
            {renderTitle(slide.title, slide.accent)}
          </h2>
          <p style={{
            fontSize: "clamp(13px, 1.8vw, 16px)", fontWeight: 400,
            fontFamily: font, color: "#D7E3E0",
            margin: "0 0 24px", lineHeight: 1.65,
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}>{slide.sub}</p>
          <div>
            <button
              onClick={() => handleCta(slide.ctaTo)}
              style={{
                padding: "11px 28px", fontSize: 14, fontWeight: 700,
                fontFamily: font, cursor: "pointer",
                background: "#10B981",
                color: "white", border: "none", borderRadius: 50,
                boxShadow: "0 4px 18px rgba(16,185,129,0.45)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(16,185,129,0.60)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(16,185,129,0.45)";
              }}
            >{slide.cta}</button>
          </div>
        </div>
      </div>

      {/* 좌 화살표 */}
      <button
        onClick={() => go(cur - 1)}
        aria-label="이전 슬라이드"
        style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 4, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
          color: "#ffffff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(6px)", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.32)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
      >‹</button>
      {/* 우 화살표 */}
      <button
        onClick={() => go(cur + 1)}
        aria-label="다음 슬라이드"
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 4, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.30)",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
          color: "#ffffff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(6px)", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.32)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
      >›</button>

      {/* 인디케이터 */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        zIndex: 4, display: "flex", gap: 8,
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`슬라이드 ${i + 1}`}
            style={{
              width: i === cur ? 28 : 8, height: 8,
              borderRadius: 99, border: "none", cursor: "pointer",
              background: i === cur ? "#10B981" : "rgba(255,255,255,0.40)",
              transition: "all 0.3s", padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   카테고리 컬러 박스
══════════════════════════════════════ */
function CategoryGrid({ activeKey, onSelect }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.96)",
      borderTop: "1px solid #e5e7eb",
      borderBottom: "1px solid #e5e7eb",
      padding: "28px 0",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        <h3 style={{
          fontSize: 16, fontWeight: 800, color: "#374151",
          margin: "0 0 14px", fontFamily: font, letterSpacing: "-0.2px",
        }}>상위 카테고리</h3>
        <style>{`
          .cat-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          }
          @media (max-width: 768px) {
            .cat-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          }
          @media (max-width: 480px) {
            .cat-grid { grid-template-columns: repeat(2, 1fr); }
          }
        `}</style>
        <div className="cat-grid">
          {CATEGORIES.map(cat => {
            const active = activeKey === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => onSelect(active ? null : cat.key)}
                style={{
                  padding: "14px 14px",
                  borderRadius: 12,
                  background: cat.bg,
                  border: active ? `2px solid ${cat.color}` : "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  boxShadow: active
                    ? `0 4px 16px ${cat.color}30`
                    : "0 1px 4px rgba(0,0,0,0.06)",
                  transition: "all 0.15s",
                  fontFamily: font,
                  outline: "none",
                  minHeight: 52,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 18px ${cat.color}28`;
                  e.currentTarget.style.borderColor = cat.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = active ? `0 4px 16px ${cat.color}30` : "0 1px 4px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = active ? cat.color : "transparent";
                }}
              >
                {/* 카테고리명 — 왼쪽 */}
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: cat.color,
                  lineHeight: 1.3, textAlign: "left",
                  flex: 1,
                }}>{cat.label}</span>

                {/* 아이콘 — 오른쪽 작은 원 */}
                <span style={{
                  width: 30, height: 30, flexShrink: 0,
                  borderRadius: "50%",
                  background: `${cat.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15,
                }}>{cat.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   앱 카드
══════════════════════════════════════ */
function AppCard({ app, onClick }) {
  const cat = CATEGORY_MAP[app.category];
  return (
    <div
      onClick={onClick}
      style={{
        background: "white", borderRadius: 18,
        border: "1.5px solid #f3f4f6",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
    >
      {/* 썸네일 */}
      <div style={{ width: "100%", aspectRatio: "4/3", background: cat ? cat.bg : "#f3f4f6", position: "relative", overflow: "hidden" }}>
        {app.thumbnail_url ? (
          <img src={app.thumbnail_url} alt={app.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 52, background: cat ? cat.bg : "#f0fdf4",
          }}>{cat?.emoji ?? "🌱"}</div>
        )}
        <span style={{
          position: "absolute", top: 10, right: 10,
          padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800,
          fontFamily: font,
          background: app.price_model === "free" ? "#dcfce7" : "#fef9c3",
          color:      app.price_model === "free" ? "#15803d" : "#854d0e",
        }}>
          {app.price_model === "free" ? "무료" : "유료"}
        </span>
      </div>

      {/* 본문 */}
      <div style={{ padding: "14px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {cat && (
          <span style={{
            fontSize: 11, padding: "3px 8px", borderRadius: 99, fontWeight: 700,
            background: cat.bg, color: cat.color, marginBottom: 8,
            display: "inline-block", width: "fit-content", fontFamily: font,
          }}>{cat.emoji} {cat.label}</span>
        )}
        <h3 style={{
          margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#111827",
          fontFamily: font, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
        }}>{app.title}</h3>
        <p style={{
          margin: "0 0 12px", fontSize: 13, color: "#6b7280", lineHeight: 1.5,
          fontFamily: font, flex: 1, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>{app.summary}</p>
        <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, fontFamily: font }}>
          🌱 {app.users?.nickname ?? "메이커"}
        </div>
      </div>
    </div>
  );
}

/* ── 초대장 Placeholder 카드 ── */
function PlaceholderCard() {
  return (
    <Link to="/pium-submit" style={{ textDecoration: "none" }}>
      <div style={{
        background: "white", borderRadius: 18,
        border: "2px dashed #bbf7d0",
        padding: "32px 16px",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", cursor: "pointer", minHeight: 220,
        transition: "all 0.18s",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.background = "#f0fdf4"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.background = "white"; }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
        <p style={{
          fontSize: 13, color: "#6b7280", lineHeight: 1.6,
          margin: "0 0 16px", fontFamily: font, fontWeight: 600,
        }}>이 자리의 주인공을<br/>기다려요</p>
        <span style={{
          fontSize: 13, color: GREEN, fontWeight: 800,
          padding: "7px 18px", border: `1.5px solid ${GREEN}`,
          borderRadius: 50, fontFamily: font,
        }}>내 앱 피우기</span>
      </div>
    </Link>
  );
}

/* ── 앱 그리드 (placeholder 포함) ── */
const GRID_STYLE = `
  .pium-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (min-width: 768px)  { .pium-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1024px) { .pium-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1280px) { .pium-grid { grid-template-columns: repeat(5, 1fr); } }
`;

function AppGrid({ apps, minCards = 5, navigate }) {
  const placeholderCount = Math.max(0, minCards - apps.length);
  return (
    <>
      <style>{GRID_STYLE}</style>
      <div className="pium-grid">
        {apps.map(app => (
          <AppCard key={app.id} app={app} onClick={() => navigate(`/pium-app/${app.id}`)} />
        ))}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <PlaceholderCard key={`ph-${i}`} />
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   섹션 헤더
══════════════════════════════════════ */
function SectionTitle({ emoji, title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{
        fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900,
        color: "#111827", margin: "0 0 4px", fontFamily: font,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span>{emoji}</span> {title}
      </h2>
      {sub && <p style={{ fontSize: 14, color: "#9ca3af", margin: 0, fontFamily: font }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════ */
export default function PiumStorePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [allApps, setAllApps]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchApps() {
      setLoading(true);
      const { data } = await supabase
        .from("apps")
        .select(`
          id, title, summary, thumbnail_url,
          category, price_model, price,
          maker_id, created_at,
          users:maker_id ( nickname )
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!cancelled) {
        setAllApps(data ?? []);
        setLoading(false);
      }
    }
    fetchApps();
    return () => { cancelled = true; };
  }, []);

  const filteredApps = activeCategory
    ? allApps.filter(a => a.category === activeCategory)
    : allApps;

  // 세연's PICK: 나중에 featured 컬럼으로 분리. 지금은 빈 배열
  const pickedApps  = [];
  // 갓 피어난 앱: 최근 5개 (카테고리 필터 미적용)
  const recentApps  = allApps.slice(0, 10);

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: font }}>

      {/* 1. 히어로 캐러셀 */}
      <HeroCarousel />

      {/* 2. 카테고리 박스 */}
      <CategoryGrid activeKey={activeCategory} onSelect={setActiveCategory} />

      {/* 카테고리 선택 시 필터 결과 */}
      {activeCategory && (
        <div id="apps" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <SectionTitle
              emoji={CATEGORY_MAP[activeCategory]?.emoji ?? "🌱"}
              title={CATEGORY_MAP[activeCategory]?.label ?? activeCategory}
              sub={`${filteredApps.length}개의 앱`}
            />
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                fontSize: 13, color: "#6b7280", fontWeight: 600,
                background: "white", border: "1.5px solid #e5e7eb",
                borderRadius: 99, padding: "7px 16px",
                cursor: "pointer", fontFamily: font,
              }}
            >✕ 필터 해제</button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>불러오는 중...</div>
          ) : (
            <AppGrid apps={filteredApps} minCards={5} navigate={navigate} />
          )}
        </div>
      )}

      {/* 3. 세연's PICK 섹션 */}
      {!activeCategory && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 8px" }}>
          <SectionTitle emoji="🌟" title="세연's PICK" sub="편집장이 직접 고른 앱" />
          <AppGrid apps={pickedApps} minCards={5} navigate={navigate} />
        </div>
      )}

      {/* 4. 갓 피어난 앱 섹션 */}
      {!activeCategory && (
        <div id="apps" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px 60px" }}>
          <SectionTitle emoji="🌱" title="갓 피어난 앱" sub="가장 최근에 피움에 올라온 앱" />
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>불러오는 중...</div>
          ) : (
            <AppGrid apps={recentApps} minCards={5} navigate={navigate} />
          )}
        </div>
      )}
    </div>
  );
}
