import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

const font  = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN = "#10B981";

/* ══════════════════════════════════════
   하드코딩 앱 데이터 (DB 연동 전 임시)
══════════════════════════════════════ */
const APPS = {
  eummedia: {
    slug:          "eummedia",
    title:         "이음미디어",
    categoryLabel: "정보·미디어",
    tagline:       "세상과 당신을 잇는 인터넷신문",
    thumbnail:     "/eummedia-preview.png",
    appUrl:        "https://eummedia.kr",
    makerArticleUrl: "https://www.eummedia.kr/article/article-ofkvp4bo",
    makerArticle: {
      thumbnail: "https://avbsniuthpcejjcdeiyw.supabase.co/storage/v1/object/public/article-images/39b41153-941a-4f29-a970-d4695478fd56/1783041226984.png",
      title: "비개발자가 만든 웹앱, '피움'에서 꽃핀다 — 바이브코딩으로 두피전문가가 3주 만에 신문을 지은 이유",
    },
    priceModel:    "free",
    tags:          ["인터넷신문", "로컬", "미디어", "비개발자"],
    maker: {
      name: "정세연",
      bio:  "닥터리부트 두피관리센터 대표 · 두피전문가 27년 · 이음미디어 편집국장 · AI에이전트전문가 1급",
    },
    whatItDoes: [
      {
        icon: "🗞️",
        title: "온라인 매거진",
        desc: "지역·문화·사람 이야기를 담는 온라인 매거진. 이음매거진·피플·로컬·에듀·뷰·트렌드·보이스 등 섹션 운영.",
      },
    ],
    searchStrong: [
      "SSG·사이트맵·RSS·OG 메타로 구글·네이버 검색에 잘 잡힘",
      "기사가 섹션별로 명확히 구분돼 사람이 읽기 편하고 AI(검색·챗봇)도 내용을 잘 이해해 인용함",
      "기사 올리면 검색·AI로 독자 유입. 시스템 구매 시 이 \"잘 잡히는 구조\"까지 그대로 따라옴",
    ],
    howToUse: [
      "링크 접속해 기사 열람",
      "카카오 로그인 하나로 이음미디어·피움 함께 이용",
    ],
    whoFor: [
      "지역 소식·사람 이야기가 궁금한 분",
      "\"나도 이런 인터넷신문을 갖고 싶다\"는 분",
    ],
  },

  jungseyeon: {
    slug:          "jungseyeon",
    title:         "정세연 프로필",
    categoryLabel: "전문가 도구",
    tagline:       "전문가 프로필 페이지",
    thumbnail:     "/jungseyeon-director.jpg.png",
    appUrl:        "https://talmo2080.github.io/jungseyeon/",
    makerArticleUrl: "https://www.eummedia.kr/article/article-ofkvp4bo",
    makerArticle: {
      thumbnail: "https://avbsniuthpcejjcdeiyw.supabase.co/storage/v1/object/public/article-images/39b41153-941a-4f29-a970-d4695478fd56/1783041226984.png",
      title: "비개발자가 만든 웹앱, '피움'에서 꽃핀다 — 바이브코딩으로 두피전문가가 3주 만에 신문을 지은 이유",
    },
    priceModel:    "free",
    tags:          ["프로필", "전문가", "1인사업가", "비개발자"],
    maker: {
      name: "정세연",
      bio:  "닥터리부트 두피관리센터 대표 · 두피전문가 27년 · 이음미디어 편집국장 · AI에이전트전문가 1급",
    },
    whatItDoes: [
      {
        icon: "🪪",
        title: "전문가 프로필",
        desc: "경력·철학·전문 분야·연락처를 한 페이지에 담은 전문가 프로필. 두피전문가와 편집국장이라는 두 정체성을 \"사람에 닿는 일\"이라는 하나의 시선으로 엮음.",
      },
    ],
    searchStrong: [
      "반응형 원페이지 — 모바일·PC 모두 깔끔하게",
      "두 정체성을 하나로 잇는 스토리 구조로 방문자가 '이 사람이 누구인지' 한눈에 파악",
      "상담·문의 폼 내장 — 방문자가 바로 연락할 수 있음",
    ],
    howToUse: [
      "링크 접속해 프로필 열람",
      "하단 폼으로 상담·문의",
    ],
    whoFor: [
      "여러 일을 하는 전문가·강사·1인 사업가",
      "자기 브랜드를 온라인에 담고 싶은 분",
    ],
  },
};

/* ── CSS ── */
const PAGE_CSS = `
  .pd-wrap {
    background: #0a0f1e;
    min-height: 100vh;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    color: #e2e8f0;
  }

  /* 히어로: PC 2단 / 모바일 1단 */
  .pd-hero {
    max-width: 1100px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 48px; align-items: start;
    padding: 36px 24px 56px;
  }
  @media (max-width: 768px) {
    .pd-hero { grid-template-columns: 1fr; gap: 24px; padding: 20px 16px 32px; }
  }

  /* 미리보기 */
  .pd-preview {
    border-radius: 18px; overflow: hidden;
    aspect-ratio: 16/10;
    background: linear-gradient(135deg, #0f1f3d 0%, #162032 100%);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .pd-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }

  /* 버튼 */
  .pd-btn-primary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 16px; border-radius: 12px; border: none;
    font-size: 16px; font-weight: 800; cursor: pointer;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    background: linear-gradient(135deg, #10B981, #059669);
    color: white; text-decoration: none;
    box-shadow: 0 4px 24px rgba(16,185,129,0.40);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .pd-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(16,185,129,0.55); }

  .pd-btn-outline {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px; border-radius: 12px;
    border: 1.5px solid #10B981; font-size: 14px; font-weight: 700;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    background: transparent; color: #10B981; text-decoration: none;
    transition: background 0.15s;
  }
  .pd-btn-outline:hover { background: rgba(16,185,129,0.08); }

  .pd-btn-disabled {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.08); font-size: 14px; font-weight: 600;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
    background: transparent; color: #334155; cursor: not-allowed;
  }

  /* 섹션 */
  .pd-section { max-width: 1100px; margin: 0 auto; padding: 0 24px 52px; }
  @media (max-width: 768px) { .pd-section { padding: 0 16px 40px; } }

  .pd-section-title {
    font-size: clamp(16px, 2.4vw, 20px); font-weight: 900;
    color: #f1f5f9; margin: 0 0 20px;
    display: flex; align-items: center; gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  /* 기능 카드 그리드 */
  .pd-feature-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
  }
  @media (max-width: 640px) { .pd-feature-grid { grid-template-columns: 1fr; } }

  .pd-feature-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 22px 20px;
  }

  /* 누구에게 그리드 */
  .pd-who-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
  }
  @media (max-width: 480px) { .pd-who-grid { grid-template-columns: 1fr; } }

  /* 메이커 카드 */
  .pd-maker-card {
    background: rgba(16,185,129,0.06);
    border: 1.5px solid rgba(16,185,129,0.22);
    border-radius: 20px; padding: 28px;
    display: flex; align-items: center; gap: 20px;
  }
  @media (max-width: 640px) {
    .pd-maker-card { flex-direction: column; align-items: flex-start; gap: 16px; }
  }

  /* 모바일 하단 고정 CTA */
  .pd-mobile-cta {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0;
    padding: 12px 16px 20px;
    background: rgba(10,15,30,0.96);
    backdrop-filter: blur(14px);
    border-top: 1px solid rgba(255,255,255,0.07);
    z-index: 200;
  }
  @media (max-width: 768px) { .pd-mobile-cta { display: block; } }
`;

/* ── 404 ── */
function NotFound() {
  return (
    <div style={{
      minHeight: "60vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: font, color: "#94a3b8", padding: 24,
    }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 18, marginBottom: 16, color: "#e2e8f0" }}>앱을 찾을 수 없어요</p>
        <Link to="/pium-store" style={{ color: GREEN, textDecoration: "none", fontWeight: 700 }}>
          ← 스토어로 돌아가기
        </Link>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function PiumAppDetailPage() {
  const { slug } = useParams();
  const app = APPS[slug];

  if (!app) return <NotFound />;

  return (
    <div className="pd-wrap">
      <style>{PAGE_CSS}</style>

      {/* 뒤로가기 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 0" }}>
        <Link to="/pium-store" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#64748b", textDecoration: "none", fontSize: 14,
          fontWeight: 600, fontFamily: font,
        }}>
          <ArrowLeft size={15} /> 스토어로 돌아가기
        </Link>
      </div>

      {/* ══ 히어로 ══ */}
      <div className="pd-hero">

        {/* 좌: 미리보기 */}
        <div className="pd-preview">
          {app.thumbnail ? (
            <img src={app.thumbnail} alt={app.title} />
          ) : (
            <div style={{ textAlign: "center", color: "#334155" }}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>🌐</div>
              <p style={{ fontSize: 13, margin: 0, fontFamily: font }}>미리보기 준비 중</p>
            </div>
          )}
        </div>

        {/* 우: 정보 + 버튼 */}
        <div>
          {/* 카테고리 뱃지 */}
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 800,
            color: GREEN, background: "rgba(16,185,129,0.12)",
            padding: "4px 12px", borderRadius: 99, marginBottom: 12,
            fontFamily: font, letterSpacing: "0.04em",
          }}>{app.categoryLabel}</span>

          {/* 앱 이름 */}
          <h1 style={{
            fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900,
            color: "#f8fafc", margin: "0 0 10px", fontFamily: font,
            lineHeight: 1.2, letterSpacing: "-0.02em",
          }}>{app.title}</h1>

          {/* 한 줄 소개 */}
          <p style={{
            fontSize: "clamp(14px, 1.8vw, 17px)", color: "#94a3b8",
            margin: "0 0 18px", fontFamily: font, lineHeight: 1.6,
          }}>{app.tagline}</p>

          {/* 무료 뱃지 + 태그 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "4px 10px",
              borderRadius: 99, background: "#dcfce7", color: "#15803d", fontFamily: font,
            }}>열람 무료</span>
            {app.tags.map(t => (
              <span key={t} style={{
                fontSize: 12, fontWeight: 600, padding: "4px 10px",
                borderRadius: 99, background: "rgba(255,255,255,0.07)",
                color: "#64748b", fontFamily: font,
              }}>#{t}</span>
            ))}
          </div>

          {/* 버튼 3개 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href={app.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pd-btn-primary"
            >
              <ExternalLink size={17} /> 바로 보기
            </a>
            <div className="pd-btn-disabled">
              시스템 구매
              <span style={{
                fontSize: 11, color: "#1e3a5f",
                background: "rgba(255,255,255,0.06)",
                padding: "2px 8px", borderRadius: 99,
              }}>이음미디어는 복제판매 없음</span>
            </div>
            <div className="pd-btn-disabled">
              비슷한 앱 의뢰하기
              <span style={{
                fontSize: 11, color: "#1e3a5f",
                background: "rgba(255,255,255,0.06)",
                padding: "2px 8px", borderRadius: 99,
              }}>준비 중 (곧 열려요)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* ══ 이런 걸 해줘요 ══ */}
      <div className="pd-section" style={{ paddingTop: 44 }}>
        <h2 className="pd-section-title">
          <span style={{ color: GREEN, fontSize: 20 }}>✦</span> 이런 걸 해줘요
        </h2>
        <div className="pd-feature-grid">
          {app.whatItDoes.map((f, i) => (
            <div key={i} className="pd-feature-card">
              <div style={{ fontSize: 30, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{
                fontSize: 15, fontWeight: 800, color: "#f1f5f9",
                margin: "0 0 8px", fontFamily: font,
              }}>{f.title}</h3>
              <p style={{
                fontSize: 13, color: "#64748b", margin: 0,
                lineHeight: 1.65, fontFamily: font,
              }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 검색·AI에 강해요 ══ */}
      {app.searchStrong && (
        <div className="pd-section">
          <h2 className="pd-section-title">
            <span style={{ color: GREEN, fontSize: 20 }}>🔍</span> 검색·AI에 강해요 <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.12)", padding: "2px 10px", borderRadius: 99 }}>노출깡패</span>
          </h2>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {app.searchStrong.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ color: GREEN, fontSize: 16, flexShrink: 0, paddingTop: 1 }}>✦</span>
                <p style={{
                  fontSize: 14, color: "#cbd5e1", margin: 0,
                  lineHeight: 1.7, fontFamily: font,
                }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ 이렇게 쓰면 돼요 ══ */}
      <div className="pd-section">
        <h2 className="pd-section-title">
          <span style={{ color: GREEN, fontSize: 20 }}>▷</span> 이렇게 쓰면 돼요
        </h2>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: "24px 28px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {app.howToUse.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: "rgba(16,185,129,0.12)",
                border: "1.5px solid rgba(16,185,129,0.30)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: GREEN, fontFamily: font,
              }}>{i + 1}</div>
              <p style={{
                fontSize: 14, color: "#cbd5e1", margin: 0,
                lineHeight: 1.7, fontFamily: font, paddingTop: 4,
              }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 누구에게 좋아요 ══ */}
      <div className="pd-section">
        <h2 className="pd-section-title">
          <span style={{ color: GREEN, fontSize: 20 }}>♡</span> 누구에게 좋아요
        </h2>
        <div className="pd-who-grid">
          {app.whoFor.map((w, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "16px 18px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ color: GREEN, fontSize: 18, flexShrink: 0 }}>✓</span>
              <p style={{
                fontSize: 13, color: "#94a3b8", margin: 0,
                lineHeight: 1.5, fontFamily: font,
              }}>{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 메이커 카드 ══ */}
      <div className="pd-section">
        <h2 className="pd-section-title">
          <span style={{ color: GREEN, fontSize: 20 }}>🌱</span> 메이커
        </h2>
        {/* 메이커 + 기사 통합 카드 */}
        <div className="pd-maker-card" style={{ flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}>

          {/* 프로필 영역 */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 28px 20px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", flexShrink: 0,
              background: "rgba(16,185,129,0.12)",
              border: "2px solid rgba(16,185,129,0.30)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>🌿</div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: 17, fontWeight: 800, color: "#f1f5f9",
                margin: "0 0 5px", fontFamily: font,
              }}>{app.maker.name}</p>
              <p style={{
                fontSize: 12, color: "#64748b", margin: 0,
                lineHeight: 1.65, fontFamily: font,
              }}>{app.maker.bio}</p>
            </div>
          </div>

          {/* 기사 미리보기 (구분선 + 클릭 영역) */}
          {app.makerArticleUrl && app.makerArticle && (
            <a
              href={app.makerArticleUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <img
                  src={app.makerArticle.thumbnail}
                  alt={app.makerArticle.title}
                  style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
                <div style={{ padding: "14px 28px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#475569", margin: "0 0 6px", fontFamily: font }}>🗞️ 이음미디어 기사</p>
                    <p style={{
                      fontSize: 13, fontWeight: 700, color: "#cbd5e1",
                      margin: 0, fontFamily: font, lineHeight: 1.6,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{app.makerArticle.title}</p>
                  </div>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 700, fontFamily: font, flexShrink: 0, paddingTop: 18 }}>보기 →</span>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* ══ 소감 자리 (5단계 placeholder) ══ */}
      <div className="pd-section">
        <h2 className="pd-section-title">
          <span style={{ color: GREEN, fontSize: 20 }}>💬</span> 사용 소감
        </h2>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1.5px dashed rgba(255,255,255,0.10)",
          borderRadius: 16, padding: "44px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <p style={{
            fontSize: 15, fontWeight: 700, color: "#475569",
            margin: "0 0 6px", fontFamily: font,
          }}>곧 열려요</p>
          <p style={{ fontSize: 13, color: "#334155", margin: 0, fontFamily: font }}>
            소감 기능은 5단계에서 오픈됩니다
          </p>
        </div>
      </div>

      {/* 모바일 하단 여백 (고정 버튼 높이 확보) */}
      <div style={{ height: 80 }} />

      {/* 모바일 하단 고정 바로 보기 */}
      <div className="pd-mobile-cta">
        <a
          href={app.appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pd-btn-primary"
        >
          <ExternalLink size={17} /> 바로 보기 — eummedia.kr
        </a>
      </div>
    </div>
  );
}
