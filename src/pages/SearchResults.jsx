// 독자용 기사 검색 결과 페이지 — 세연 요청 (2026-11-02)
// 발행된 기사(status='published')의 제목·요약·기자명·본문에서 ilike 매칭.
// 태그는 text[]라 ilike 못 함 → 2차.
// 되돌리기: 이 파일 삭제 + App.jsx 라우트 1줄 삭제.
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const NAVY = "#0d2d52";
const SANS = "'Noto Sans KR', sans-serif";

// supabase or() 는 쉼표·괄호가 특수문자. ilike에서도 % 리터럴 못 섞음.
// 간단한 전처리로 특수문자 제거 (검색어는 100자 이내).
function cleanQuery(q) {
  return (q || "").trim().replace(/[,()%]/g, " ").replace(/\s+/g, " ").slice(0, 100);
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const q = cleanQuery(params.get("q") || "");
  const [input, setInput] = useState(q);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => { setInput(q); }, [q]);

  useEffect(() => {
    let cancelled = false;
    if (q.length < 2) { setRows([]); setErr(""); return; }
    setLoading(true); setErr("");
    (async () => {
      const like = `%${q}%`;
      const or = [
        `title.ilike.${like}`,
        `summary.ilike.${like}`,
        `author_name.ilike.${like}`,
        `content.ilike.${like}`,
      ].join(",");
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, summary, thumbnail_url, published_at, author_name, channels(name, slug)")
        .eq("status", "published")
        .or(or)
        .order("published_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      setLoading(false);
      if (error) { setErr(error.message || "검색 중 오류가 발생했습니다."); setRows([]); return; }
      setRows(Array.isArray(data) ? data : []);
    })();
    return () => { cancelled = true; };
  }, [q]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = cleanQuery(input);
    setParams(next ? { q: next } : {});
  };

  return (
    <main id="main-content" style={{
      fontFamily: SANS, background: "#f7f8fa", color: "#1a1a1a",
      minHeight: "100vh", padding: "24px 16px 56px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 14 }}>
          🔍 기사 검색
        </h1>

        <form onSubmit={onSubmit} role="search" style={{
          display: "flex", gap: 8, marginBottom: 20,
        }}>
          <label htmlFor="search-input" style={{
            position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
            overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0,
          }}>검색어</label>
          <input
            id="search-input"
            type="search"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="제목·요약·기자·본문 검색 (2자 이상)"
            autoFocus
            style={{
              flex: 1, minHeight: 48, padding: "10px 14px",
              fontSize: 17, borderRadius: 6,
              border: `1.5px solid ${NAVY}`, background: "#fff",
              fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <button type="submit" style={{
            minHeight: 48, padding: "10px 20px",
            background: NAVY, color: "#fff",
            fontSize: 16, fontWeight: 800,
            border: "none", borderRadius: 6, cursor: "pointer",
            fontFamily: "inherit", whiteSpace: "nowrap",
          }}>검색</button>
        </form>

        {!q && (
          <div style={{ padding: 24, textAlign: "center", color: "#666", fontSize: 16 }}>
            궁금한 키워드를 입력해주세요.
          </div>
        )}
        {q && q.length < 2 && (
          <div style={{ padding: 24, textAlign: "center", color: "#c0392b", fontSize: 16 }}>
            검색어는 2자 이상 입력해주세요.
          </div>
        )}
        {err && (
          <div role="alert" style={{
            padding: 14, background: "#fff5f5", color: "#c0392b",
            borderLeft: "4px solid #c0392b", marginBottom: 16, fontSize: 15,
          }}>⚠️ {err}</div>
        )}
        {q && q.length >= 2 && !loading && !err && (
          <div style={{ fontSize: 14, color: "#555", marginBottom: 14 }}>
            '<strong style={{ color: NAVY }}>{q}</strong>' 검색 결과 <strong>{rows.length}</strong>건
          </div>
        )}
        {loading && (
          <div style={{ padding: 24, textAlign: "center", color: "#666" }}>검색 중...</div>
        )}

        {!loading && q.length >= 2 && rows.length === 0 && !err && (
          <div style={{
            padding: 32, textAlign: "center", color: "#666",
            background: "#fff", borderRadius: 8, border: "1px solid #e5e5e5",
          }}>
            관련된 기사를 찾지 못했습니다. 다른 키워드로 시도해보세요.
          </div>
        )}

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {rows.map(a => (
            <li key={a.id}>
              <Link to={`/article/${a.slug}`} style={{
                display: "flex", gap: 14, padding: 14,
                background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8,
                textDecoration: "none", color: "inherit",
              }}>
                {a.thumbnail_url && (
                  <img src={a.thumbnail_url} alt=""
                    style={{
                      width: 120, height: 90, objectFit: "cover",
                      borderRadius: 4, flexShrink: 0, background: "#f0f0f0",
                    }}
                    onError={e => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                    {a.channels?.name && <span style={{ fontWeight: 700, color: NAVY, marginRight: 8 }}>{a.channels.name}</span>}
                    {a.author_name && <span style={{ marginRight: 8 }}>{a.author_name}</span>}
                    {a.published_at && <span>{formatDate(a.published_at)}</span>}
                  </div>
                  <h2 style={{
                    fontSize: 18, fontWeight: 800, color: NAVY,
                    margin: 0, lineHeight: 1.4,
                  }}>{a.title}</h2>
                  {a.summary && (
                    <p style={{
                      fontSize: 14, color: "#555", lineHeight: 1.6,
                      margin: "6px 0 0", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{a.summary}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
