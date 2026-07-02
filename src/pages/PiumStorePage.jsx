import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartPulse, Store as StoreIcon, GraduationCap, Sparkles,
  Briefcase, Home, Palette, MapPin, Newspaper, Wrench,
  ChevronDown, ChevronUp, Star, Sprout,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const font  = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN  = "#16a34a";
const PURPLE = "#7c3aed";

/* ── 카테고리 정의 ── */
const CATEGORIES = [
  { key: "health_beauty", label: "건강·뷰티",    Icon: HeartPulse,    color: "#EC4899" },
  { key: "small_biz",     label: "소상공인·창업", Icon: StoreIcon,     color: "#3B82F6" },
  { key: "education",     label: "교육·학습",    Icon: GraduationCap, color: "#F59E0B" },
  { key: "ai_tool",       label: "AI 활용",      Icon: Sparkles,      color: "#A78BFA" },
  { key: "productivity",  label: "업무·생산성",  Icon: Briefcase,     color: "#818CF8" },
  { key: "lifestyle",     label: "생활·편의",    Icon: Home,          color: "#34D399" },
  { key: "hobby",         label: "취미·창작",    Icon: Palette,       color: "#FB923C" },
  { key: "community",     label: "지역·커뮤니티", Icon: MapPin,        color: "#2DD4BF" },
  { key: "media",         label: "정보·미디어",  Icon: Newspaper,     color: "#94A3B8" },
  { key: "expert_tool",   label: "전문가 도구",  Icon: Wrench,        color: "#C084FC" },
];
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

/* ── 캐러셀 슬라이드 ── */
const SLIDES = [
  {
    title:      "경험이 기술을 입다",
    accent:     "기술",
    accentGrad: "linear-gradient(90deg,#60A5FA,#3B82F6)",
    sub:        "비개발자가 만든 진짜 웹앱",
    cta:        "둘러보기 →",
    ctaTo:      "#apps",
    btnColor:   "#3B82F6",
    btnGlow:    "rgba(59,130,246,0.55)",
    circuit:    "/pium-circuit-1.jpg",
  },
  {
    title:      "앱보다 사람입니다",
    accent:     "사람",
    accentGrad: "linear-gradient(90deg,#34D399,#10B981)",
    sub:        "이 앱을 피운 메이커를 만나보세요",
    cta:        "메이커 만나기 →",
    ctaTo:      "/pium-submit",
    btnColor:   "#10B981",
    btnGlow:    "rgba(16,185,129,0.55)",
    circuit:    "/pium-circuit-2.jpg",
  },
  {
    title:      "당신의 경험도 피어납니다",
    accent:     "경험",
    accentGrad: "linear-gradient(90deg,#C084FC,#8B5CF6)",
    sub:        "지금 둘러보고, 직접 피워보세요",
    cta:        "내 앱 피우기 →",
    ctaTo:      "/pium-submit",
    btnColor:   "#8B5CF6",
    btnGlow:    "rgba(139,92,246,0.55)",
    circuit:    "/pium-circuit-3.jpg",
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

  /* 회로 SVG 오버레이 */
  .pium-circuit-svg {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 1;
    opacity: 0.38;
  }

  /* 회로 선 흐르는 빛 */
  @keyframes pium-trace-flow {
    0%   { stroke-dashoffset: 300; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { stroke-dashoffset: 0;   opacity: 0; }
  }
  /* 노드 반짝임 */
  @keyframes pium-dot-pulse {
    0%, 100% { r: 2.5; opacity: 0.2; }
    50%      { r: 4;   opacity: 1;   }
  }
  @keyframes pium-dot-flash {
    0%, 85%, 100% { opacity: 0.15; }
    90%           { opacity: 1; filter: drop-shadow(0 0 4px #10B981); }
  }
  .pium-trace {
    fill: none;
    stroke-dasharray: 300;
    animation: pium-trace-flow 4s ease-in-out infinite;
  }
  .pium-dot-pulse  { animation: pium-dot-pulse 3s ease-in-out infinite; }
  .pium-dot-flash  { animation: pium-dot-flash 4s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .pium-glow, .pium-node,
    .pium-trace, .pium-dot-pulse, .pium-dot-flash { animation: none !important; }
    .pium-circuit-svg { opacity: 0.18; }
  }

  .pium-carousel-wrap {
    position: relative; overflow: hidden;
    border-radius: 20px; margin: 20px 16px 0;
    box-shadow: 0 6px 32px rgba(0,0,0,0.30);
    background: #0a0f22;
  }
  .pium-slide-bg {
    position: relative; overflow: hidden;
    min-height: clamp(360px, 42vw, 480px);
  }

  /* 강조 단어 그라디언트 텍스트 */
  .pium-accent {
    background: var(--pium-accent-grad, linear-gradient(90deg,#34D399,#10B981));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* 회로 배경 이미지 */
  .pium-circuit-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center center;
    pointer-events: none;
    z-index: 0;
  }

  /* 스크림: 왼쪽 글씨 가독성 */
  .pium-scrim {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(
      to right,
      rgba(0,0,0,0.65) 0%,
      rgba(0,0,0,0.42) 35%,
      rgba(0,0,0,0.08) 60%,
      transparent 80%
    );
  }

  /* 텍스트 전체 래퍼 */
  .pium-text-overlay {
    position: absolute; inset: 0; z-index: 2;
    display: flex; align-items: center;
    padding: 0 60px;
  }
  /* 텍스트 블록: 항상 왼쪽 */
  .pium-text-block {
    max-width: 420px;
    display: flex; flex-direction: column; justify-content: center;
    padding: 40px 0 60px;
    text-align: left;
    margin-right: auto;
  }

  /* 은은한 빛점 */
  .pium-node {
    position: absolute; border-radius: 50%; pointer-events: none; z-index: 2;
    animation: pium-node-blink 3.5s ease-in-out infinite;
  }

  /* 모바일 */
  @media (max-width: 640px) {
    .pium-slide-bg { min-height: 0; }
    .pium-slide-bg::before { content: ''; display: block; padding-top: 56%; }
    .pium-scrim {
      background: linear-gradient(
        to right,
        rgba(0,0,0,0.72) 0%,
        rgba(0,0,0,0.45) 50%,
        rgba(0,0,0,0.15) 80%,
        transparent 100%
      );
    }
    .pium-text-overlay { padding: 0 20px; }
    .pium-text-block {
      max-width: 78%;
      padding: 20px 0 52px;
    }
  }
`;

function renderTitle(title, accent) {
  if (!accent) return <span>{title}</span>;
  const parts = title.split(accent);
  return (
    <>
      {parts[0]}
      <span className="pium-accent">{accent}</span>
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
    timerRef.current = setInterval(() => go(cur + 1), 5500);  // 5.5s 자동 넘김
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

  return (
    <div className="pium-carousel-wrap">
      <style>{CAROUSEL_CSS}</style>

      {/* CSS 변수로 슬라이드별 강조색 주입 */}
      <div className="pium-slide-bg" style={{ "--pium-accent-grad": slide.accentGrad }}>

        {/* 레이어 0 — 회로 배경 이미지 */}
        <img
          src={slide.circuit}
          alt=""
          className="pium-circuit-img"
        />

        {/* 레이어 1 — 스크림 (왼쪽 어둡게) */}
        <div className="pium-scrim" />

        {/* 레이어 2 — 은은한 빛점 */}
        <div className="pium-node" style={{
          width: 7, height: 7,
          background: slide.btnColor,
          boxShadow: `0 0 10px 3px ${slide.btnGlow}`,
          top: "28%", left: "58%",
          animationDelay: "0.8s",
        }} />
        <div className="pium-node" style={{
          width: 5, height: 5,
          background: slide.btnColor,
          boxShadow: `0 0 8px 2px ${slide.btnGlow}`,
          top: "62%", left: "72%",
          animationDelay: "2.4s",
        }} />

        {/* 레이어 3 — 텍스트 (z-index: 2) */}
        <div className="pium-text-overlay">
          <div className="pium-text-block">
            <h2 style={{
              fontSize: "clamp(22px, 3.8vw, 46px)", fontWeight: 800,
              fontFamily: font, letterSpacing: "0.02em",
              color: "#FFFFFF", margin: "0 0 12px", lineHeight: 1.25,
              textShadow: "0 2px 16px rgba(0,0,0,0.60)",
            }}>
              {renderTitle(slide.title, slide.accent)}
            </h2>
            <p style={{
              fontSize: "clamp(13px, 1.8vw, 16px)", fontWeight: 400,
              fontFamily: font, color: "rgba(220,235,255,0.85)",
              margin: "0 0 28px", lineHeight: 1.65,
              textShadow: "0 1px 8px rgba(0,0,0,0.50)",
            }}>{slide.sub}</p>
            <div>
              <button
                onClick={() => handleCta(slide.ctaTo)}
                style={{
                  padding: "12px 30px", fontSize: 14, fontWeight: 700,
                  fontFamily: font, cursor: "pointer",
                  background: slide.btnColor,
                  color: "white", border: "none", borderRadius: 50,
                  boxShadow: `0 4px 20px ${slide.btnGlow}`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow = `0 6px 28px ${slide.btnGlow}`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = `0 4px 20px ${slide.btnGlow}`;
                }}
              >{slide.cta}</button>
            </div>
          </div>
        </div>
      </div>

      {/* 좌 화살표 */}
      <button
        onClick={() => go(cur - 1)}
        aria-label="이전 슬라이드"
        style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 5, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
          color: "#ffffff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
      >‹</button>

      {/* 우 화살표 */}
      <button
        onClick={() => go(cur + 1)}
        aria-label="다음 슬라이드"
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 5, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
          color: "#ffffff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)", transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
      >›</button>

      {/* 인디케이터 */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
        zIndex: 5, display: "flex", gap: 8,
      }}>
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`슬라이드 ${i + 1}`}
            style={{
              width: i === cur ? 28 : 8, height: 8,
              borderRadius: 99, border: "none", cursor: "pointer",
              background: i === cur ? s.btnColor : "rgba(255,255,255,0.35)",
              transition: "all 0.3s", padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   카테고리 다크 섹션
══════════════════════════════════════ */
const CAT_CSS = `
  .cat-section {
    background: #0e2a30;
    padding: 32px 0 48px;
    /* 아래쪽으로 밝은 배경 그라데이션 전환 */
    border-bottom: none;
  }
  .cat-section::after {
    content: '';
    display: block;
    height: 56px;
    background: linear-gradient(to bottom, #0e2a30, #FAFAFB);
    margin-top: 32px;
  }
  .cat-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  @media (max-width: 900px) {
    .cat-grid { grid-template-columns: repeat(3, 1fr); gap: 9px; }
  }
  @media (max-width: 520px) {
    .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  }
  .cat-card {
    padding: 13px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.055);
    border: 1.5px solid rgba(255,255,255,0.10);
    cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px;
    transition: transform .18s, background .18s, border-color .18s, box-shadow .18s;
    font-family: inherit;
    outline: none;
    min-height: 52px;
    text-align: left;
    width: 100%;
  }
  .cat-card:hover {
    transform: translateY(-3px);
    background: rgba(255,255,255,0.10);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  .cat-card.active {
    background: rgba(255,255,255,0.10);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  @media (prefers-reduced-motion: reduce) {
    .cat-card, .cat-card:hover { transform: none !important; transition: background .18s, border-color .18s; }
  }
  .cat-more-btn {
    width: 100%; margin-top: 14px;
    padding: 14px 0; border-radius: 12px;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.14);
    color: #ffffff; font-size: 16px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: border-color .18s, color .18s, background .18s;
  }
  .cat-more-btn:hover {
    border-color: #10B981; color: #10B981; background: rgba(16,185,129,0.08);
  }
`;

const SHOW_INIT = 6;

function CategoryGrid({ activeKey, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, SHOW_INIT);
  const hidden = CATEGORIES.length - SHOW_INIT;

  return (
    <div className="cat-section">
      <style>{CAT_CSS}</style>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <h3 style={{
          fontSize: 16, fontWeight: 800, color: "#ffffff",
          margin: "0 0 16px", fontFamily: font, letterSpacing: "-0.2px",
        }}>상위 카테고리</h3>

        <div className="cat-grid">
          {visible.map(cat => {
            const active = activeKey === cat.key;
            const { Icon } = cat;
            return (
              <button
                key={cat.key}
                className={`cat-card${active ? " active" : ""}`}
                onClick={() => onSelect(active ? null : cat.key)}
                style={{
                  borderColor: active ? cat.color : undefined,
                  boxShadow: active ? `0 0 0 1px ${cat.color}66, 0 6px 20px rgba(0,0,0,0.25)` : undefined,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cat.color;
                  e.currentTarget.querySelector(".cat-chip").style.background = cat.color;
                  e.currentTarget.querySelector(".cat-chip").style.color = "#fff";
                  e.currentTarget.querySelector(".cat-label").style.color = cat.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = active ? cat.color : "rgba(255,255,255,0.10)";
                  e.currentTarget.querySelector(".cat-chip").style.background = "rgba(255,255,255,0.09)";
                  e.currentTarget.querySelector(".cat-chip").style.color = "#AEB7C2";
                  e.currentTarget.querySelector(".cat-label").style.color = active ? cat.color : "#D8DEE6";
                }}
              >
                <span className="cat-label" style={{
                  fontSize: 13, fontWeight: 700,
                  color: active ? cat.color : "#D8DEE6",
                  lineHeight: 1.3, flex: 1,
                  transition: "color .18s",
                }}>{cat.label}</span>

                <span className="cat-chip" style={{
                  width: 36, height: 36, flexShrink: 0,
                  borderRadius: "50%",
                  background: active ? cat.color : "rgba(255,255,255,0.09)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: active ? "#fff" : "#AEB7C2",
                  transition: "background .18s, color .18s",
                }}>
                  <Icon size={16} strokeWidth={1.9} color="currentColor" />
                </span>
              </button>
            );
          })}
        </div>

        {/* 더보기 / 접기 버튼 */}
        <button
          className="cat-more-btn"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>접기 <ChevronUp size={18} /></>
          ) : (
            <>카테고리 더 보기 <span style={{ opacity: 0.7 }}>+{hidden}</span> <ChevronDown size={18} /></>
          )}
        </button>
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
const PLACEHOLDER_CSS = `
  @keyframes ph-breathe {
    0%, 100% { opacity: 0.38; filter: drop-shadow(0 0 0px #10B981); }
    50%       { opacity: 0.52; filter: drop-shadow(0 0 6px rgba(16,185,129,0.35)); }
  }
  .ph-logo {
    animation: ph-breathe 3.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .ph-logo { animation: none !important; opacity: 0.40 !important; }
  }
`;
function PlaceholderCard() {
  return (
    <Link to="/pium-submit" style={{ textDecoration: "none" }}>
      <style>{PLACEHOLDER_CSS}</style>
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
        <img
          src="/pium-logo.png"
          alt="피움"
          className="ph-logo"
          style={{
            height: 40, width: "auto", objectFit: "contain",
            marginBottom: 12, mixBlendMode: "multiply",
          }}
        />
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
  @media (min-width: 1280px) { .pium-grid { grid-template-columns: repeat(4, 1fr); } }
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
   밝은 배경 회로 — PICK·갓 피어난 섹션
══════════════════════════════════════ */
const BRIGHT_CSS = `
  .bc-wrap {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .bc-line {
    fill: none; stroke: #10B981;
    stroke-linecap: round;
  }
  @keyframes bc-flash {
    0%, 80%, 100% { opacity: 0.26; }
    88%           { opacity: 0.88; filter: drop-shadow(0 0 7px #10B981); }
  }
  @keyframes bc-pulse {
    0%, 100% { r: 2.5px; opacity: 0.28; }
    50%      { r: 5px;   opacity: 0.70; }
  }
  .bc-dot-flash { animation: bc-flash 4.5s ease-in-out infinite; }
  .bc-dot-pulse { animation: bc-pulse 3.2s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .bc-dot-flash, .bc-dot-pulse { animation: none !important; opacity: 0.12 !important; }
  }
`;

function BrightCircuitBg() {
  return (
    <div className="bc-wrap">
      <svg
        width="100%" height="100%"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── 수평/수직 트레이스 ── */}
        <path className="bc-line" d="M0 80 L180 80 L180 160 L320 160 L320 80 L500 80" strokeWidth="1.4" opacity="0.32"/>
        <path className="bc-line" d="M500 80 L500 200 L640 200" strokeWidth="1.2" opacity="0.28"/>
        <path className="bc-line" d="M640 200 L800 200 L800 120 L1000 120 L1000 80 L1200 80" strokeWidth="1.4" opacity="0.32"/>

        <path className="bc-line" d="M0 260 L100 260 L100 340 L240 340" strokeWidth="1.2" opacity="0.26"/>
        <path className="bc-line" d="M240 340 L240 420 L380 420 L380 340 L560 340" strokeWidth="1.4" opacity="0.30"/>
        <path className="bc-line" d="M560 340 L560 260 L720 260 L720 340 L900 340" strokeWidth="1.2" opacity="0.27"/>
        <path className="bc-line" d="M900 340 L900 260 L1100 260 L1100 340 L1200 340" strokeWidth="1.3" opacity="0.28"/>

        <path className="bc-line" d="M0 500 L160 500 L160 580 L300 580" strokeWidth="1.2" opacity="0.24"/>
        <path className="bc-line" d="M300 580 L300 500 L500 500 L500 580 L680 580 L680 500 L860 500" strokeWidth="1.3" opacity="0.28"/>
        <path className="bc-line" d="M860 500 L860 580 L1040 580 L1040 500 L1200 500" strokeWidth="1.2" opacity="0.26"/>

        {/* ── 세로 연결선 ── */}
        <path className="bc-line" d="M180 80 L180 0" strokeWidth="1" opacity="0.22"/>
        <path className="bc-line" d="M320 160 L320 260" strokeWidth="1" opacity="0.22"/>
        <path className="bc-line" d="M640 200 L640 340" strokeWidth="1" opacity="0.22"/>
        <path className="bc-line" d="M900 340 L900 500" strokeWidth="1" opacity="0.22"/>
        <path className="bc-line" d="M100 260 L100 0" strokeWidth="1" opacity="0.20"/>
        <path className="bc-line" d="M1000 120 L1000 0" strokeWidth="1" opacity="0.20"/>
        <path className="bc-line" d="M560 340 L560 500" strokeWidth="1" opacity="0.22"/>
        <path className="bc-line" d="M300 580 L300 700" strokeWidth="1" opacity="0.20"/>
        <path className="bc-line" d="M680 580 L680 700" strokeWidth="1" opacity="0.20"/>

        {/* ── 반짝 노드 (bc-dot-flash) ── */}
        {[
          {cx:180, cy:80,  d:"0s"},   {cx:320, cy:160, d:"0.9s"},
          {cx:500, cy:80,  d:"1.8s"}, {cx:640, cy:200, d:"0.5s"},
          {cx:800, cy:200, d:"2.2s"}, {cx:240, cy:340, d:"1.3s"},
          {cx:560, cy:340, d:"2.7s"}, {cx:900, cy:340, d:"0.7s"},
          {cx:560, cy:500, d:"1.6s"}, {cx:860, cy:500, d:"3.0s"},
          {cx:300, cy:580, d:"2.0s"}, {cx:680, cy:580, d:"1.1s"},
        ].map(({cx, cy, d}, i) => (
          <circle key={i} className="bc-dot-flash"
            cx={cx} cy={cy} r="3.5" fill="#10B981"
            style={{animationDelay: d}} />
        ))}

        {/* ── 호흡 노드 (bc-dot-pulse) ── */}
        {[
          {cx:100,  cy:260, d:"0s",   c:"#34D399"},
          {cx:380,  cy:420, d:"1.2s", c:"#10B981"},
          {cx:720,  cy:260, d:"2.4s", c:"#6EE7B7"},
          {cx:1100, cy:260, d:"0.8s", c:"#34D399"},
          {cx:160,  cy:500, d:"1.9s", c:"#10B981"},
          {cx:1040, cy:500, d:"3.1s", c:"#6EE7B7"},
        ].map(({cx, cy, d, c}, i) => (
          <circle key={i} className="bc-dot-pulse"
            cx={cx} cy={cy} r="2.5" fill={c}
            style={{animationDelay: d}} />
        ))}

        {/* ── 작은 배경 점 ── */}
        {[
          [640,80],[800,120],[100,160],[380,340],[1100,340],
          [500,500],[1040,580],[240,500],[720,500]
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2" fill="#10B981" opacity="0.22"/>
        ))}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   섹션 헤더
══════════════════════════════════════ */
const SECTION_ICONS = {
  pick:   <Star   size={22} strokeWidth={2}   color="#10B981" fill="#10B98122" />,
  sprout: <Sprout size={22} strokeWidth={1.8} color="#16a34a" />,
};

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 900,
        color: "#111827", margin: "0 0 5px", fontFamily: font,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {SECTION_ICONS[icon] ?? null}
        {title}
      </h2>
      {sub && (
        <p style={{
          fontSize: 13, color: "#6b7280", margin: 0,
          fontFamily: font, paddingLeft: 32,
        }}>{sub}</p>
      )}
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
  // 갓 피어난 앱: 최근 4개 (카테고리 필터 미적용)
  const recentApps  = allApps.slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: font }}>

      {/* 1. 히어로 캐러셀 */}
      <HeroCarousel />

      {/* 캐러셀↔카테고리 여백 */}
      <div style={{ height: "clamp(24px, 4vw, 56px)", background: "#FAFAFB" }} />

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
            <AppGrid apps={filteredApps} minCards={4} navigate={navigate} />
          )}
        </div>
      )}

      {/* 3·4 — PIUM's PICK + 갓 피어난 앱 */}
      {!activeCategory && (
        <>
          <style>{BRIGHT_CSS}</style>

          {/* 3. PIUM's PICK — 흰색 배경 */}
          <div style={{ position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
            <BrightCircuitBg />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 16px 36px" }}>
              <SectionTitle icon="pick" title={"PIUM's PICK"} sub="피움이 직접 고른 앱" />
              <AppGrid apps={pickedApps} minCards={4} navigate={navigate} />
            </div>
          </div>

          {/* 섹션 사이 여백 — 회로 없는 중립 구간 */}
          <div style={{ height: "clamp(28px, 4vw, 48px)", background: "#FAFAFB" }} />

          {/* 4. 갓 피어난 앱 — 진한 민트 배경 */}
          <div id="apps" style={{ position: "relative", overflow: "hidden", background: "#DCEDE3" }}>
            <BrightCircuitBg />
            <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 16px 60px" }}>
              <SectionTitle icon="sprout" title="갓 피어난 앱" sub="가장 최근에 피움에 올라온 앱" />
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>불러오는 중...</div>
              ) : (
                <AppGrid apps={recentApps} minCards={4} navigate={navigate} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
