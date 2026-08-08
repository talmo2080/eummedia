import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Award, Sparkles, Heart, MessageCircle, Users, Tv, ArrowRight, TrendingUp, Phone, Quote, BookOpen, X, Send, CheckCircle, Newspaper, Smile, Mic, Building2, Coffee } from "lucide-react";

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

  sungchangwoon: {
    slug:          "sungchangwoon",
    title:         "성창운",
    categoryLabel: "전문가·문화",
    tagline:       "전문가 프로필 페이지",
    thumbnail:     "/sungchangwoon-director.jpg.jpg",
    appUrl:        "https://litt.ly/bongdang",
    layoutStyle:   "tile-dashboard",
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

/* ══════════════════════════════════════
   성창운 — 타일 대시보드 페이지
══════════════════════════════════════ */
const SCW = {
  BG:   "#F4F1EA",
  CARD: "#FFFFFF",
  GOLD: "#B08D2E",
  GOLDL:"#D9BE7A",
  WINE: "#7E2B3F",
  INK:  "#241F1A",
  MUTE: "#8B8172",
};
const scwTile = {
  background: SCW.CARD,
  borderRadius: 18,
  boxShadow: "0 6px 24px rgba(120,95,30,.08)",
  border: "1px solid #EDE6D6",
};
const SCW_CSS = `
  .scw-wrap { background:${SCW.BG}; min-height:100vh; font-family:'Pretendard','Noto Sans KR',sans-serif; padding:28px 20px 60px; }
  .scw-grid { display:grid; grid-template-columns:1.35fr 1fr; grid-auto-rows:minmax(10px,auto); gap:16px; max-width:980px; margin:0 auto; }
  @media(max-width:640px){ .scw-grid{ grid-template-columns:1fr; } .scw-col-span{ grid-column:1!important; } .scw-grid > *{ min-width:0; } }
  .scw-ch-grid { grid-column:1 / -1; display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
  @media(max-width:900px){ .scw-ch-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px){ .scw-ch-grid{ grid-template-columns:1fr; } }
  /* 채널 체커보드: 3열=홀짝, 2열=4n+1/4n, 1열=홀짝 */
  .scw-ch-grid > * { --ch-bg:#FBF6EC; --ch-bdr:1px solid #EDE6D6; --ch-text:#241F1A; --ch-sub:rgba(36,31,26,.55); }
  .scw-ch-grid > *:nth-child(odd) { --ch-bg:#1c1f26; --ch-bdr:none; --ch-text:#fff; --ch-sub:rgba(255,255,255,.55); }
  @media(max-width:900px){
    .scw-ch-grid > * { --ch-bg:#FBF6EC; --ch-bdr:1px solid #EDE6D6; --ch-text:#241F1A; --ch-sub:rgba(36,31,26,.55); }
    .scw-ch-grid > *:nth-child(odd) { --ch-bg:#FBF6EC; --ch-bdr:1px solid #EDE6D6; --ch-text:#241F1A; --ch-sub:rgba(36,31,26,.55); }
    .scw-ch-grid > *:nth-child(4n+1),.scw-ch-grid > *:nth-child(4n) { --ch-bg:#1c1f26; --ch-bdr:none; --ch-text:#fff; --ch-sub:rgba(255,255,255,.55); }
  }
  @media(max-width:480px){
    .scw-ch-grid > *:nth-child(4n+1),.scw-ch-grid > *:nth-child(4n) { --ch-bg:#FBF6EC; --ch-bdr:1px solid #EDE6D6; --ch-text:#241F1A; --ch-sub:rgba(36,31,26,.55); }
    .scw-ch-grid > *:nth-child(odd) { --ch-bg:#1c1f26; --ch-bdr:none; --ch-text:#fff; --ch-sub:rgba(255,255,255,.55); }
  }
  .scw-hero-tile { grid-column:1; grid-row:1; min-width:0; }
  .scw-hero-tile img { max-width:100%; }
  .scw-hero-right { grid-column:2; grid-row:1; display:flex; flex-direction:column; gap:16px; min-width:0; }
  .scw-hero-right > * { min-width:0; }
  @media(max-width:640px){
    .scw-hero-tile { grid-column:1; grid-row:1; }
    .scw-hero-overlay { padding:20px 18px 28px !important; }
    .scw-hero-overlay h1 { font-size:28px !important; }
    .scw-hero-right { grid-column:1; grid-row:2; gap:12px; }
  }
  .scw-chip-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:8px; margin-top:10px; }
  .scw-chip-grid .scw-chip { text-align:center; }
  .scw-chip { background:#fff; border:1px solid ${SCW.GOLDL}; color:${SCW.GOLD}; border-radius:999px; padding:6px 14px; font-size:12.5px; font-weight:700; }
  .scw-award-item { padding:10px 0; border-bottom:1px solid #EDE6D6; display:flex; gap:10px; align-items:flex-start; }
  .scw-award-item:last-child { border-bottom:none; }
`;

function SungchangwoonPage() {
  const font = "'Pretendard','Noto Sans KR',sans-serif";

  const BLANK_FORM = { name:'', org:'', phone:'', email:'', lectureType:'', topics:[], datetime:'', headcount:'', duration:'', location:'', note:'' };
  const [formOpen,   setFormOpen]   = useState(false);
  const [formData,   setFormData]   = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');

  function setField(k, v) { setFormData(p => ({ ...p, [k]: v })); }
  function toggleTopic(t) {
    setFormData(p => ({
      ...p,
      topics: p.topics.includes(t) ? p.topics.filter(x => x !== t) : [...p.topics, t],
    }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setSubmitErr('');
    try {
      const res = await fetch('/api/scw-lecture-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setSubmitted(true); }
      else { setSubmitErr('제출 중 오류가 발생했습니다. 다시 시도해주세요.'); }
    } catch { setSubmitErr('네트워크 오류가 발생했습니다.'); }
    setSubmitting(false);
  }
  function closeForm() { setFormOpen(false); setSubmitted(false); setFormData(BLANK_FORM); setSubmitErr(''); }

  const AWARDS_ALL = [
    { year:"2015", title:"도전창조 경영인 대상" },
    { year:"2016", title:"대한민국 감동무대 문화예술축제 대상" },
    { year:"2016", title:"광복71주년 한·중 환경문화예술제 대상" },
    { year:"2018", title:"봉숭아학당 힐링웃음교실 브랜드 대상" },
    { year:"2018", title:"빛낸 도전한국인 대상" },
    { year:"2019", title:"국회교육위원회 위원장상" },
    { year:"2020", title:"서울특별시 의회 의장상" },
    { year:"2022", title:"글로벌컨슈머 시상식 탑리더십 대상" },
    { year:"2023", title:"한국을 빛낸 글로벌 100인 대상" },
    { year:"2023", title:"아시아리더 대상" },
    { year:"2026", title:"AI혁신 기업상 & 도전한국인 AI교육혁신대상" },
  ];

  return (
    <div className="scw-wrap">
      <style>{SCW_CSS}</style>

      {/* 뒤로가기 */}
      <div style={{ maxWidth:980, margin:"0 auto 16px", fontFamily:font }}>
        <Link to="/pium-store" style={{ display:"inline-flex", alignItems:"center", gap:6, color:SCW.MUTE, textDecoration:"none", fontSize:13, fontWeight:600 }}>
          <ArrowLeft size={14}/> 스토어로 돌아가기
        </Link>
        <p style={{ fontSize:12, color:SCW.MUTE, margin:"6px 0 0" }}>웹앱 둘러보기 · 전문가·문화 &nbsp;/&nbsp; <span style={{ color:SCW.INK }}>성창운</span></p>
      </div>

      <div className="scw-grid">

        {/* ── 상단 2열: 히어로(좌) + 오른쪽 스택(우) ── */}
        {/* 히어로 타일 — 전신 노출 */}
        <div style={{ ...scwTile, padding:0, overflow:"hidden", position:"relative" }} className="scw-hero-tile">
          <img
            src="/sungchangwoon-director.jpg.jpg"
            alt="성창운 총장 전신"
            style={{ width:"100%", height:"auto", display:"block" }}
          />
          <div className="scw-hero-overlay" style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(to top, rgba(0,0,0,.76) 0%, rgba(0,0,0,.28) 65%, transparent 100%)", padding:"32px 26px 36px", color:"#fff" }}>
            <span style={{ fontSize:11.5, fontWeight:700, letterSpacing:".14em", color:SCW.GOLDL }}>문화창조는 신화창조다</span>
            <h1 style={{ fontSize:40, fontWeight:800, margin:"8px 0 4px", letterSpacing:"-.01em", fontFamily:font }}>성창운</h1>
            <div style={{ width:46, height:3, background:SCW.GOLDL, margin:"6px 0 12px" }}/>
            <p style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,.97)", margin:0, lineHeight:1.75, fontFamily:font }}>
              봉숭아학당문화혁신학교 총장<br/>
              <a href="https://www.eummedia.kr/" target="_blank" rel="noopener noreferrer"
                style={{ color:SCW.GOLDL, fontWeight:700, textDecoration:"underline", textUnderlineOffset:3 }}>
                이음미디어 발행인 ↗
              </a>
              {" · "}웃자대한민국협회 회장
            </p>
          </div>
        </div>

        {/* 오른쪽 스택 래퍼 — 히어로 높이만큼 채움 */}
        <div className="scw-hero-right">
          {/* 소개 인용 */}
          <div style={{ ...scwTile, padding:"22px 22px" }}>
            <Quote size={22} color={SCW.GOLDL}/>
            <p style={{ fontSize:14, color:"#5b5347", lineHeight:1.75, margin:"8px 0 0", fontFamily:font }}>
              마음을 여는 웃음레크와 힐링 스피치, 체질별 맞춤 소통으로 당신의 일상과 조직에 <b style={{ color:SCW.WINE }}>활력</b>을 넣어드립니다.<br/>
              <span style={{ fontSize:13, color:SCW.MUTE }}>'문화창조는 신화창조다'라는 신념 아래, 웃음과 소통으로 개인의 건강을 돕고 조직의 변화를 이끌어냅니다.</span>
            </p>
          </div>
          {/* 실적 숫자 2×2 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["5,000+","강의(회)"],["11","수상"],["6","저서"],["31","나눔 후원"]].map(([n,l],i)=>(
              <div key={i} style={{ ...scwTile, padding:"18px 12px", textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:800, color:SCW.GOLD, fontFamily:font }}>{n}</div>
                <div style={{ fontSize:11.5, color:SCW.MUTE, marginTop:4, fontFamily:font }}>{l}</div>
              </div>
            ))}
          </div>
          {/* 수상 사진 — 오른쪽 빈 공간 채움 */}
          <a href="https://www.eummedia.kr/article/article-hlrcqtv8"
            style={{ ...scwTile, padding:0, overflow:"hidden", flex:1, minHeight:160, position:"relative", display:"block", cursor:"pointer" }}>
            <img src="/sungchangwoon-award.jpg.jpg" alt="도전한국인 AI교육혁신대상"
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", minHeight:160 }}
              onError={e=>{ e.currentTarget.style.display="none"; }}
            />
            <div style={{ position:"absolute", inset:8, border:`1px solid ${SCW.GOLD}55`, borderRadius:12, pointerEvents:"none" }}/>
          </a>
        </div>

        {/* 4. 수상 배너 (전체폭) */}
        <div style={{ gridColumn:"1 / -1", borderRadius:16, padding:"15px 22px", background:`linear-gradient(100deg,${SCW.WINE},${SCW.GOLD})`, color:"#fff", display:"flex", alignItems:"center", gap:12, boxShadow:"0 6px 24px rgba(120,95,30,.08)" }} className="scw-col-span">
          <Award size={20} color="#fff"/>
          <span style={{ fontSize:11, fontWeight:800, background:"rgba(255,255,255,.22)", borderRadius:6, padding:"2px 8px", fontFamily:font }}>NEW</span>
          <span style={{ fontSize:14, fontWeight:600, fontFamily:font }}>2026 국회 도전페스티벌 · AI혁신 기업상 &amp; 도전한국인 AI교육혁신대상</span>
        </div>

        {/* 4b. 수상 이력 (전체폭) — 배너 바로 아래 */}
        <div style={{ gridColumn:"1 / -1", ...scwTile, padding:"20px 24px" }} className="scw-col-span">
          <p style={{ fontSize:13, fontWeight:800, color:SCW.GOLD, margin:"0 0 12px", letterSpacing:".06em", textTransform:"uppercase", fontFamily:font }}>수상 이력</p>
          {AWARDS_ALL.slice(-5).map((a,i)=>(
            <div key={i} className="scw-award-item">
              <span style={{ fontSize:11, fontWeight:700, color:SCW.GOLDL, fontFamily:font, minWidth:36, paddingTop:2 }}>{a.year}</span>
              <span style={{ fontSize:13.5, color:SCW.INK, fontFamily:font, lineHeight:1.5 }}>{a.title}</span>
            </div>
          ))}
          <p style={{ fontSize:11.5, color:SCW.MUTE, margin:"12px 0 0", fontFamily:font }}>외 총 11회 수상</p>
        </div>

        {/* 4c. 저서 6권 갤러리 (전체폭) — 수상 이력 바로 아래 */}
        <div style={{ gridColumn:"1 / -1", ...scwTile, padding:"20px 24px" }} className="scw-col-span">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <BookOpen size={19} color={SCW.GOLD}/>
            <span style={{ fontSize:15, fontWeight:800, color:SCW.INK, fontFamily:font }}>저서 6권</span>
            <span style={{ fontSize:12, color:SCW.MUTE, fontFamily:font }}>— 무대에서 못다 한 말, 책으로</span>
          </div>
          <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:6, WebkitOverflowScrolling:"touch", scrollbarWidth:"thin", scrollbarColor:`${SCW.GOLDL} transparent` }}>
            {[
              ["sungchangwoon-book-1.jpg", "복을 짓는 리더의 삶"],
              ["sungchangwoon-book-2.jpg", "말 잘하는 기술"],
              ["sungchangwoon-book-3.jpg", "너 이렇게 살아 봤어?"],
              ["sungchangwoon-book-4.jpg", "봉숭아학당에서 다시 피어나는 꽃"],
              ["sungchangwoon-book-5.jpg", "홍채전문가 과정"],
            ].map(([src, alt]) => (
              <div key={src} style={{ flexShrink:0, width:125, borderRadius:10, overflow:"hidden", boxShadow:`0 4px 16px rgba(120,95,30,.15)`, border:`1px solid ${SCW.GOLDL}` }}>
                <img src={`/${src}`} alt={alt}
                  style={{ width:"100%", height:"auto", display:"block" }}
                  onError={e=>{ e.currentTarget.style.display="none"; }}
                />
              </div>
            ))}
            <div style={{ flexShrink:0, width:125, minHeight:178, borderRadius:10, boxShadow:`0 4px 16px rgba(120,95,30,.10)`, border:`1px solid ${SCW.GOLDL}`, background:SCW.BG, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 10px", textAlign:"center" }}>
              <BookOpen size={22} color={SCW.GOLDL} style={{ marginBottom:10 }}/>
              <p style={{ fontSize:13, fontWeight:700, color:SCW.INK, margin:0, lineHeight:1.55, fontFamily:font }}>체형관리사</p>
            </div>
          </div>
        </div>

        {/* 5a. 전문분야 (2×2) */}
        <div style={{ gridColumn:"1 / -1" }} className="scw-col-span">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <Sparkles size={19} color={SCW.GOLD}/>
            <span style={{ fontSize:18, fontWeight:900, color:SCW.INK, fontFamily:font, letterSpacing:"-.01em" }}>전문분야</span>
          </div>
          <div style={{ width:36, height:3, background:SCW.GOLD, borderRadius:2, marginBottom:16 }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              [Sparkles,      "사상체질",     "타고난 체질에 맞춘 건강과 소통"],
              [Heart,         "건강·대체의학", "몸과 마음을 함께 살피는 건강법"],
              [Users,         "소통·리더십",  "마음을 여는 관계, 사람을 이끄는 힘"],
              [MessageCircle, "힐링 스피치",  "웃음과 위로가 스며드는 강연"],
            ].map(([Ic,t,desc],i)=>(
              <div key={i} style={{ ...scwTile, padding:"18px 16px" }}>
                <Ic size={19} color={SCW.GOLD} strokeWidth={2}/>
                <p style={{ fontSize:13.5, fontWeight:700, color:SCW.INK, margin:"8px 0 3px", fontFamily:font }}>{t}</p>
                <p style={{ fontSize:11.5, color:SCW.MUTE, margin:0, fontFamily:font, lineHeight:1.4 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5b. 전문활동분야 (2×2) */}
        <div style={{ gridColumn:"1 / -1" }} className="scw-col-span">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <Mic size={19} color={SCW.GOLD}/>
            <span style={{ fontSize:18, fontWeight:900, color:SCW.INK, fontFamily:font, letterSpacing:"-.01em" }}>전문활동분야</span>
          </div>
          <div style={{ width:36, height:3, background:SCW.GOLD, borderRadius:2, marginBottom:16 }}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              [Mic,       "방송스피치사관학교", "말하기와 스피치를 훈련하는 배움터",    "#FBF3E2"],
              [Building2, "기업·관공서 강의",   "기업·기관을 찾아가는 맞춤 강의",       "#EAF1EA"],
              [Sparkles,  "싱글벙글나비축제",   "웃음으로 함께하는 문화 나눔의 장",     "#F8ECEF"],
              [Coffee,    "찾아가는인생다방",   "사람을 찾아가 마음을 나누는 소통 프로그램", "#FBEEE4"],
            ].map(([Ic,t,desc,bg],i)=>(
              <div key={i} style={{ ...scwTile, padding:"18px 16px", background:bg }}>
                <Ic size={19} color={SCW.GOLD} strokeWidth={2}/>
                <p style={{ fontSize:13.5, fontWeight:700, color:SCW.INK, margin:"8px 0 3px", fontFamily:font }}>{t}</p>
                <p style={{ fontSize:11.5, color:SCW.MUTE, margin:0, fontFamily:font, lineHeight:1.4 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. 미래 비전 타일 (전체폭) */}
        <div style={{ gridColumn:"1 / -1", ...scwTile, padding:"22px 24px", background:`linear-gradient(120deg,#FCF6E8,#F7EDD5)`, border:`1px solid ${SCW.GOLDL}66` }} className="scw-col-span">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <TrendingUp size={19} color={SCW.GOLD}/>
            <h2 style={{ fontSize:18, fontWeight:800, color:SCW.INK, margin:0, fontFamily:font }}>미래 비전 · 이음평생교육원</h2>
            <span style={{ fontSize:12, color:SCW.MUTE, marginLeft:4 }}>"도전에는 나이가 없다"</span>
          </div>
          <div className="scw-chip-grid">
            {["소상공인 바이브코딩","시니어 AI활용","청년 웃음치료","웃음치료전문가","시니어 자립교육","시니어 문화활동"].map(p=>(
              <span key={p} className="scw-chip" style={{ textAlign:"center" }}>{p}</span>
            ))}
          </div>
        </div>

        {/* 10. 활동 현장 갤러리 (전체폭) */}
        <div style={{ gridColumn:"1 / -1", ...scwTile, padding:"20px 20px 16px" }} className="scw-col-span">
          <p style={{ fontSize:13, fontWeight:800, color:SCW.GOLD, margin:"0 0 14px", letterSpacing:".06em", fontFamily:font }}>활동 현장</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
            {[
              ["/sungchangwoon-lecture.jpg.jpg",         "사상체질과 즐거운 소통리더십"],
              ["/sungchangwoon-festival.jpg.jpg",        "2026 국회 도전페스티벌"],
              ["/sungchangwoon-activity-youth.jpg",      "청년 스마일 텐션업 · 웃음치료 특강"],
              ["/sungchangwoon-activity-nabi.jpg",       "싱글벙글 나비축제"],
              ["/sungchangwoon-activity-youth-group.jpg","청년 웃음 특강"],
              ["/sungchangwoon-activity-cafe.jpg",       "벙글이의 찾아가는 인생다방"],
              ["/sungchangwoon-activity-meet.jpg",       "방송스피치사관학교 수업"],
              ["/sungchangwoon-activity-senior.jpg",     "싱글벙글 나비축제 2"],
              ["/sungchangwoon-activity-graduation.png", "방송스피치사관학교 졸업식"],
              ["/sungchangwoon-activity-yearend.jpg",    "웃자대한민국협회 송년페스티벌"],
            ].map(([src,title])=>(
              <div key={src} style={{ borderRadius:14, overflow:"hidden", background:"#e8e0d0" }}>
                <img src={src} alt={title}
                  style={{ width:"100%", height:160, objectFit:"cover", display:"block" }}
                  onError={e=>{ e.currentTarget.style.display="none"; }}
                />
                <div style={{ padding:"8px 12px 10px", background:"#fff" }}>
                  <p style={{ fontSize:11.5, fontWeight:700, color:SCW.INK, margin:0, fontFamily:font }}>{title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10b. 채널 3×2 — 활동 현장 바로 아래 */}
        <div className="scw-ch-grid">
          {[
            { href:"https://www.youtube.com/@성창운-i4d", Icon:Tv,          iconColor:"#FF5252",  label:"봉당TV",         sub:"웃음·인문학·문화" },
            { href:"https://www.eummedia.kr",             Icon:Newspaper,   iconColor:SCW.GOLD,   label:"이음미디어",       sub:"성창운 발행인" },
            { href:"https://cafe.naver.com/kk304915",     Icon:Users,       iconColor:"currentColor", label:"네이버 카페",  sub:"봉숭아학당 커뮤니티" },
            { href:"https://blog.naver.com/kkk304915",    Icon:BookOpen,    iconColor:"#03C75A",  label:"네이버 블로그",   sub:"성창운 블로그" },
            { href:"https://blog.naver.com/smilekorean1", Icon:Smile,       iconColor:"currentColor", label:"웃자대한민국협회", sub:"사단법인 공식 블로그" },
            { href:"https://litt.ly/bongdang",            Icon:ExternalLink, iconColor:"currentColor", label:"봉당 바로가기", sub:"전체 채널 한눈에" },
          ].map(({href,Icon,iconColor,label,sub})=>(
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{ background:"var(--ch-bg)", border:"var(--ch-bdr)", borderRadius:18, boxShadow:"0 6px 24px rgba(120,95,30,.08)", padding:"18px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", textDecoration:"none", color:"var(--ch-text)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Icon size={22} color={iconColor}/>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:800, color:"var(--ch-text)", margin:0, fontFamily:font }}>{label}</p>
                  <p style={{ fontSize:10.5, color:"var(--ch-sub)", margin:"2px 0 0", fontFamily:font }}>{sub}</p>
                </div>
              </div>
              <ArrowRight size={14} color="currentColor"/>
            </a>
          ))}
        </div>

        {/* 11. CTA 버튼 (전체폭) */}
        <div style={{ gridColumn:"1 / -1", display:"flex", flexDirection:"column", gap:10, marginTop:2 }} className="scw-col-span">
          {/* 강의 문의 — 전체폭 큰 버튼 */}
          <button onClick={()=>setFormOpen(true)}
            style={{ width:"100%", padding:"18px 24px", borderRadius:14, background:SCW.WINE, color:"#fff", fontSize:16, fontWeight:800, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:font, boxShadow:`0 4px 18px ${SCW.WINE}44` }}>
            <Phone size={17}/> 강의 문의 · 섭외하기
          </button>
          {/* 전화 + 이야기보기 보조 버튼 */}
          <div style={{ display:"flex", gap:10 }}>
            <a href="tel:010-9893-0330"
              style={{ flex:1, padding:"13px 16px", borderRadius:12, background:"#fff", color:SCW.INK, fontSize:13.5, fontWeight:700, border:`1.5px solid ${SCW.WINE}44`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, textDecoration:"none", fontFamily:font }}>
              <Phone size={13} color={SCW.WINE}/> <span style={{ color:SCW.WINE }}>010-9893-0330</span>
            </a>
            <a href="https://www.eummedia.kr/" target="_blank" rel="noopener noreferrer"
              style={{ flex:1, padding:"13px 16px", borderRadius:12, background:"#fff", color:SCW.INK, fontSize:13.5, fontWeight:700, border:"1px solid #E0D8C6", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, textDecoration:"none", fontFamily:font }}>
              이음소식 <ArrowRight size={13}/>
            </a>
          </div>
        </div>

      </div>

      {/* ── 강의 문의 폼 모달 ── */}
      {formOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e=>{ if(e.target===e.currentTarget) closeForm(); }}>
          {/* 딤 배경 */}
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)", backdropFilter:"blur(3px)" }}/>
          {/* 패널 */}
          <div style={{ position:"relative", width:"100%", maxWidth:640, maxHeight:"92vh", overflowY:"auto", background:SCW.BG, borderRadius:"24px 24px 0 0", padding:"28px 24px 40px", fontFamily:font }}>
            {/* 헤더 */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:800, color:SCW.INK, margin:0 }}>강의 문의</h2>
                <p style={{ fontSize:12.5, color:SCW.MUTE, margin:"4px 0 0" }}>📞 직접 문의: 010-9893-0330</p>
              </div>
              <button onClick={closeForm} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:SCW.MUTE }}>
                <X size={22}/>
              </button>
            </div>

            {submitted ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <CheckCircle size={52} color={SCW.GOLD} style={{ margin:"0 auto 16px" }}/>
                <p style={{ fontSize:18, fontWeight:800, color:SCW.INK, margin:"0 0 8px" }}>신청이 접수됐습니다!</p>
                <p style={{ fontSize:13.5, color:SCW.MUTE, margin:"0 0 28px", lineHeight:1.6 }}>곧 연락드리겠습니다.<br/>문의: 010-9893-0330</p>
                <button onClick={closeForm}
                  style={{ padding:"13px 32px", borderRadius:12, background:SCW.GOLD, color:"#fff", fontSize:15, fontWeight:700, border:"none", cursor:"pointer" }}>
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {[
                  { label:"신청자 성함 *", key:"name", ph:"홍길동", required:true },
                  { label:"소속 *", key:"org", ph:"회사/기관/단체명", required:true },
                  { label:"연락처 *", key:"phone", ph:"010-0000-0000", required:true },
                  { label:"이메일", key:"email", ph:"example@email.com", required:false },
                ].map(f => (
                  <label key={f.key} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:SCW.INK }}>{f.label}</span>
                    <input value={formData[f.key]} onChange={e=>setField(f.key, e.target.value)} required={f.required} placeholder={f.ph}
                      style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #E0D8C6", fontSize:14, fontFamily:font, background:"#fff", outline:"none", color:SCW.INK }} />
                  </label>
                ))}

                {/* 강의 유형 */}
                <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:SCW.INK }}>강의 유형 *</span>
                  <select value={formData.lectureType} onChange={e=>setField('lectureType', e.target.value)} required
                    style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #E0D8C6", fontSize:14, fontFamily:font, background:"#fff", color:SCW.INK }}>
                    <option value="">선택해주세요</option>
                    {["기업 강의","공공·지자체","단체·모임","기타"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                {/* 희망 주제 */}
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color:SCW.INK, display:"block", marginBottom:8 }}>희망 주제 (복수선택)</span>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {["웃음레크·힐링 스피치","사상체질 맞춤 소통","소통·리더십","건강·대체의학","기업 강의","기타"].map(t=>(
                      <button type="button" key={t} onClick={()=>toggleTopic(t)}
                        style={{ padding:"7px 14px", borderRadius:99, fontSize:12.5, fontWeight:700, border:`1.5px solid ${formData.topics.includes(t) ? SCW.GOLD : "#E0D8C6"}`, background:formData.topics.includes(t) ? `${SCW.GOLD}18` : "#fff", color:formData.topics.includes(t) ? SCW.GOLD : SCW.MUTE, cursor:"pointer", fontFamily:font }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  { label:"희망 일시", key:"datetime", ph:"예: 2026-09-15 오후" },
                  { label:"예상 인원", key:"headcount", ph:"예: 50명" },
                  { label:"장소", key:"location", ph:"지역 또는 온라인 여부" },
                ].map(f => (
                  <label key={f.key} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:SCW.INK }}>{f.label}</span>
                    <input value={formData[f.key]} onChange={e=>setField(f.key, e.target.value)} placeholder={f.ph}
                      style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #E0D8C6", fontSize:14, fontFamily:font, background:"#fff", outline:"none", color:SCW.INK }} />
                  </label>
                ))}

                {/* 강의 시간 */}
                <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:SCW.INK }}>강의 시간</span>
                  <select value={formData.duration} onChange={e=>setField('duration', e.target.value)}
                    style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #E0D8C6", fontSize:14, fontFamily:font, background:"#fff", color:SCW.INK }}>
                    <option value="">선택</option>
                    {["1시간","2시간","반일","종일","협의"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                {/* 추가 요청 */}
                <label style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:SCW.INK }}>추가 요청사항</span>
                  <textarea value={formData.note} onChange={e=>setField('note', e.target.value)} rows={3} placeholder="자유롭게 적어주세요"
                    style={{ padding:"11px 14px", borderRadius:10, border:"1.5px solid #E0D8C6", fontSize:14, fontFamily:font, background:"#fff", resize:"vertical", outline:"none", color:SCW.INK }} />
                </label>

                {submitErr && <p style={{ fontSize:13, color:SCW.WINE, margin:0 }}>{submitErr}</p>}

                <button type="submit" disabled={submitting}
                  style={{ marginTop:4, padding:"15px", borderRadius:14, background:submitting ? "#ccc" : SCW.GOLD, color:"#fff", fontSize:15.5, fontWeight:800, border:"none", cursor:submitting?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:font }}>
                  <Send size={17}/> {submitting ? "제출 중..." : "강의 신청 보내기"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   오행자 — v3 세로형 매거진 페이지
══════════════════════════════════════ */
const OHJ3_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@700&family=Playfair+Display:wght@700;800;900&display=swap');

  .ohj3 {
    --rose:#E11D74; --coral:#FF6A3D; --sun:#FFC53D;
    --ink:#34122B; --ivory:#FFF8F0; --blush:#FFEDF3; --plum:#2A1024; --mute:#9A8592;
    font-family:Pretendard,-apple-system,sans-serif;
    background:var(--ivory); color:var(--ink); line-height:1.6;
  }
  .ohj3 * { box-sizing:border-box; }
  .ohj3 a { color:inherit; text-decoration:none; }
  .ohj3 .jua { font-family:'Jua',Pretendard,sans-serif; }
  .ohj3 .hand { font-family:'Gaegu',Pretendard,sans-serif; font-weight:700; }

  .ohj3-back { padding:14px 20px; background:rgba(255,255,255,.9);
    display:flex; align-items:center; gap:8px; border-bottom:1px solid #FFD9E6; }

  .ohj3-inner { max-width:720px; margin:0 auto; padding:0 20px; }

  /* HERO */
  .ohj3-hero { background:linear-gradient(180deg,#1B0B17 0%,#2A1024 24%,#9C1C6A 56%,#E11D74 80%,#FF6A3D 100%);
    color:#fff; padding:52px 0 0; text-align:center; overflow:hidden; }
  .ohj3-hero .eyebrow { font-size:17px; color:var(--sun); }
  .ohj3-hero .en { font-family:'Playfair Display',serif; font-weight:900; font-size:62px;
    line-height:1; letter-spacing:.08em; margin:12px 0 0; color:#fff; }
  .ohj3-hero .divider { width:44px; height:3px; background:var(--sun);
    margin:20px auto; border-radius:2px; opacity:.9; }
  .ohj3-hero h1 { font-size:84px; line-height:.9; margin:0 0 10px;
    text-shadow:0 3px 18px rgba(0,0,0,.22); }
  .ohj3-hero .sub { font-size:15px; font-weight:700; color:rgba(255,255,255,.95); margin-bottom:0; }
  .ohj3-hero-photo { margin:30px auto 0; max-width:560px; border-radius:24px 24px 0 0; overflow:hidden; }
  .ohj3-hero-photo img { width:100%; display:block; object-fit:cover; image-orientation:from-image; }

  /* THESIS */
  .ohj3-thesis { background:var(--ivory); padding:60px 0; text-align:center; }
  .ohj3-thesis .big { font-size:40px; line-height:1.25; color:var(--ink); }
  .ohj3-thesis .big span { color:var(--rose); }
  .ohj3-thesis .small { margin-top:14px; font-size:20px; color:var(--mute); }
  @media (min-width:768px) { .ohj3-thesis .small { font-size:24px; } }

  /* INTRO */
  .ohj3-intro { background:var(--blush); padding:52px 0; }
  .ohj3-intro .k { font-size:14px; color:var(--rose); font-weight:800; text-align:center; }
  .ohj3-intro p { font-size:15px; line-height:1.9; color:#5c3a4d; text-align:center;
    max-width:600px; margin:14px auto 0; }

  /* STATS */
  .ohj3-stats-band { background:var(--ivory); padding:40px 0; }
  .ohj3-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .ohj3-stat { text-align:center; }
  .ohj3-stat .n { font-size:42px; line-height:1; color:var(--rose); }
  .ohj3-stat .l { font-size:13px; color:var(--mute); margin-top:8px; }

  /* 방송 (다크) */
  .ohj3-tv { background:var(--plum); color:#fff; padding:60px 0; }
  .ohj3-tv .k { font-size:14px; color:var(--sun); font-weight:800; text-align:center; }
  .ohj3-tv h2 { font-size:34px; text-align:center; margin:8px 0 26px; }
  .ohj3-tv-logos { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
  .ohj3-chip { border:1.5px solid rgba(255,255,255,.4); border-radius:999px;
    padding:9px 17px; font-weight:800; font-size:16px; }
  .ohj3-tv-strip { margin-top:24px; display:flex; gap:12px; overflow-x:auto;
    padding-bottom:4px; -webkit-overflow-scrolling:touch;
    scrollbar-width:none; }
  .ohj3-tv-strip::-webkit-scrollbar { display:none; }
  .ohj3-scroll-track { margin-top:12px; width:100%; height:3px;
    background:rgba(255,255,255,.2); border-radius:999px; overflow:hidden; }
  .ohj3-scroll-handle { height:3px; background:#E11D74; border-radius:999px;
    transition:width .1s linear; }
  .ohj3-tv-strip img { height:130px; width:auto; display:block; border-radius:14px;
    flex-shrink:0; image-orientation:from-image; }
  .ohj3-tv-shows { margin-top:16px; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
  .ohj3-show { background:rgba(255,255,255,.12); border-radius:8px;
    padding:6px 12px; font-size:12.5px; color:rgba(255,255,255,.9); }

  /* 전문분야 */
  .ohj3-fields-band { background:var(--ivory); padding:58px 0; }
  .ohj3-sec-k { font-size:14px; color:var(--rose); font-weight:800; text-align:center; }
  .ohj3-sec-h { font-size:32px; text-align:center; margin:6px 0 26px; }
  .ohj3-fields { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .ohj3-field { border-radius:20px; padding:22px 18px; color:#fff; text-align:center; }
  .ohj3-field .fi { font-size:32px; }
  .ohj3-field h3 { font-size:17px; margin:10px 0 5px; }
  .ohj3-field p { font-size:12.5px; opacity:.96; line-height:1.5; }
  .ohj3-field .badge { display:inline-block; margin-top:9px;
    background:rgba(255,255,255,.24); border-radius:8px;
    padding:4px 10px; font-size:11px; font-weight:800; }
  .ohj3-f1 { background:linear-gradient(130deg,#FF6A3D,#FF9450); }
  .ohj3-f2 { background:linear-gradient(130deg,#E11D74,#F0568F); }
  .ohj3-f3 { background:linear-gradient(130deg,#7A34B0,#A64FD0); }
  .ohj3-f4 { background:linear-gradient(130deg,#E8912E,#F6B44E); }

  /* 이력 아코디언 */
  .ohj3-career-band { background:var(--plum); padding:58px 0; }
  .ohj3-acc-list { display:flex; flex-direction:column; gap:10px; margin-top:24px; }
  .ohj3-acc-item { border:1px solid rgba(252,196,81,.25); border-radius:14px; overflow:hidden; }
  .ohj3-acc-btn {
    width:100%; background:rgba(255,255,255,.05); border:none; cursor:pointer;
    display:flex; justify-content:space-between; align-items:center;
    padding:16px 20px; color:#FCC451; font-family:'Jua',sans-serif; font-size:17px;
    text-align:left;
  }
  .ohj3-acc-btn:hover { background:rgba(252,196,81,.08); }
  .ohj3-acc-arrow { font-size:15px; transition:transform .2s; flex-shrink:0; }
  .ohj3-acc-arrow.open { transform:rotate(90deg); }
  .ohj3-acc-body {
    display:none; padding:12px 20px 20px;
    max-height:320px; overflow-y:auto;
    scrollbar-width:thin; scrollbar-color:#FCC451 transparent;
  }
  .ohj3-acc-body.open { display:block; }
  .ohj3-acc-row { display:flex; gap:10px; padding:6px 0;
    border-bottom:1px solid rgba(255,255,255,.06); }
  .ohj3-acc-row:last-child { border-bottom:none; }
  .ohj3-acc-date { color:#FCC451; font-size:12px; min-width:90px;
    flex-shrink:0; padding-top:1px; line-height:1.5; }
  .ohj3-acc-text { color:rgba(255,255,255,.9); font-size:14px; line-height:1.6; }

  /* 강연 현장 */
  .ohj3-stage-band { background:var(--blush); padding:58px 0; }
  .ohj3-feature-img { width:100%; border-radius:20px; display:block;
    object-fit:cover; max-height:340px; }
  .ohj3-lecture-strip { margin-top:14px; display:flex; gap:10px; overflow-x:auto;
    padding-bottom:4px; -webkit-overflow-scrolling:touch;
    scrollbar-width:none; }
  .ohj3-lecture-strip::-webkit-scrollbar { display:none; }
  .ohj3-lecture-strip img { height:110px; width:auto; display:block;
    border-radius:12px; flex-shrink:0;
    object-fit:contain; background:#fff; }

  /* 저서 */
  .ohj3-books-band { background:var(--ivory); padding:58px 0; }
  .ohj3-books { display:flex; gap:16px; overflow-x:auto; padding-bottom:8px;
    -webkit-overflow-scrolling:touch; }
  .ohj3-book { flex:0 0 auto; }
  .ohj3-book img { display:block; height:180px; width:auto; border-radius:10px;
    border:2px solid #F4C430;
    box-shadow:0 6px 20px rgba(120,40,74,.22);
    object-fit:cover; }

  /* 채널 */
  .ohj3-ch-band { background:var(--ivory); padding:58px 0; }
  .ohj3-channels { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .ohj3-ch { display:flex; align-items:center; gap:12px; background:#fff;
    border:1px solid #FFD9E6; border-radius:16px; padding:16px;
    box-shadow:0 5px 14px rgba(224,29,116,.05); text-decoration:none; color:inherit; }
  .ohj3-ch .ci { width:38px; height:38px; border-radius:11px; flex:0 0 auto;
    display:grid; place-items:center; background:var(--blush); color:var(--rose); font-size:16px; }
  .ohj3-ch .ct { flex:1; min-width:0; }
  .ohj3-ch .ct b { display:block; font-size:15px; color:var(--ink); }
  .ohj3-ch .ct span { font-size:11.5px; color:var(--mute); }
  .ohj3-ch .arr { color:var(--rose); font-weight:800; }
  .ohj3-ch-me { grid-column:1 / -1;
    background:linear-gradient(120deg,#E11D74,#FF6A3D); border:none; }
  .ohj3-ch-me .ci { background:rgba(255,255,255,.22); color:#fff; font-size:18px; }
  .ohj3-ch-me .ct b { color:#fff; font-size:17px; }
  .ohj3-ch-me .ct span { color:rgba(255,255,255,.85); }
  .ohj3-ch-me .arr { color:#fff; }

  /* 마음 (닫기) */
  .ohj3-heart { background:linear-gradient(160deg,#3A1230,#2A1024);
    color:#fff; padding:64px 0; text-align:center; }
  .ohj3-heart .k { font-size:24px; color:var(--sun); }
  .ohj3-heart h2 { font-size:34px; margin:6px 0 16px; }
  .ohj3-heart p { font-size:15.5px; line-height:1.9; color:rgba(255,255,255,.85);
    max-width:560px; margin:0 auto; }
  .ohj3-heart .roles { margin-top:22px; display:flex; flex-wrap:wrap;
    gap:9px; justify-content:center; }
  .ohj3-heart .role { border:1px solid rgba(255,255,255,.3); border-radius:999px;
    padding:8px 15px; font-size:12.5px; color:rgba(255,255,255,.92); }

  /* CTA */
  .ohj3-cta-band { background:var(--ivory); padding:50px 0 70px; }
  .ohj3-cta .line { text-align:center; font-size:26px; margin-bottom:20px; }
  .ohj3-cta-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .ohj3-btn { flex:1 1 100%; padding:20px; border-radius:18px; text-align:center;
    font-size:18px; font-weight:800; color:#fff;
    background:linear-gradient(120deg,#FF6A3D,#E11D74);
    display:block; text-decoration:none; }
  .ohj3-btn .ph { display:block; font-size:14px; font-weight:700;
    color:rgba(255,255,255,.9); margin-top:4px; }
  .ohj3-btn-tel { flex:1 1 100%; padding:18px; border-radius:16px; text-align:center;
    font-size:17px; font-weight:800; background:#fff; color:#E11D74;
    border:2px solid #E11D74; display:block; text-decoration:none; }
  .ohj3-btn-tel .ph2 { display:block; font-size:14px; font-weight:700;
    color:#E11D74; margin-top:3px; }

  @media(max-width:560px) {
    .ohj3-hero .en { font-size:42px; }
    .ohj3-hero h1 { font-size:64px; }
    .ohj3-thesis .big { font-size:30px; }
    .ohj3-stats { grid-template-columns:repeat(2,1fr); gap:22px 14px; }
    .ohj3-channels { grid-template-columns:1fr; }
    .ohj3-ch-me { grid-column:auto; }
  }
`;

const OHJ3_TV_COUNT = 24;

const OHJ3_BLANK = { name:'', org:'', phone:'', email:'', lectureType:'', topics:[], datetime:'', headcount:'', duration:'', location:'', note:'' };
const OHJ3_TOPICS = ["웃음치료·힐링","인문학 강의","소통·커뮤니케이션","방송 스피치","긍정 에너지·리더십","기타"];

function OhjAccordion({ title, rows }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ohj3-acc-item">
      <button className="ohj3-acc-btn jua" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className={`ohj3-acc-arrow${open ? ' open' : ''}`}>▸</span>
      </button>
      <div className={`ohj3-acc-body${open ? ' open' : ''}`}>
        {rows.map(([date, text], i) => (
          <div key={i} className="ohj3-acc-row">
            <span className="ohj3-acc-date">{date}</span>
            <span className="ohj3-acc-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OhaengjaPage() {
  const [formOpen,   setFormOpen]   = useState(false);
  const [formData,   setFormData]   = useState(OHJ3_BLANK);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');
  const [tvPct,      setTvPct]      = useState(0);
  const [lecPct,     setLecPct]     = useState(0);
  const [lecSel,     setLecSel]     = useState(0);
  const [lecFade,    setLecFade]    = useState(true);
  const tvRef  = useRef(null);
  const lecRef = useRef(null);
  function onTvScroll()  { const el = tvRef.current;  if (el) setTvPct(el.scrollLeft  / (el.scrollWidth  - el.clientWidth)  * 100); }
  function onLecScroll() { const el = lecRef.current; if (el) setLecPct(el.scrollLeft / (el.scrollWidth - el.clientWidth) * 100); }
  function selectLec(i) {
    if (i === lecSel) return;
    setLecFade(false);
    setTimeout(() => { setLecSel(i); setLecFade(true); }, 180);
  }

  function setField(k, v) { setFormData(p => ({ ...p, [k]: v })); }
  function toggleTopic(t) { setFormData(p => ({ ...p, topics: p.topics.includes(t) ? p.topics.filter(x=>x!==t) : [...p.topics, t] })); }
  function closeForm() { setFormOpen(false); setSubmitted(false); setFormData(OHJ3_BLANK); setSubmitErr(''); }
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setSubmitErr('');
    try {
      const res = await fetch('/api/ohj-lecture-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setSubmitted(true); }
      else { setSubmitErr('제출 중 오류가 발생했습니다. 다시 시도해주세요.'); }
    } catch { setSubmitErr('네트워크 오류가 발생했습니다.'); }
    setSubmitting(false);
  }

  return (
    <div className="ohj3">
      <style>{OHJ3_CSS}</style>

      {/* 뒤로가기 */}
      <div className="ohj3-back">
        <Link to="/pium-store" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#9A8592", fontSize:13, fontWeight:600 }}>
          <ArrowLeft size={14}/> 스토어로 돌아가기
        </Link>
      </div>

      {/* HERO */}
      <div className="ohj3-hero">
        <div className="ohj3-inner">
          <div className="eyebrow hand">개그맨을 웃기는 웃음치료사</div>
          <div className="en">OH HAENG JA</div>
          <div className="divider"/>
          <h1 className="jua">오행자</h1>
          <div className="sub">MZ세대 웃음 아이콘 · 소통·치유 전문가</div>
        </div>
        <div className="ohj3-hero-photo">
          <img src="/ohaengja-profile.jpg" alt="오행자 교수"
            onError={e=>{ e.currentTarget.parentElement.innerHTML=''; }}/>
        </div>
      </div>

      {/* THESIS */}
      <div className="ohj3-thesis">
        <div className="ohj3-inner">
          <div className="big jua">웃기지만,<br/><span>마음을 살립니다</span></div>
          <div className="small hand">15초면 엔돌핀이 도는 사람</div>
        </div>
      </div>

      {/* INTRO / PROFILE */}
      <div className="ohj3-intro">
        <div className="ohj3-inner">
          <div className="k">PROFILE</div>
          <p>'개그맨을 웃기는 웃음치료사'이자 'MZ세대 웃음 아이콘'으로 활약하는 소통·치유 전문가. 수많은 방송 출연과 대중 강연으로 긍정적인 웃음 에너지를 전파합니다.</p>
          <p>상담심리학과 치유학(NLP·최면) 전문 지식을 바탕으로, 단순한 재미를 넘어 마음의 상처를 치유하고 생명을 살리는 웃음을 추구합니다. 동양고전과 인문학으로 '나를 찾아가는 과정'을 중시하며, 자신이 먼저 행복하고 스스로를 사랑할 때 진정한 '소통 리더십'이 나온다고 믿습니다.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="ohj3-stats-band">
        <div className="ohj3-inner">
          <div className="ohj3-stats">
            <div className="ohj3-stat"><div className="n jua">4,000+</div><div className="l">강의·강연</div></div>
            <div className="ohj3-stat"><div className="n jua">30+</div><div className="l">방송 출연</div></div>
            <div className="ohj3-stat"><div className="n jua">5</div><div className="l">저서</div></div>
            <div className="ohj3-stat"><div className="n jua">5.7만</div><div className="l">유튜브 구독</div></div>
          </div>
        </div>
      </div>

      {/* 방송 (다크) */}
      <div className="ohj3-tv">
        <div className="ohj3-inner">
          <div className="k">방송이 사랑한 얼굴</div>
          <h2 className="jua">브라운관을 휩쓴 웃음</h2>
          <div className="ohj3-tv-logos">
            {["KBS","MBC","SBS","JTBC","MBN","EBS","채널A"].map(ch=>(
              <span key={ch} className="ohj3-chip">{ch}</span>
            ))}
          </div>
          <div className="ohj3-tv-strip" ref={tvRef} onScroll={onTvScroll}>
            {Array.from({length:OHJ3_TV_COUNT},(_,i)=>i+1).map(n=>(
              <img key={n} src={`/ohaengja-tv-photos/ohaengja-tv-${n}.jpg`}
                alt={`방송 출연 ${n}`}
                onError={e=>{ e.currentTarget.style.display="none"; }}/>
            ))}
          </div>
          <div className="ohj3-scroll-track">
            <div className="ohj3-scroll-handle" style={{width:`${tvPct}%`}}/>
          </div>
          <div className="ohj3-tv-shows">
            {["아침마당","생방송 오늘의 아침","무엇이든 물어보살","알토란","살림남","기분좋은날","워크맨(400만) 출연","인천 프로야구 시구"].map(s=>(
              <span key={s} className="ohj3-show">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 전문분야 */}
      <div className="ohj3-fields-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">EXPERTISE</div>
          <div className="ohj3-sec-h jua">잘하는 것</div>
          <div className="ohj3-fields">
            <div className="ohj3-field ohj3-f1">
              <div className="fi">📖</div>
              <h3 className="jua">인문학 강의</h3>
              <p>고전·인문·심리로 나를 찾아가는 시간</p>
            </div>
            <div className="ohj3-field ohj3-f2">
              <div className="fi">💬</div>
              <h3 className="jua">소통·커뮤니케이션</h3>
              <p>공감과 설득, 관계를 여는 대화</p>
            </div>
            <div className="ohj3-field ohj3-f3">
              <div className="fi">🎤</div>
              <h3 className="jua">방송 스피치</h3>
              <p>1인 방송인을 위한 말하기<span className="badge">방송스피치사관학교 28기 · 유튜버 150명 배출</span></p>
            </div>
            <div className="ohj3-field ohj3-f4">
              <div className="fi">🍚</div>
              <h3 className="jua">월요일 집밥 나눔</h3>
              <p>매주 월요일 싱글벙글 나비축제, 정성스러운 집밥으로 사랑을 나눔</p>
            </div>
          </div>
        </div>
      </div>

      {/* 이력 — 아코디언 3개 */}
      <div className="ohj3-career-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">CAREER</div>
          <div className="ohj3-sec-h jua" style={{color:'#FCC451'}}>이력</div>
          <div className="ohj3-acc-list">
            {[
              {
                title:'자격증·학력',
                count:22,
                rows:[
                  ['2022.10.08','로드랜드대학교 치유학과(NLP,최면전공) 석사수료'],
                  ['2009.06~2015.02','서울디지털대학교 상담심리학과(학사)'],
                  ['2009.06~2015.02','서울디지털대학교 평생교육학과(학사)'],
                  ['2017.05.24','부모교육 코칭지도사 1급 (YJ강사비전아카데미)'],
                  ['2017.02.07','독서지도사 1급 (한국자격검정진흥원)'],
                  ['2016.03.18','분노조절 상담사 2급 (한국상담협회)'],
                  ['2016.03.16','방재안전관리사 1급 (119재난안전교육진흥원)'],
                  ['2015.02.27','평생교육사 2급 (교육부장관)'],
                  ['2013.05.08','심리상담사 1급 (한국상담문화원)'],
                  ['2015.05.01','약물예방상담교육강사 (한국약물예방교육개발원)'],
                  ['2014.04.03','학교폭력예방상담사 (한국약물예방교육개발원)'],
                  ['2013.03.30','감정노동관리사 (감정노동연구소)'],
                  ['2012.07.20','동화구연지도사 2급 (평생교육진흥연구회)'],
                  ['2011.07.22','직무스트레스관리사 (한국직업능력평가원)'],
                  ['2010.06.27','NLP마스터프랙티셔너 (정동문 변화성공트레이닝)'],
                  ['2010.07.13','행복웃음MBA명강사 (한국행복웃음아카데미)'],
                  ['2010.07.04','실버여가레크레이션 (한국웃음연구협회)'],
                  ['2010.07.04','실버웃음건강지도사 (한국웃음연구협회)'],
                  ['2008.10.26','웃음치료사 1급 (한국웃음치료연구소)'],
                  ['2008.10.26','레크리에이션 1급 (한국웃음치료연구소)'],
                  ['2013.03.01','한국형인성훈련강사양성과정 수료 (홍익뿌리교육연구원)'],
                  ['2011','의식변화 프로그램 전 과정수료(깨어나기·알아가기·살아가기·통합비전) (삶을 예술로 가꾸는 사람들)'],
                ],
              },
              {
                title:'방송 출연',
                count:29,
                rows:[
                  ['2026.07.02','MBN 알토란 별주부전'],
                  ['2026.05.19','BBS불교방송 인생을 아름다워'],
                  ['2026.05.02','KBS2 살림남 (박서진 가수)'],
                  ['2026.04.18','뉴스공장 — 탁현민의 더 뷰티플'],
                  ['2026.04.07','SPOTV 인천 프로야구 시구'],
                  ['2026.03.11','채널A 잘 살면 좋잖아'],
                  ['2026.01','JTBC 입만 살았네'],
                  ['2025.12','KBS 굿모닝 대한민국 잡스타'],
                  ['2025.06','MBC 기분좋은날'],
                  ['2025.05','MBN 알토란'],
                  ['2025.04','MBC 살맛나는 세상'],
                  ['2025.02','KBS 아침마당'],
                  ['2025.01','MBC 생방송 오늘의 아침'],
                  ['2025.01','워크맨/워크돌 (구독자 400만 유튜브 채널)'],
                  ['2024.12','EBS PD로그'],
                  ['2018.07~현재','토닥토닥행자TV 유튜브 채널 운영 (구독자 5만 3천명)'],
                  ['2023.10','랄랄 유튜브 채널'],
                  ['2023.09','백세명수 유튜브 채널'],
                  ['2023.08','KBS2 살림남'],
                  ['2023.07.13','KBS2 홍김동전'],
                  ['2023.07','팜트리아일랜드'],
                  ['2022.11','E채널 개며느리'],
                  ['2022.09','굿모닝FM 장성규입니다'],
                  ['2022.07','튀르키예즈(터키즈) 유튜브 채널'],
                  ['2022.02','이리오너라 유튜브 채널 — 못배운놈들'],
                  ['2020.11.12','EBS 파란만장 인생 이야기'],
                  ['2017.11.11','KBS1 황금연못'],
                  ['2012.08.18','KBS TV비평'],
                  ['2011.11.17','SBS 세상에 이런 일이'],
                ],
              },
              {
                title:'출강 이력',
                count:19,
                rows:[
                  ['2026.06.01','남양주 축산농협'],
                  ['2026.04.13','화성시문화재단'],
                  ['2026.01.22','수원축산업협동조합'],
                  ['2025.12.23','KT리빙'],
                  ['2025.12.12','한국육아교육행정협의회'],
                  ['2025.12.04','대구사과농업협동조합'],
                  ['2025.11.28','경남교육청 공무원'],
                  ['2025.11.24','인천공항공사'],
                  ['2025.11.12','방송통신대학'],
                  ['2025.10.11~11.01','생명보험사회공헌재단'],
                  ['2025.10.16','한국야쿠르트'],
                  ['2025.10.14','동작구보건소'],
                  ['2025.09.30','성북구보건소'],
                  ['2025.09.18','LG전자'],
                  ['2025.08.12','용인교육청'],
                  ['2025.07.16','지미션 (IT 기업)'],
                  ['2025.07.03','서대문구육아지원센터'],
                  ['2025.06.19','하이파이브 영화 시사회'],
                  ['2025.06.17','안성시보건소'],
                ],
              },
            ].map((acc, ai) => (
              <OhjAccordion key={ai} title={`${acc.title} (${acc.count}건)`} rows={acc.rows} />
            ))}
          </div>
        </div>
      </div>

      {/* 강연 현장 — 34장 */}
      <div className="ohj3-stage-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">ON STAGE</div>
          <div className="ohj3-sec-h jua">강연 현장</div>
          <img
            src={`/ohaengja-lecture-photos/ohaengja-lecture-${lecSel+1}.png`}
            alt={`오행자 강연 현장 ${lecSel+1}`}
            className="ohj3-feature-img"
            style={{opacity: lecFade ? 1 : 0, transition:'opacity .18s ease'}}
            onError={e=>{ e.currentTarget.style.display="none"; }}/>
          <div className="ohj3-lecture-strip" ref={lecRef} onScroll={onLecScroll}>
            {Array.from({length:34},(_,i)=>i).map(i=>(
              <img key={i}
                src={`/ohaengja-lecture-photos/ohaengja-lecture-${i+1}.png`}
                alt={`강연 현장 ${i+1}`}
                onClick={()=>selectLec(i)}
                style={{
                  cursor:'pointer',
                  outline: lecSel===i ? '2.5px solid #E11D74' : '2.5px solid transparent',
                  outlineOffset: '2px',
                  borderRadius: '12px',
                  opacity: lecSel===i ? 1 : 0.75,
                  transition:'opacity .15s, outline .15s',
                }}
                onError={e=>{ e.currentTarget.style.display="none"; }}/>
            ))}
          </div>
          <div className="ohj3-scroll-track" style={{background:'rgba(0,0,0,.15)'}}>
            <div className="ohj3-scroll-handle" style={{width:`${lecPct}%`}}/>
          </div>
        </div>
      </div>

      {/* 저서 4권 (표지 있는 것만) */}
      <div className="ohj3-books-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">BOOKS</div>
          <div className="ohj3-sec-h jua">오행자의 저서</div>
          <div className="ohj3-books">
            <div className="ohj3-book"><img src="/ohaengja-book-1.png" alt="토닥토닥 힐링수다"/></div>
            <div className="ohj3-book"><img src="/ohaengja-book-2.png" alt="세상에 아프지 않은 사람은 없다"/></div>
            <div className="ohj3-book"><img src="/ohaengja-book-3.png" alt="봉숭아학당에서 다시 피어나는 꽃"/></div>
            <div className="ohj3-book"><img src="/ohaengja-book-4.jpg" alt="너 이렇게 살아봤어?"/></div>
          </div>
        </div>
      </div>

      {/* 채널 5개 */}
      <div className="ohj3-ch-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">CHANNELS</div>
          <div className="ohj3-sec-h jua">채널 둘러보기</div>
          <div className="ohj3-channels">
            <a href="https://www.youtube.com/@%EC%9B%83%EC%9D%8C%EC%B9%98%EB%A3%8C%EC%82%AC%EC%98%A4%ED%96%89%EC%9E%90" target="_blank" rel="noopener noreferrer" className="ohj3-ch ohj3-ch-me">
              <span className="ci">▶</span>
              <div className="ct"><b>웃음치료사 오행자</b><span>웃음치료사 오행자 · 유튜브</span></div>
              <span className="arr">↗</span>
            </a>
            <a href="https://www.youtube.com/@%EC%84%B1%EC%B0%BD%EC%9A%B4-i4d" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">▶</span>
              <div className="ct"><b>봉당TV</b><span>성창운 · 유튜브</span></div>
              <span className="arr">↗</span>
            </a>
            <a href="https://litt.ly/bongdang" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">🔗</span>
              <div className="ct" style={{whiteSpace:'normal'}}><b style={{whiteSpace:'normal'}}>봉숭아학당 문화혁신학교 / 웃자대한민국협회</b><span>전체 채널 한눈에</span></div>
              <span className="arr">↗</span>
            </a>
            <a href="https://cafe.naver.com/kk304915" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">☕</span>
              <div className="ct"><b>네이버 카페</b><span>봉숭아학당 커뮤니티</span></div>
              <span className="arr">↗</span>
            </a>
            <a href="https://blog.naver.com/smilekorean1" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">✎</span>
              <div className="ct"><b>웃자대한민국협회</b><span>공식 블로그</span></div>
              <span className="arr">↗</span>
            </a>
            <a href="https://www.eummedia.kr/article/%EC%98%A4%ED%96%89%EC%9E%90%EC%9B%83%EC%9D%8C%EC%B9%98%EB%A3%8C%EC%82%AC" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">▤</span>
              <div className="ct"><b>이음미디어 기사</b><span>오행자 · 인터뷰 전문</span></div>
              <span className="arr">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* 마음 (닫기) */}
      <div className="ohj3-heart">
        <div className="ohj3-inner">
          <div className="k hand">웃음 뒤의 마음</div>
          <h2 className="jua">웃기지만, 살립니다</h2>
          <p>무대에선 누구보다 크게 웃기지만, 웃음 뒤에서 사람을 살리는 일을 합니다. 지치고 아픈 마음 곁에 앉아 토닥이는 것 — 그게 이 웃음의 진짜 이유예요.</p>
          <div className="roles">
            {["봉숭아학당 문화혁신학교 교수","웃자대한민국협회 교육본부장","열린사이버대 연구교수","참나사랑연구소 소장","참생명자살예방연구소 소장"].map(r=>(
              <span key={r} className="role">{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="ohj3-cta-band">
        <div className="ohj3-inner ohj3-cta">
          <div className="line jua">이 웃음을, 당신의 무대로.</div>
          <div className="ohj3-cta-btns">
            <button onClick={()=>setFormOpen(true)} className="ohj3-btn jua" style={{border:"none",cursor:"pointer",fontFamily:"'Jua',Pretendard,sans-serif"}}>
              ✍️ 강의 문의 · 섭외하기
            </button>
            <a href="tel:010-4321-7159" className="ohj3-btn-tel jua">
              📞 바로 전화 연결
              <span className="ph2">010-4321-7159</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 강의 문의 모달 ── */}
      {formOpen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={e=>{ if(e.target===e.currentTarget) closeForm(); }}>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)"}}/>
          <div style={{position:"relative",width:"100%",maxWidth:640,maxHeight:"92vh",overflowY:"auto",
            background:"#FFF8F0",borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",fontFamily:"Pretendard,-apple-system,sans-serif"}}>
            {/* 헤더 */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:800,color:"#34122B",margin:0}}>강의 문의</h2>
                <p style={{fontSize:12.5,color:"#9A8592",margin:"4px 0 0"}}>📞 직접 문의: 010-4321-7159</p>
              </div>
              <button onClick={closeForm} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:"#9A8592"}}>
                <X size={22}/>
              </button>
            </div>

            {submitted ? (
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <CheckCircle size={52} color="#E11D74" style={{margin:"0 auto 16px"}}/>
                <p style={{fontSize:18,fontWeight:800,color:"#34122B",margin:"0 0 8px"}}>신청이 접수됐습니다!</p>
                <p style={{fontSize:13.5,color:"#9A8592",margin:"0 0 28px",lineHeight:1.6}}>곧 연락드리겠습니다.<br/>문의: 010-4321-7159</p>
                <button onClick={closeForm}
                  style={{padding:"13px 32px",borderRadius:12,background:"#E11D74",color:"#fff",fontSize:15,fontWeight:700,border:"none",cursor:"pointer"}}>
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  {label:"신청자 성함 *",key:"name",ph:"홍길동",required:true},
                  {label:"소속 *",key:"org",ph:"회사/기관/단체명",required:true},
                  {label:"연락처 *",key:"phone",ph:"010-0000-0000",required:true},
                  {label:"이메일",key:"email",ph:"example@email.com",required:false},
                ].map(f=>(
                  <label key={f.key} style={{display:"flex",flexDirection:"column",gap:5}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#34122B"}}>{f.label}</span>
                    <input value={formData[f.key]} onChange={e=>setField(f.key,e.target.value)}
                      required={f.required} placeholder={f.ph}
                      style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #FFD9E6",fontSize:14,background:"#fff",outline:"none",color:"#34122B"}}/>
                  </label>
                ))}

                <label style={{display:"flex",flexDirection:"column",gap:5}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#34122B"}}>강의 유형 *</span>
                  <select value={formData.lectureType} onChange={e=>setField('lectureType',e.target.value)} required
                    style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #FFD9E6",fontSize:14,background:"#fff",color:"#34122B"}}>
                    <option value="">선택해주세요</option>
                    {["기업 강의","공공·지자체","복지관·보건소","학교·교육기관","단체·모임","기타"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                <div>
                  <span style={{fontSize:13,fontWeight:700,color:"#34122B",display:"block",marginBottom:8}}>희망 주제 (복수선택)</span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {OHJ3_TOPICS.map(t=>(
                      <button type="button" key={t} onClick={()=>toggleTopic(t)}
                        style={{padding:"7px 14px",borderRadius:99,fontSize:12.5,fontWeight:700,
                          border:`1.5px solid ${formData.topics.includes(t) ? "#E11D74" : "#FFD9E6"}`,
                          background:formData.topics.includes(t) ? "#FFEDF3" : "#fff",
                          color:formData.topics.includes(t) ? "#E11D74" : "#9A8592",
                          cursor:"pointer"}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {[
                  {label:"희망 일시",key:"datetime",ph:"예: 2026-09-15 오후"},
                  {label:"예상 인원",key:"headcount",ph:"예: 50명"},
                  {label:"장소",key:"location",ph:"지역 또는 온라인 여부"},
                ].map(f=>(
                  <label key={f.key} style={{display:"flex",flexDirection:"column",gap:5}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#34122B"}}>{f.label}</span>
                    <input value={formData[f.key]} onChange={e=>setField(f.key,e.target.value)} placeholder={f.ph}
                      style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #FFD9E6",fontSize:14,background:"#fff",outline:"none",color:"#34122B"}}/>
                  </label>
                ))}

                <label style={{display:"flex",flexDirection:"column",gap:5}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#34122B"}}>강의 시간</span>
                  <select value={formData.duration} onChange={e=>setField('duration',e.target.value)}
                    style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #FFD9E6",fontSize:14,background:"#fff",color:"#34122B"}}>
                    <option value="">선택</option>
                    {["1시간","2시간","반일","종일","협의"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                <label style={{display:"flex",flexDirection:"column",gap:5}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#34122B"}}>추가 요청사항</span>
                  <textarea value={formData.note} onChange={e=>setField('note',e.target.value)}
                    rows={3} placeholder="자유롭게 적어주세요"
                    style={{padding:"11px 14px",borderRadius:10,border:"1.5px solid #FFD9E6",fontSize:14,background:"#fff",resize:"vertical",outline:"none",color:"#34122B"}}/>
                </label>

                {submitErr && <p style={{fontSize:13,color:"#E11D74",margin:0}}>{submitErr}</p>}

                <button type="submit" disabled={submitting}
                  style={{marginTop:4,padding:"15px",borderRadius:14,
                    background:submitting?"#ccc":"linear-gradient(120deg,#FF6A3D,#E11D74)",
                    color:"#fff",fontSize:15.5,fontWeight:800,border:"none",
                    cursor:submitting?"not-allowed":"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <Send size={17}/> {submitting ? "제출 중..." : "강의 신청 보내기"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

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

/* ══════════════════════════════════════
   최일례 대표 프로필 — /pium-app/choiilrye
══════════════════════════════════════ */
function CirContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      setErr('성함, 연락처, 문의 내용을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true); setErr('');
    try {
      const res = await fetch('/api/cir-lecture-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setSubmitted(true);
      } else {
        setErr(data.error || '전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setErr('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 0', color: '#c8a04a', fontSize: 15 }}>
        ✅ 문의가 전송됐습니다.<br />
        <span style={{ fontSize: 13, color: '#8d8697', marginTop: 6, display: 'block' }}>최일례 대표님께 알림이 발송됐습니다.</span>
      </div>
    );
  }

  return (
    <form className="cir-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="성함" value={form.name} onChange={set('name')} />
      <input type="tel" placeholder="연락처" value={form.phone} onChange={set('phone')} />
      <textarea placeholder="문의 내용을 남겨주세요" value={form.message} onChange={set('message')} />
      {err && <div style={{ fontSize: 12.5, color: '#ff9d86' }}>{err}</div>}
      <button type="submit" disabled={submitting}>{submitting ? '전송 중…' : '문의 남기기'}</button>
    </form>
  );
}

function ChoiilryePage() {
  const [libIdx, setLibIdx] = useState(0);
  const libTotal = 3;

  function goLib(k) {
    setLibIdx(((k % libTotal) + libTotal) % libTotal);
  }

  const [touchX, setTouchX] = useState(null);

  const css = `
:root{
  --ink:#141019;--gold:#e0a91f;--gold-l:#f7d777;--coral:#e2593f;
  --ivory:#faf6ee;--paper:#fffdf8;--gray:#8d8697;--line:rgba(255,255,255,.10);
  --wood:#6b4526;--wood-d:#3d2614;
}
.cir-wrap{max-width:480px;margin:0 auto;background:var(--ink);overflow:hidden;font-family:'Pretendard',-apple-system,sans-serif;color:var(--ivory);line-height:1.72;word-break:keep-all}
.cir-wrap *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.cir-wrap section{padding:52px 26px}
.cir-wrap .eyebrow{font-size:11px;letter-spacing:.22em;color:var(--gold);font-weight:700;text-transform:uppercase;margin-bottom:10px}
.cir-wrap h2{font-size:23px;font-weight:800;letter-spacing:-.02em;margin-bottom:6px}
.cir-wrap .sub{font-size:13.5px;color:var(--gray);font-weight:400;margin-bottom:26px}
.cir-wrap .rule{width:34px;height:3px;background:var(--gold);border-radius:2px;margin-bottom:22px}
/* hero */
.cir-hero{position:relative;padding:56px 26px 48px;text-align:center;background:radial-gradient(120% 80% at 50% 0%,#4a2f1a 0%,transparent 60%),linear-gradient(180deg,#241a12 0%,var(--ink) 100%)}
.cir-hero-brand{font-size:11.5px;letter-spacing:.28em;color:var(--gold-l);font-weight:700;margin-bottom:30px;opacity:.9}
.cir-hero-en{font-family:'Georgia',serif;font-weight:700;font-size:44px;line-height:1;letter-spacing:.16em;color:var(--gold-l);margin-top:4px;text-shadow:0 2px 18px rgba(0,0,0,.5)}
.cir-hero-div{width:44px;height:3px;background:var(--gold);border-radius:2px;margin:18px auto}
.cir-hero h1{font-size:46px;font-weight:800;letter-spacing:-.04em;line-height:1.1}
.cir-hero-sub{margin-top:11px;font-size:14px;font-weight:600;color:var(--gold-l);letter-spacing:.01em}
.cir-hero-tag{margin-top:16px;font-size:16.5px;font-weight:700;color:var(--paper);line-height:1.55}
.cir-hero-tag em{font-style:normal;color:var(--gold)}
.cir-hero-figure{position:relative;margin:30px -26px 0;border-top:2px solid rgba(224,169,31,.55);overflow:hidden}
.cir-hero-photo{width:100%;display:block}
.cir-hero-figure::after{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(20,16,25,.38) 0%,rgba(20,16,25,0) 26%,rgba(20,16,25,0) 58%,rgba(20,16,25,.92) 100%)}
.cir-sig{position:absolute;z-index:2;left:50%;bottom:14px;transform:translateX(-50%);width:78%;pointer-events:none;filter:drop-shadow(0 3px 7px rgba(0,0,0,.9)) drop-shadow(0 0 16px rgba(0,0,0,.75))}
/* stats */
.cir-hero-stats{display:flex;gap:10px;margin-top:22px}
.cir-stat{flex:1;background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:14px;padding:15px 8px;text-align:center}
.cir-stat b{display:block;font-size:21px;font-weight:800;color:var(--gold);letter-spacing:-.02em}
.cir-stat span{display:block;font-size:10.5px;color:var(--gray);margin-top:3px;line-height:1.45}
.cir-stat-wide{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px;background:rgba(224,169,31,.10);border:1px solid rgba(224,169,31,.35);border-radius:14px;padding:14px 10px}
.cir-stat-wide b{font-size:21px;font-weight:800;color:var(--gold);letter-spacing:-.02em}
.cir-stat-wide span{font-size:12.5px;color:var(--paper);font-weight:600}
/* press */
.cir-press{padding:0 26px 52px;margin-top:-14px}
.cir-press-card{background:linear-gradient(135deg,rgba(224,169,31,.14),rgba(255,255,255,.04));border:1px solid rgba(224,169,31,.30);border-radius:18px;padding:22px 20px}
.cir-press-card .badge{display:inline-block;font-size:10.5px;font-weight:800;letter-spacing:.14em;background:var(--gold);color:#241a12;border-radius:6px;padding:3px 9px;margin-bottom:12px}
.cir-press-card h3{font-size:17.5px;font-weight:800;line-height:1.45;letter-spacing:-.02em}
.cir-press-card p{font-size:13.5px;color:var(--gray);margin-top:8px}
.cir-press-card a{display:block;text-align:center;margin-top:16px;text-decoration:none;background:rgba(255,255,255,.10);border:1px solid rgba(224,169,31,.45);color:var(--gold-l);font-weight:700;font-size:14px;border-radius:11px;padding:13px}
/* library */
.cir-library{background:radial-gradient(100% 60% at 50% 0%,rgba(224,169,31,.07),transparent 70%),linear-gradient(180deg,#191218,#141019)}
.woodH{background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.10) 0 1px,rgba(0,0,0,.17) 1px 2px,rgba(0,0,0,0) 2px 5px),repeating-linear-gradient(178.8deg,rgba(0,0,0,.13) 0 2px,rgba(255,255,255,.05) 2px 5px,rgba(0,0,0,.06) 5px 9px,rgba(255,255,255,.02) 9px 13px),linear-gradient(180deg,#b07c46 0%,#94612f 30%,#6b4423 66%,#3a2612 100%)}
.woodV{background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.085) 0 1px,rgba(0,0,0,.19) 1px 2px,rgba(0,0,0,0) 2px 6px),repeating-linear-gradient(89.4deg,rgba(0,0,0,.14) 0 3px,rgba(255,255,255,.045) 3px 7px,rgba(0,0,0,.06) 7px 12px,rgba(255,255,255,.02) 12px 18px),linear-gradient(90deg,#96683a 0%,#734829 22%,#5a361c 50%,#734829 78%,#8a5e34 100%)}
.cir-case{border-radius:15px;overflow:hidden;border:1px solid #170d06;box-shadow:inset 0 0 40px rgba(0,0,0,.55),0 14px 32px rgba(0,0,0,.5)}
.cir-case-top{height:20px;border-bottom:1px solid rgba(0,0,0,.62);box-shadow:inset 0 2px 0 rgba(255,255,255,.16)}
.cir-case-body{position:relative;padding:0 13px}
.cir-shelf-carousel{overflow:hidden;position:relative;background:repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 1px,rgba(0,0,0,.16) 1px 3px,rgba(0,0,0,.05) 3px 34px,rgba(0,0,0,.20) 34px 36px),linear-gradient(180deg,#1a120c,#0d0806);box-shadow:inset 0 0 30px rgba(0,0,0,.9),inset 0 3px 8px rgba(0,0,0,.8)}
.cir-shelf-track{display:flex;transition:transform .42s cubic-bezier(.4,0,.2,1)}
.cir-shelf-slide{flex:0 0 100%;min-width:0;max-width:100%;padding:14px 12px 6px}
.cir-shelf{margin-bottom:14px}
.cir-shelf:last-child{margin-bottom:6px}
.cir-shelf-row{display:flex;gap:9px;align-items:flex-end;padding:0 5px}
.cir-book{flex:1 1 0;min-width:0;aspect-ratio:.667;position:relative;border-radius:2px 5px 5px 2px;background:#241a12;box-shadow:0 6px 12px rgba(0,0,0,.55),0 1px 3px rgba(0,0,0,.7);overflow:hidden}
.cir-book img{width:100%;height:100%;object-fit:cover;display:block}
.cir-book-band{position:absolute;left:0;top:0;bottom:0;width:7%;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.42),rgba(0,0,0,.12) 45%,rgba(0,0,0,0))}
.cir-book-gloss{position:absolute;inset:0;pointer-events:none;background:linear-gradient(102deg,rgba(255,255,255,.20) 0%,rgba(255,255,255,.04) 16%,rgba(255,255,255,0) 34%,rgba(0,0,0,0) 74%,rgba(0,0,0,.26) 100%)}
.cir-plank{height:17px;margin-top:-3px;border-radius:2px;margin-left:-6px;margin-right:-6px;box-shadow:0 8px 16px rgba(0,0,0,.65),inset 0 1.5px 0 rgba(255,255,255,.32),inset 0 -3px 4px rgba(0,0,0,.55)}
.cir-case-bot{height:22px;border-top:1px solid rgba(0,0,0,.55);box-shadow:inset 0 2px 0 rgba(255,255,255,.12)}
.cir-lib-nav{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px}
.cir-lib-btn{width:38px;height:38px;border-radius:50%;border:1px solid rgba(224,169,31,.45);background:rgba(255,255,255,.06);color:var(--gold-l);font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.cir-dots{display:flex;gap:7px}
.cir-dot{width:8px;height:8px;border-radius:50%;border:0;padding:0;cursor:pointer;background:rgba(255,255,255,.22)}
.cir-dot.on{background:var(--gold);width:20px;border-radius:4px}
.cir-lib-count{text-align:center;font-size:12px;color:var(--gray);margin-top:12px}
/* fold */
.cir-fold{border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.035);margin-bottom:11px;overflow:hidden}
.cir-fold summary{list-style:none;cursor:pointer;padding:17px 19px;display:flex;align-items:center;gap:12px}
.cir-fold summary::-webkit-details-marker{display:none}
.cir-fold .f-k{font-size:10.5px;letter-spacing:.2em;color:var(--gold);font-weight:700;text-transform:uppercase;display:block}
.cir-fold .f-t{font-size:17px;font-weight:800;letter-spacing:-.02em;display:block;margin-top:2px}
.cir-fold .f-arw{margin-left:auto;flex:0 0 26px;height:26px;border-radius:50%;border:1px solid rgba(224,169,31,.45);color:var(--gold-l);display:flex;align-items:center;justify-content:center;font-size:11px;transition:transform .25s}
.cir-fold[open] .f-arw{transform:rotate(180deg);background:rgba(224,169,31,.16)}
.cir-fold[open] summary{border-bottom:1px solid var(--line)}
.cir-fold .f-body{padding:20px 19px 22px}
/* timeline */
.cir-tl{position:relative;padding-left:26px}
.cir-tl:before{content:'';position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg,var(--gold),rgba(224,169,31,.12))}
.cir-tl-item{position:relative;padding-bottom:26px}
.cir-tl-item:last-child{padding-bottom:0}
.cir-tl-item:before{content:'';position:absolute;left:-26px;top:7px;width:13px;height:13px;border-radius:50%;background:var(--ink);border:3px solid var(--gold)}
.cir-tl-when{font-size:11.5px;font-weight:700;color:var(--gold);letter-spacing:.08em}
.cir-tl-what{font-size:15.5px;font-weight:700;margin-top:3px}
.cir-tl-note{font-size:13px;color:var(--gray);margin-top:5px}
/* quote */
.cir-quote{background:rgba(255,255,255,.045);border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:0 14px 14px 0;padding:18px 16px;margin-bottom:12px}
.cir-quote p{font-size:14.5px;font-weight:600;line-height:1.7}
.cir-quote cite{display:block;font-style:normal;font-size:12px;color:var(--gray);margin-top:9px}
.cir-hhcc{text-align:center;border:1px dashed rgba(224,169,31,.45);border-radius:16px;padding:22px 16px;margin-top:8px;background:rgba(224,169,31,.05)}
.cir-hhcc b{font-size:32px;font-weight:800;color:var(--gold);letter-spacing:.06em;display:block}
.cir-hhcc span{font-size:13.5px;color:var(--ivory);display:block;margin-top:8px}
.cir-guide{margin-top:22px;display:grid;gap:10px}
.cir-guide-row{display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.04);border-radius:13px;padding:15px 16px}
.cir-guide-row i{font-style:normal;flex:0 0 26px;height:26px;border-radius:50%;background:var(--gold);color:#241a12;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
.cir-guide-row b{display:block;font-size:14.5px;font-weight:700}
.cir-guide-row p{font-size:13px;color:var(--gray);margin-top:2px}
/* cards */
.cir-cards{display:grid;gap:11px}
.cir-card{background:rgba(255,255,255,.045);border:1px solid var(--line);border-radius:15px;padding:16px 17px}
.cir-card b{font-size:14.5px;font-weight:700;display:block}
.cir-card p{font-size:13px;color:var(--gray);margin-top:4px}
.cir-awardbar{display:flex;align-items:center;gap:12px;margin-bottom:11px;background:rgba(224,169,31,.10);border:1px solid rgba(224,169,31,.35);border-radius:15px;padding:16px 17px}
.cir-awardbar i{font-style:normal;font-size:24px}
.cir-awardbar b{display:block;font-size:15px;font-weight:800;color:var(--gold-l)}
.cir-awardbar span{font-size:12.5px;color:var(--gray)}
.cir-tagwrap{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}
.cir-tag{font-size:12px;padding:6px 12px;border-radius:8px;background:rgba(255,255,255,.06);color:var(--ivory);font-weight:500}
/* channels */
.cir-ch{display:grid;gap:10px}
.cir-ch a{display:flex;align-items:center;gap:13px;text-decoration:none;color:var(--ivory);background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:14px;padding:15px 17px}
.cir-ch a i{font-style:normal;font-size:19px;width:24px;text-align:center}
.cir-ch a b{font-size:14.5px;font-weight:700;display:block}
.cir-ch a span{font-size:12px;color:var(--gray)}
.cir-ch a em{margin-left:auto;font-style:normal;color:var(--gray);font-size:17px}
/* video */
.cir-vids{display:flex;flex-direction:column;gap:14px}
.cir-vid{display:block;border-radius:14px;overflow:hidden;background:#15121c;border:1px solid rgba(255,255,255,.09);text-decoration:none}
.cir-vid-thumb{position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,#2a2233,#171320);display:flex;align-items:center;justify-content:center}
.cir-vid-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.cir-vid-thumb::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%)}
.cir-play{position:absolute;z-index:2;width:54px;height:54px;border-radius:50%;background:rgba(226,45,45,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.5)}
.cir-play::before{content:'';border-left:17px solid #fff;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px}
.cir-vid-body{padding:13px 15px 15px}
.cir-vid-body b{display:block;font-size:14.5px;color:var(--ivory);font-weight:700;line-height:1.45}
.cir-vid-body>span{display:block;font-size:11.5px;color:var(--gray);margin-top:5px}
/* shorts */
.cir-shorts{display:flex;gap:11px;overflow-x:auto;padding:2px 26px 12px;margin:0 -26px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.cir-shorts::-webkit-scrollbar{display:none}
.cir-short{flex:0 0 132px;scroll-snap-align:start;text-decoration:none;border-radius:12px;overflow:hidden;position:relative;background:linear-gradient(150deg,#2a2233,#171320);border:1px solid rgba(255,255,255,.09)}
.cir-short-thumb{position:relative;aspect-ratio:9/16;display:flex;align-items:center;justify-content:center}
.cir-short-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.cir-short-thumb::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.62) 100%)}
.cir-short-n{position:absolute;z-index:2;top:8px;left:8px;font-size:10.5px;font-weight:800;color:#fff;background:rgba(0,0,0,.55);border-radius:5px;padding:2px 6px}
.cir-short-play{position:absolute;z-index:2;width:38px;height:38px;border-radius:50%;background:rgba(226,45,45,.9);display:flex;align-items:center;justify-content:center}
.cir-short-play::before{content:'';border-left:12px solid #fff;border-top:7px solid transparent;border-bottom:7px solid transparent;margin-left:3px}
.cir-short-cap{padding:9px 10px 11px;font-size:11.5px;color:var(--paper);font-weight:600;line-height:1.4}
.cir-swipehint{font-size:11.5px;color:var(--gray);margin-top:-2px}
.cir-vhead{display:flex;align-items:center;gap:16px;justify-content:space-between}
.cir-vhead-txt{flex:1 1 auto;min-width:0}
.cir-vhead-pic{flex:0 0 auto;margin:0;text-align:center}
.cir-vhead-pic img{width:92px;height:92px;border-radius:50%;object-fit:cover;display:block;border:2px solid rgba(224,169,31,.55);box-shadow:0 8px 20px rgba(0,0,0,.5),0 0 0 6px rgba(224,169,31,.08)}
.cir-vhead-pic figcaption{margin-top:8px;font-size:10.5px;line-height:1.4;color:var(--gold-l);font-weight:700;letter-spacing:.01em}
/* cta */
.cir-cta{background:linear-gradient(180deg,#241a12,#141019);text-align:center}
.cir-call{display:block;text-decoration:none;background:var(--gold);color:#241a12;font-weight:800;font-size:17.5px;border-radius:14px;padding:17px;box-shadow:0 10px 26px rgba(224,169,31,.28)}
.cir-form{margin-top:14px;text-align:left;display:grid;gap:10px}
.cir-form input,.cir-form textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:12px;padding:14px 15px;color:var(--ivory);font-size:14.5px;font-family:inherit}
.cir-form textarea{min-height:96px;resize:vertical}
.cir-form input::placeholder,.cir-form textarea::placeholder{color:#6f6879}
.cir-form button{background:rgba(255,255,255,.10);border:1px solid rgba(224,169,31,.45);color:var(--gold-l);font-weight:700;font-size:15.5px;border-radius:12px;padding:15px;font-family:inherit;cursor:pointer;width:100%}
.cir-note{font-size:11.5px;color:var(--gray);margin-top:12px;line-height:1.6}
.cir-footer{text-align:center;padding:34px 26px 44px;font-size:11.5px;color:#5f5a6b;border-top:1px solid rgba(255,255,255,.06)}
.cir-needbox{margin-top:16px;border:1px solid rgba(226,89,63,.5);background:rgba(226,89,63,.10);border-radius:12px;padding:14px 16px;font-size:12.5px;color:#ffd9d1;line-height:1.65}
.cir-needbox b{color:#ff9d86;font-size:12.5px}
.cir-needbox b.h{display:block;margin-bottom:5px}
.cir-need{display:inline-block;font-size:10.5px;font-weight:700;background:#e2593f;color:#fff;border-radius:5px;padding:2px 7px;margin-left:6px;vertical-align:2px}
`;

  function Book({ src, alt }) {
    return (
      <div className="cir-book">
        <img src={src} alt={alt} loading="lazy" />
        <span className="cir-book-band" />
        <span className="cir-book-gloss" />
      </div>
    );
  }

  function ShelfSlide({ books, ghostShelf }) {
    const rows = [];
    for (let i = 0; i < books.length; i += 3) {
      rows.push(books.slice(i, i + 3));
    }
    return (
      <div className="cir-shelf-slide">
        {rows.map((row, ri) => (
          <div key={ri} className="cir-shelf">
            <div className="cir-shelf-row">
              {row.map((b, bi) => <Book key={bi} src={b.src} alt={b.alt} />)}
            </div>
            <div className="cir-plank woodH" />
          </div>
        ))}
        {ghostShelf && (
          <div className="cir-shelf" style={{ marginBottom: 6 }}>
            <div className="cir-shelf-row">
              <div className="book book-ghost" />
              <div className="book book-ghost" />
              <div className="book book-ghost" />
            </div>
            <div className="cir-plank woodH" />
          </div>
        )}
      </div>
    );
  }

  const allBooks = Array.from({ length: 42 }, (_, i) => ({
    src: `/pium-app/choiilrye/books/book-${String(i + 1).padStart(2, '0')}.jpg`,
    alt: `최일례 전자책 ${i + 1}`,
  }));

  const slides = [
    allBooks.slice(0, 15),
    allBooks.slice(15, 30),
    allBooks.slice(30, 42),
  ];

  return (
    <div className="cir-wrap">
      <style>{css}</style>

      {/* 히어로 */}
      <header className="cir-hero">
        <div className="cir-hero-brand">PIUM 전문가 프로필</div>
        <div className="cir-hero-en">CHOI IL RYUE</div>
        <div className="cir-hero-div" />
        <h1>최일례</h1>
        <div className="cir-hero-sub">이음미디어 대표 · 소통공감박사<br />책쓰기 전임교수 · 마이금융파트너 지점장</div>
        <div className="cir-hero-tag">하는 일마다 일내는 여자,<br /><em>"오라이!"</em>로 길을 여는 사람</div>
        <figure className="cir-hero-figure">
          <img className="cir-hero-photo" src="/pium-app/choiilrye/hero.jpg" alt="최일례 대표" />
          <svg className="cir-sig" viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg" aria-label="Choi il-ryue"><defs><linearGradient id="sigG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff6dd"/><stop offset="55%" stopColor="#f2cb63"/><stop offset="100%" stopColor="#e0a91f"/></linearGradient></defs><path d="M 250 88 C 238 60, 188 44, 146 62 C 96 83, 74 146, 92 186 C 110 226, 168 242, 210 226 C 228 219, 238 209, 244 198" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 284 214 C 292 178, 300 122, 302 96 C 303 74, 296 62, 286 66 C 274 71, 274 100, 282 132 C 291 168, 300 192, 302 212 C 306 184, 318 164, 336 162 C 356 160, 366 178, 364 198 L 363 212" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 428 170 C 410 148, 374 150, 364 176 C 354 200, 368 218, 392 218 C 412 218, 428 204, 428 188 C 428 180, 428 174, 428 170" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 428 190 C 440 188, 452 183, 462 176" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 470 200 C 476 182, 484 166, 490 158 C 486 176, 482 194, 486 204 C 490 212, 500 210, 508 202" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 556 200 C 562 182, 570 166, 576 158 C 572 176, 568 194, 572 204 C 576 212, 586 210, 594 202" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 602 202 C 610 170, 622 118, 628 88 C 632 66, 626 56, 616 60 C 606 64, 606 92, 614 124 C 622 158, 630 186, 632 202 C 634 210, 642 212, 650 204" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 660 180 L 700 176" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 708 206 C 714 186, 720 168, 724 158 C 722 174, 720 188, 722 196 C 730 178, 744 164, 758 166 C 766 167, 770 172, 770 178" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 778 160 C 782 180, 788 196, 796 204 C 804 212, 812 206, 818 192 C 824 176, 828 164, 830 158 C 826 188, 820 226, 810 252 C 802 272, 788 280, 778 274 C 770 269, 770 260, 778 256" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 840 160 C 836 182, 836 200, 844 208 C 854 216, 868 206, 874 188 C 878 176, 880 166, 881 160 C 877 180, 874 196, 876 204 C 878 210, 884 210, 890 204" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 892 192 C 904 186, 918 184, 926 178 C 932 173, 928 162, 918 162 C 904 162, 892 178, 894 196 C 896 212, 912 218, 928 208" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M 928 208 C 958 218, 964 244, 932 254 C 875 268, 420 268, 300 252 C 274 248, 272 236, 296 230" fill="none" stroke="url(#sigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="486" cy="128" r="5.5" fill="url(#sigG)"/><circle cx="572" cy="128" r="5.5" fill="url(#sigG)"/></svg>
        </figure>
      </header>

      {/* 스탯 */}
      <div className="cir-press" style={{ marginTop: 0, paddingBottom: 34 }}>
        <div className="cir-hero-stats">
          <div className="cir-stat"><b>670회</b><span>아침 7시<br />유산소운동<br />최일례TV</span></div>
          <div className="cir-stat"><b>60여 권</b><span>펴낸 전자책</span></div>
          <div className="cir-stat"><b>2026</b><span>효부대상</span></div>
        </div>
        <div className="cir-stat-wide"><b>150여 명</b><span>전자책 작가 배출</span></div>
      </div>

      {/* 기사 배너 */}
      <div className="cir-press">
        <div className="cir-press-card">
          <span className="badge">PRESS</span>
          <h3>절망의 벼랑 끝에서 '오라이!'를 외치다</h3>
          <p>"갑상선암과 강직성 척추염도 꺾지 못한, 똑순이의 500회 기적"<br />— 이음미디어 Special Issue</p>
          <a href="https://www.eummedia.kr/article/169997947" target="_blank" rel="noopener noreferrer">기사 전문 보기 →</a>
        </div>
      </div>

      {/* 서재 */}
      <section className="cir-library">
        <div className="eyebrow">Library</div>
        <h2>최일례의 서재</h2>
        <div className="sub">지금까지 펴낸 전자책 60여 권. 그중 표지를 받은 42권을 꽂았습니다. 좌우로 넘겨서 보세요.</div>
        <div className="rule" />

        <div className="cir-case">
          <div className="cir-case-top woodH" />
          <div className="cir-case-body woodV">
            <div className="cir-shelf-carousel">
              <div
                className="cir-shelf-track"
                style={{ transform: `translateX(-${libIdx * 100}%)` }}
                onTouchStart={e => setTouchX(e.touches[0].clientX)}
                onTouchEnd={e => {
                  if (touchX === null) return;
                  const dx = e.changedTouches[0].clientX - touchX;
                  if (Math.abs(dx) > 40) goLib(dx < 0 ? libIdx + 1 : libIdx - 1);
                  setTouchX(null);
                }}
              >
                {slides.map((books, si) => <ShelfSlide key={si} books={books} ghostShelf={si === slides.length - 1} />)}
              </div>
            </div>
          </div>
          <div className="cir-case-bot woodH" />
        </div>

        <div className="cir-lib-nav">
          <button className="cir-lib-btn" onClick={() => goLib(libIdx - 1)} aria-label="이전">‹</button>
          <div className="cir-dots">
            {[0, 1, 2].map(i => (
              <button key={i} className={`cir-dot${libIdx === i ? ' on' : ''}`} onClick={() => goLib(i)} aria-label={`${i + 1}쪽`} />
            ))}
          </div>
          <button className="cir-lib-btn" onClick={() => goLib(libIdx + 1)} aria-label="다음">›</button>
        </div>
        <div className="cir-lib-count">{libIdx + 1} / 3 쪽 · 표지를 받은 42권</div>
      </section>

      {/* 더 알아보기 */}
      <section>
        <div className="eyebrow">More</div>
        <h2>더 알아보기</h2>
        <div className="sub">평소엔 접혀 있습니다. 눌러서 펼쳐 보세요.</div>
        <div className="rule" />

        <details className="cir-fold">
          <summary>
            <span><span className="f-k">Career</span><span className="f-t">걸어온 길</span></span>
            <span className="f-arw">▾</span>
          </summary>
          <div className="f-body">
            <div className="sub">기사에 실린 내용만 담았습니다. 연도는 대표님 확인 후 채웁니다.</div>
            <div className="cir-tl">
              <div className="cir-tl-item">
                <div className="cir-tl-when">시작 <span className="cir-need">연도 확인</span></div>
                <div className="cir-tl-what">학교 앞에서 신문을 팔던 소녀</div>
                <div className="cir-tl-note">가난 때문에 남들보다 일찍 사회로 나섰습니다. 작은 몸에 잘 웃는 그에게 많은 사람이 신문을 샀습니다.</div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">청년기 <span className="cir-need">연도 확인</span></div>
                <div className="cir-tl-what">버스 안내양 — "오라이!"의 시작</div>
                <div className="cir-tl-note">야간 고등학교를 다니기 위해 버스 안내양으로 일하며 세상을 몸으로 배웠습니다.</div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">시련 <span className="cir-need">연도 확인</span></div>
                <div className="cir-tl-what">갑상선암 수술, 그리고 강직성 척추염</div>
                <div className="cir-tl-note">큰 고비를 넘기자마자 자가면역질환이 찾아왔습니다. 그 병상에서 "입을 열면 살 수 있다"는 것을 깨달았습니다.</div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">전환 <span className="cir-need">연도 확인</span></div>
                <div className="cir-tl-what">봉숭아학당 문화혁신학교에서 방송 스피치를 배우다</div>
                <div className="cir-tl-note">내면의 응어리를 목소리로 뱉어내기 시작했습니다. 지금은 같은 학교의 방송스피치 총동문회장이자 책쓰기 교수로 서 있습니다.</div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">기록 <span className="cir-need">연도 확인</span></div>
                <div className="cir-tl-what">최일례TV — 매일 아침 7시, 670회</div>
                <div className="cir-tl-note">비가 오나 눈이 오나 아침 7시 약속을 지켰습니다. 이 숫자는 영상 개수가 아니라 버텨낸 날의 수입니다.</div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">2026</div>
                <div className="cir-tl-what">효부대상 수상</div>
                <div className="cir-tl-note">가족을 지켜온 시간에 대한 상입니다. <span className="cir-need">주최 기관 확인</span></div>
              </div>
              <div className="cir-tl-item">
                <div className="cir-tl-when">현재</div>
                <div className="cir-tl-what">이음미디어 대표</div>
                <div className="cir-tl-note">소외된 가치를 발굴하고, 다시 시작하려는 사람들에게 '마당'을 깔아주는 일을 합니다.</div>
              </div>
            </div>
          </div>
        </details>

        <details className="cir-fold">
          <summary>
            <span><span className="f-k">Philosophy</span><span className="f-t">일하는 원칙</span></span>
            <span className="f-arw">▾</span>
          </summary>
          <div className="f-body">
            <div className="sub">기사에서 대표님이 직접 하신 말씀입니다.</div>
            <div className="cir-quote"><p>"버스 문을 두드리며 외치던 '오라이!'는 제 앞길을 막아선 가난을 향해<br />'비켜라, 내가 간다!'라고 외치는 제 나름의 선포였던 셈이죠."</p><cite>— 최일례</cite></div>
            <div className="cir-quote"><p>"가만히 있으면 죽지만, 입을 열고 세상을 향해 말을 하면 살 수 있다는 것을요."</p><cite>— 병상에서의 깨달음</cite></div>
            <div className="cir-quote"><p>"입을 여니 인생의 문이 열렸습니다. 발성(發聲)이 곧 발복(發福)이 되더군요."</p><cite>— 방송 스피치를 배우고 나서</cite></div>
            <div className="cir-hhcc">
              <b>HHCC</b>
              <span>하라면 하라는 대로, 시키면 시키는 대로</span>
              <span style={{ color: '#8d8697', fontSize: '12.5px', marginTop: 6 }}>분석하느라 시간을 허비하지 않는다. 일단 저지르고 반응을 보며 고쳐 나간다.</span>
            </div>
            <div className="cir-guide">
              <div className="cir-guide-row"><i>1</i><div><b>과거를 훈장으로 삼으라</b><p>고단했던 시절이 지금 당신의 근육이 됩니다.</p></div></div>
              <div className="cir-guide-row"><i>2</i><div><b>배운 즉시 저질러라</b><p>완벽주의는 실패의 지름길. 서툴더라도 오늘 "오라이!"를 외치세요.</p></div></div>
              <div className="cir-guide-row"><i>3</i><div><b>도구로 자신을 무장하라</b><p>AI와 책 쓰기는 당신의 목소리를 증폭시킬 가장 강력한 무기입니다.</p></div></div>
            </div>
          </div>
        </details>

        <details className="cir-fold">
          <summary>
            <span><span className="f-k">Work</span><span className="f-t">하는 일</span></span>
            <span className="f-arw">▾</span>
          </summary>
          <div className="f-body">
            <div className="sub">보내주신 프로필 자료에 적힌 직함을 그대로 옮겼습니다.</div>
            <div className="cir-awardbar"><i>🏅</i><div><b>2026년 효부대상</b><span>수상 <span className="cir-need">주최 기관 확인</span></span></div></div>
            <div className="cir-cards">
              <div className="cir-card"><b>이음미디어 대표</b><p>소외된 가치를 발굴해 세상과 잇습니다. 월간 매거진을 함께 펴냅니다.</p></div>
              <div className="cir-card"><b>한국디지털교육원 책쓰기 전임교수</b><p>전자책 작가 <b>150여 명</b>을 배출했습니다.</p></div>
              <div className="cir-card"><b>봉숭아학당 문화혁신학교 책쓰기 교수 · 방송스피치 총동문회장</b><p>대표님이 방송 스피치를 배운 곳에서, 이제는 가르치고 이끄는 자리에 섰습니다.</p></div>
              <div className="cir-card"><b>유튜브 전문 강사 · 시니어 디지털 교육</b><p>시니어에게 유튜브와 AI 도구를 가르칩니다.</p></div>
              <div className="cir-card"><b>실버 레크리에이션 · 실버 전래놀이 강사</b><p>현장에서 어르신들과 직접 만나 웃음을 나눕니다.</p></div>
              <div className="cir-card"><b>마이금융파트너 비에프본부 지점장</b><p>(주)현대해상 판매자회사. 보험 · 재무 상담으로 사람들의 살림을 지킵니다.</p></div>
            </div>
            <div className="cir-tagwrap">
              {['소통공감박사','AI 디지털 리터러시 1급 지도사','AI 디지털 리터러시 강사','AI 코에디터 책쓰기 강사','AI 책쓰기 1급 지도사 강사','방송스피치지도사 1급','웃음건강지도사 1급','스마트폰활용 전문강사 1급','건강지도사 1급','웰다잉지도사 전문강사'].map(t => (
                <span key={t} className="cir-tag">{t}</span>
              ))}
            </div>
          </div>
        </details>
      </section>

      {/* 영상 — B-2: 채널보다 앞으로 */}
      <section>
        <div className="eyebrow">Video</div>
        <div className="cir-vhead">
          <div className="cir-vhead-txt">
            <h2>대표 영상</h2>
            <div className="sub">최일례TV에서 바로 재생됩니다.</div>
          </div>
          <figure className="cir-vhead-pic">
            <img src="/pium-app/choiilrye/cardio.jpg" alt="최일례 대표" />
            <figcaption>'청바지' 회원과<br />아침 7시 유산소운동</figcaption>
          </figure>
        </div>
        <div className="rule" />
        <div className="cir-vids">
          <a className="cir-vid" href="https://youtu.be/UfurejLigt8" target="_blank" rel="noopener noreferrer">
            <div className="cir-vid-thumb">
              <img src="https://i.ytimg.com/vi/UfurejLigt8/hqdefault.jpg" alt="나의 AI 친구, 책 쓰는 삶을 바꾸다" loading="lazy" />
              <span className="cir-play" />
            </div>
            <div className="cir-vid-body"><b>나의 AI 친구, 책 쓰는 삶을 바꾸다 <span className="cir-need">제목 확인</span></b><span>최일례TV · 유튜브에서 보기</span></div>
          </a>
          <a className="cir-vid" href="https://youtu.be/-sXnNqDpRN8" target="_blank" rel="noopener noreferrer">
            <div className="cir-vid-thumb">
              <img src="https://i.ytimg.com/vi/-sXnNqDpRN8/hqdefault.jpg" alt="6시간 만에 책 쓰고 출판하기" loading="lazy" />
              <span className="cir-play" />
            </div>
            <div className="cir-vid-body"><b>6시간 만에 책 쓰고 출판하기 <span className="cir-need">제목 확인</span></b><span>최일례TV · 유튜브에서 보기</span></div>
          </a>
        </div>

        <h2 style={{ marginTop: 34 }}>숏츠</h2>
        <div className="cir-swipehint">좌우로 밀어서 보세요 · 6편</div>
        <div className="cir-shorts">
          {[
            { id: 'MOue21fusSU', cap: '펀하게 살거야' },
            { id: 'xQyEb5E_EsE', cap: '보고 또 보고 또 보고 싶은 아령 들고 팔운동' },
            { id: '8I7lMYdPwWs', cap: '뭐가 포인트일까요?' },
            { id: 'Q04Itoos1Lc', cap: '고관절 운동, 매일 따라해 보세요' },
            { id: 'Q0HZUvYxyv0', cap: '60대여 운동하자, 아령 들고 팔운동' },
            { id: 'YI4IO_3s9Vg', cap: '60대의 취미생활, 어설픈 장구' },
          ].map((s, i) => (
            <a key={s.id} className="cir-short" href={`https://www.youtube.com/shorts/${s.id}`} target="_blank" rel="noopener noreferrer">
              <div className="cir-short-thumb">
                <img src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`} alt={`숏츠 ${i + 1}`} loading="lazy" />
                <span className="cir-short-n">SHORTS {i + 1}</span>
                <span className="cir-short-play" />
              </div>
              <div className="cir-short-cap">{s.cap}</div>
            </a>
          ))}
        </div>
      </section>

      {/* 채널 — B-2: 영상 뒤로 */}
      <section>
        <div className="eyebrow">Channel</div>
        <h2>채널 바로가기</h2>
        <div className="sub">두 곳으로 연결됩니다.</div>
        <div className="rule" />
        <div className="cir-ch">
          <a href="https://www.youtube.com/@%EC%B5%9C%EC%9D%BC%EB%A1%80tv" target="_blank" rel="noopener noreferrer"><i>▶</i><div><b>최일례TV</b><span>유튜브 · 아침 7시 유산소운동 670회</span></div><em>›</em></a>
          <a href="https://www.eummedia.kr" target="_blank" rel="noopener noreferrer"><i>📰</i><div><b>이음미디어</b><span>인터넷신문 · 최일례 대표</span></div><em>›</em></a>
        </div>
      </section>

      {/* 문의 */}
      <section className="cir-cta">
        <div className="eyebrow">Contact</div>
        <h2>최일례 대표와 연결되고 싶으신가요?</h2>
        <div className="sub">강의 · 책쓰기 · 매거진 문의를 남겨주시면 확인 후 답변드립니다.</div>
        <a className="cir-call" href="tel:01085021960">📞 010-8502-1960 전화 연결</a>
        <CirContactForm />
        <div className="cir-note">📨 전송 시 최일례 대표님께 알림이 발송됩니다</div>
      </section>

      <footer className="cir-footer">
        © PIUM · 최일례 대표 프로필 시안 v3 — 세연님 확인 전용<br />
        걸어온 길 · 일하는 원칙 · 하는 일은 '더 알아보기'에서 펼쳐집니다
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════
   이광우 대표 프로필 — /pium-app/leekwangwoo
══════════════════════════════════════ */
const LWK_IMG = '/pium/profile/leekwangwoo/';

const LWK_SLIDES = [
  { src: LWK_IMG + '04-biz-slide1.jpg', alt: '힐링숲라파 브랜드' },
  { src: LWK_IMG + '05-biz-slide2.jpg', alt: '이징캉 족욕기 7세대' },
  { src: null, label: '이징캉 사진 3\n(추후 교체)' },
  { src: null, label: '이징캉 사진 4\n(추후 교체)' },
];

const LWK_SHORTS = [
  { id: '4YJgtjxb060', title: '종합병원이었던 아내를 살린 5개월의 기적!!!' },
  { id: 'vilFDauqvwM', title: '내 몸이 말을 해요!' },
  { id: 'MVFqLs1pXwI', title: '내 몸이 쓰레기통이 되는 이유, 아세요?' },
  { id: 'GH6akNNv9RQ', title: '내 몸속 치명적인 원인 2가지!? - 2' },
  { id: 'MDDaaGl_S3A', title: '활성산소 악행을 고발합니다!? - 1' },
];

const LWK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,600;1,600&display=swap');
  .lwk { --lwk-navy:#0f1b2d; --lwk-charcoal:#1c2430; --lwk-deep:#0a1420;
         --lwk-bronze:#a97142; --lwk-amber:#d4a24c; --lwk-amber-l:#f0cf8a;
         --lwk-ivory:#f6f3ec; --lwk-gray:#8b93a1;
         font-family:'Pretendard',-apple-system,BlinkMacSystemFont,sans-serif;
         background:var(--lwk-deep); color:var(--lwk-ivory); line-height:1.6;
         min-height:100vh; }

  /* Back button */
  .lwk-back { display:inline-flex; align-items:center; gap:6px;
    color:var(--lwk-amber); font-size:14px; font-weight:700;
    text-decoration:none; padding:16px 20px; }
  .lwk-back:hover { opacity:.8; }

  /* Hero */
  .lwk-hero { background:linear-gradient(160deg,var(--lwk-navy) 0%,var(--lwk-charcoal) 55%,var(--lwk-deep) 100%);
    padding:80px 24px 80px; text-align:center; position:relative; overflow:hidden; }
  .lwk-hero::after { content:""; position:absolute; bottom:0; left:0; right:0;
    height:3px; background:linear-gradient(90deg,transparent,var(--lwk-amber),transparent); }
  .lwk-hero-logo { width:200px; max-width:58%; height:auto; display:block;
    margin:0 auto 20px; opacity:.96; filter:drop-shadow(0 4px 14px rgba(0,0,0,.4)); }
  .lwk-brand-tag { font-family:'Poppins',sans-serif; font-size:12px; font-weight:300;
    letter-spacing:5px; text-transform:uppercase; color:var(--lwk-amber-l); margin-bottom:16px; }
  .lwk-brand-tag .name { display:block; font-size:36px; font-weight:700; font-style:italic;
    transform:skewX(-10deg); letter-spacing:.5px; text-transform:none; color:#fff; margin-top:12px; }
  .lwk-hero-photo { width:168px; height:168px; border-radius:50%; margin:0 auto 28px;
    background:linear-gradient(135deg,#2a3446,#111925); border:3px solid var(--lwk-amber);
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 0 0 8px rgba(212,162,76,.08); overflow:hidden; }
  .lwk-hero-photo img { width:100%; height:100%; object-fit:cover; object-position:center 20%; }
  .lwk-eyebrow { color:var(--lwk-amber); letter-spacing:3px; font-size:12px; font-weight:700;
    text-transform:uppercase; margin-bottom:14px; }
  .lwk-hero h1 { font-size:38px; font-weight:800; color:#fff; margin-bottom:10px; }
  .lwk-hero .role { color:var(--lwk-gray); font-size:15px; font-weight:400; margin-bottom:26px; }
  .lwk-hero .catch { font-size:20px; font-weight:800; color:var(--lwk-amber-l);
    max-width:520px; margin:0 auto; line-height:1.5; }

  /* Section common */
  .lwk-sec { padding:80px 24px; }
  .lwk-wrap { max-width:920px; margin:0 auto; }
  .lwk-sec-title { font-size:12px; font-weight:700; letter-spacing:3px; text-transform:uppercase;
    color:var(--lwk-amber); text-align:center; margin-bottom:8px; }
  .lwk-sec-heading { font-size:26px; font-weight:800; color:#fff;
    text-align:center; margin-bottom:56px; }

  /* Timeline */
  .lwk-timeline { position:relative; padding-left:32px; }
  .lwk-timeline::before { content:""; position:absolute; left:7px; top:6px; bottom:6px;
    width:2px; background:linear-gradient(180deg,var(--lwk-amber),var(--lwk-bronze) 70%,transparent); }
  .lwk-t-item { position:relative; padding-bottom:44px; }
  .lwk-t-item:last-child { padding-bottom:0; }
  .lwk-t-item::before { content:""; position:absolute; left:-32px; top:4px;
    width:16px; height:16px; border-radius:50%; background:var(--lwk-deep);
    border:3px solid var(--lwk-amber); }
  .lwk-t-year { color:var(--lwk-amber); font-weight:700; font-size:14px; margin-bottom:6px; }
  .lwk-t-title { font-size:19px; font-weight:800; color:#fff; margin-bottom:6px; }
  .lwk-t-desc { color:var(--lwk-gray); font-size:14px; }

  /* Business */
  .lwk-biz { background:var(--lwk-charcoal); border-radius:20px; padding:56px 40px; }
  @media(max-width:560px){ .lwk-biz{padding:36px 20px;} }
  .lwk-biz-brandhead { display:flex; align-items:center; gap:15px; margin-bottom:12px; }
  .lwk-biz-emblem { width:62px; height:62px; flex:none; border-radius:50%;
    box-shadow:0 0 0 2px rgba(212,162,76,.45),0 6px 18px rgba(0,0,0,.35); }
  @media(max-width:520px){ .lwk-biz-emblem{width:52px;height:52px;} .lwk-biz-brandhead{gap:12px;} }
  .lwk-biz-h3 { font-size:24px; font-weight:800; color:#fff; }
  .lwk-biz-italic { font-style:italic; color:var(--lwk-amber-l); font-size:15px; margin-bottom:20px; }
  .lwk-biz p { color:#c7cdd8; font-size:15px; margin-bottom:14px; }
  .lwk-biz p:last-of-type { margin-bottom:0; }

  /* Carousel — overflow:hidden은 반드시 바깥 wrapper에만 */
  .lwk-carousel { position:relative; margin-bottom:14px;
    overflow:hidden; border-radius:14px; border:1px solid rgba(212,162,76,.25); }
  .lwk-carousel-track { display:flex; aspect-ratio:2.6/1; transition:transform .35s ease; }
  .lwk-slide { min-width:100%; height:100%; flex-shrink:0;
    background:linear-gradient(135deg,#243044,#141b26);
    display:flex; align-items:center; justify-content:center;
    color:var(--lwk-gray); font-size:13px; text-align:center; }
  .lwk-slide img { width:100%; height:100%; object-fit:cover; }
  .lwk-car-btn { position:absolute; top:50%; transform:translateY(-50%);
    width:36px; height:36px; border-radius:50%; background:rgba(0,0,0,.55);
    color:#fff; border:none; display:flex; align-items:center; justify-content:center;
    cursor:pointer; font-size:18px; z-index:2; }
  .lwk-car-btn.prev { left:10px; }
  .lwk-car-btn.next { right:10px; }
  .lwk-dots { display:flex; justify-content:center; gap:8px; margin-bottom:32px; }
  .lwk-dot { width:7px; height:7px; border-radius:50%;
    background:rgba(255,255,255,.25); cursor:pointer; border:none;
    padding:0; transition:background .2s,width .2s; }
  .lwk-dot.active { background:var(--lwk-amber); width:18px; border-radius:4px; }

  /* Brand strip link */
  .lwk-brand-strip { display:flex; align-items:center; gap:18px; margin:28px 0 6px;
    padding:16px 18px; text-decoration:none; color:inherit;
    background:linear-gradient(135deg,rgba(169,113,66,.18),rgba(212,162,76,.05));
    border:1px solid rgba(212,162,76,.28); border-radius:16px;
    transition:border-color .2s,transform .2s,box-shadow .2s; }
  .lwk-brand-strip:hover { border-color:rgba(212,162,76,.6);
    transform:translateY(-2px); box-shadow:0 10px 26px rgba(0,0,0,.38); }
  .lwk-brand-strip > img { width:80px; height:80px; flex:none;
    border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,.38); }
  @media(max-width:520px){ .lwk-brand-strip{gap:14px;padding:14px;}
    .lwk-brand-strip > img{width:64px;height:64px;} }
  .lwk-bs-en { font-family:'Poppins',sans-serif; font-size:11px; letter-spacing:3px;
    text-transform:uppercase; color:var(--lwk-amber); }
  .lwk-bs-ko { font-size:18px; font-weight:800; color:#fff; margin:3px 0 6px; }
  @media(max-width:520px){ .lwk-bs-ko{font-size:16px;} }
  .lwk-bs-desc { font-size:13px; color:var(--lwk-gray); line-height:1.6; word-break:keep-all; }
  .lwk-bs-link { margin-top:8px; font-size:12.5px; font-weight:700; color:var(--lwk-amber);
    display:inline-flex; align-items:center; gap:6px; }
  .lwk-bs-link span { transition:transform .2s; display:inline-block; }
  .lwk-brand-strip:hover .lwk-bs-link span { transform:translateX(4px); }

  .lwk-tags { display:flex; gap:10px; flex-wrap:wrap; margin-top:24px; }
  .lwk-tag { background:rgba(212,162,76,.12); color:var(--lwk-amber-l);
    border:1px solid rgba(212,162,76,.3); padding:7px 16px;
    border-radius:100px; font-size:13px; font-weight:700; }
  .lwk-disclaimer { margin-top:22px; font-size:12px; color:var(--lwk-gray);
    border-top:1px solid rgba(255,255,255,.08); padding-top:16px; }

  /* Philosophy */
  .lwk-phil-card { position:relative; max-width:600px; margin:48px auto 0;
    border-radius:24px; overflow:hidden; background:#05080d; }
  .lwk-phil-card img { width:100%; display:block; opacity:.95; }
  .lwk-phil-card::after { content:""; position:absolute; left:0; right:0; bottom:0;
    height:78%; background:linear-gradient(0deg,rgba(2,4,7,.98) 0%,rgba(2,4,7,.94) 26%,rgba(2,4,7,.55) 55%,transparent 100%);
    pointer-events:none; z-index:1; }
  .lwk-phil-overlay { position:absolute; left:0; right:10%; bottom:0;
    padding:10px 20px 38px 32px; text-align:left; z-index:2; }
  .lwk-quote-mark { font-size:44px; color:var(--lwk-amber); opacity:.85;
    font-weight:800; line-height:1; margin-bottom:2px; font-family:Georgia,serif; }
  .lwk-quote { font-size:20px; font-weight:800; color:#fff; line-height:1.5;
    text-shadow:0 2px 14px rgba(0,0,0,.6); }
  @media(max-width:560px){ .lwk-quote{font-size:17px;} .lwk-phil-overlay{right:8%;padding:10px 16px 24px 22px;} }
  .lwk-phil-sup { max-width:600px; margin:28px auto 0; }
  .lwk-quote-sub { color:#c7cdd8; font-size:14.5px; background:var(--lwk-charcoal);
    border-radius:16px; padding:26px 28px; text-align:left; }
  .lwk-quote-sub p { margin-bottom:12px; }
  .lwk-quote-sub p:last-child { margin-bottom:0; }

  /* Channels */
  .lwk-channels { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
  .lwk-ch-card { background:var(--lwk-charcoal); border:1px solid rgba(212,162,76,.2);
    border-radius:16px; padding:28px 30px; width:230px; text-align:center;
    text-decoration:none; transition:border-color .2s; display:block; }
  .lwk-ch-card:hover { border-color:var(--lwk-amber); }
  .lwk-ch-icon { width:52px; height:52px; border-radius:14px;
    background:rgba(212,162,76,.12); display:flex; align-items:center; justify-content:center;
    margin:0 auto 16px; font-size:22px; }
  .lwk-ch-title { color:#fff; font-weight:800; font-size:16px; margin-bottom:6px; }
  .lwk-ch-desc { color:var(--lwk-gray); font-size:12.5px; }

  /* Videos */
  .lwk-yt-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  @media(max-width:560px){ .lwk-yt-grid{grid-template-columns:1fr;} }
  .lwk-yt-card { background:var(--lwk-charcoal); border-radius:16px; overflow:hidden;
    border:1px solid rgba(255,255,255,.06); text-decoration:none; display:block; }
  .lwk-yt-thumb { width:100%; aspect-ratio:16/9; background:linear-gradient(135deg,#243044,#141b26);
    position:relative; display:flex; align-items:center; justify-content:center; }
  .lwk-yt-thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; }
  .lwk-yt-shade { position:absolute; inset:0; background:linear-gradient(0deg,rgba(0,0,0,.35),rgba(0,0,0,.05)); z-index:1; }
  .lwk-yt-play { width:52px; height:52px; border-radius:50%; background:rgba(255,77,77,.9);
    display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; z-index:2; position:absolute; }
  .lwk-yt-card .v-title { padding:14px 16px 16px; font-size:14px; font-weight:700; color:#fff; line-height:1.5; word-break:keep-all; }

  /* Shorts */
  .lwk-shorts-row { display:flex; gap:14px; overflow-x:auto; scroll-snap-type:x mandatory;
    padding:4px 4px 12px; scrollbar-width:thin; }
  .lwk-shorts-row::-webkit-scrollbar { height:6px; }
  .lwk-shorts-row::-webkit-scrollbar-thumb { background:rgba(212,162,76,.35); border-radius:10px; }
  .lwk-short-card { scroll-snap-align:start; flex:0 0 148px; text-decoration:none; display:block; }
  .lwk-short-thumb { width:148px; aspect-ratio:9/16; border-radius:14px;
    background:linear-gradient(135deg,#243044,#141b26); border:1px solid rgba(212,162,76,.25);
    display:flex; align-items:center; justify-content:center;
    color:var(--lwk-gray); font-size:12px; position:relative; text-align:center; overflow:hidden; }
  .lwk-short-thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; border-radius:14px; display:block; }
  .lwk-shorts-play { width:38px; height:38px; border-radius:50%; background:rgba(255,77,77,.9);
    display:flex; align-items:center; justify-content:center; color:#fff; font-size:15px; position:absolute; z-index:2; }
  .lwk-short-title { margin-top:8px; font-size:12px; color:#fff; text-align:center;
    line-height:1.45; word-break:keep-all; padding:0 2px; }
  .lwk-shorts-nav { display:flex; justify-content:center; gap:10px; margin-top:14px; }
  .lwk-shorts-nav button { width:32px; height:32px; border-radius:50%;
    border:1px solid rgba(212,162,76,.35); background:transparent;
    color:var(--lwk-amber-l); cursor:pointer; font-size:15px; }

  /* Contact */
  .lwk-cta-heading { text-align:center; margin-bottom:40px; }
  .lwk-cta-heading h2 { font-size:26px; font-weight:800; color:#fff; margin-bottom:10px; }
  .lwk-cta-heading p { color:var(--lwk-gray); font-size:15px; }
  .lwk-contact-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:28px; }
  .lwk-call-btn { display:inline-flex; align-items:center; gap:10px;
    padding:16px 30px; border-radius:12px; text-decoration:none;
    background:linear-gradient(120deg,var(--lwk-amber),var(--lwk-bronze));
    color:#1a1206; font-weight:800; font-size:16px; }
  .lwk-divider { display:flex; align-items:center; gap:14px;
    max-width:520px; margin:0 auto 28px; color:var(--lwk-gray); font-size:12.5px; }
  .lwk-divider::before, .lwk-divider::after { content:""; flex:1; height:1px; background:rgba(255,255,255,.1); }
  .lwk-form-wrap { background:var(--lwk-charcoal); border-radius:20px;
    padding:48px 40px; max-width:520px; margin:0 auto; }
  @media(max-width:560px){ .lwk-form-wrap{padding:32px 20px;} }
  .lwk-form-row { margin-bottom:16px; text-align:left; }
  .lwk-form-row label { display:block; font-size:13px; color:var(--lwk-gray); margin-bottom:6px; font-weight:700; }
  .lwk-form-row input, .lwk-form-row textarea {
    width:100%; background:var(--lwk-deep); border:1px solid rgba(255,255,255,.1);
    border-radius:10px; padding:12px 14px; color:#fff; font-family:inherit; font-size:14px; }
  .lwk-form-row textarea { min-height:90px; resize:vertical; }
  .lwk-submit-btn { width:100%; padding:16px; border-radius:12px; border:1.5px solid var(--lwk-amber);
    background:transparent; color:var(--lwk-amber-l); font-weight:800; font-size:15px; cursor:pointer; margin-top:8px; }
  .lwk-tg-note { text-align:center; color:var(--lwk-gray); font-size:12.5px; margin-top:18px; }

  /* Footer */
  .lwk-footer { text-align:center; padding:30px; color:#4a5162; font-size:12px; }
  .lwk-foot-emblem { width:36px; height:36px; display:block; margin:0 auto 12px; opacity:.9; }
`;

function LeekwangwooPage() {
  const [bizIdx, setBizIdx] = useState(0);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');
  const shortsRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      setSubmitErr('이름, 연락처, 문의 내용을 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setSubmitErr('');
    try {
      const res = await fetch('/api/lwk-lecture-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        setForm({ name: '', phone: '', message: '' });
      } else {
        setSubmitErr(data.error || '제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setSubmitErr('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    }
    setSubmitting(false);
  }

  const bizPrev = () => setBizIdx(i => (i - 1 + LWK_SLIDES.length) % LWK_SLIDES.length);
  const bizNext = () => setBizIdx(i => (i + 1) % LWK_SLIDES.length);
  const shortsPrev = () => shortsRef.current?.scrollBy({ left: -170, behavior: 'smooth' });
  const shortsNext = () => shortsRef.current?.scrollBy({ left: 170, behavior: 'smooth' });

  return (
    <div className="lwk">
      <style>{LWK_CSS}</style>

      {/* 뒤로가기 */}
      <Link to="/pium-store" className="lwk-back">← 스토어로 돌아가기</Link>

      {/* 1. 히어로 */}
      <section className="lwk-hero">
        <img className="lwk-hero-logo" src={LWK_IMG + '01-hero-logo.png'} alt="Healingsoop LAFA 힐링숲라파" />
        <div className="lwk-brand-tag"><span className="name">Lee Kwangwoo</span></div>
        <div className="lwk-hero-photo">
          <img src={LWK_IMG + '02-hero-photo.jpg'} alt="이광우 대표" />
        </div>
        <div className="lwk-eyebrow">HEALER · ENTREPRENEUR</div>
        <h1 className="lwk-hero">힐링숲라파 이징캉코리아 이광우 대표</h1>
        <div className="role">현재 ㈜YJK코리아 대표</div>
        <div className="catch">"원칙을 지켜온 시간이,<br/>지금의 신뢰를 만듭니다."</div>
      </section>

      {/* 2. 커리어 타임라인 */}
      <section className="lwk-sec">
        <div className="lwk-wrap">
          <div className="lwk-sec-title">Career</div>
          <div className="lwk-sec-heading">커리어 타임라인</div>
          <div className="lwk-timeline">
            {[
              { year: '1983년 2월', title: '서울대학교 경영대학 졸업', desc: '체계와 원칙을 배운 시작점' },
              { year: '1983년 ~ 2013년 12월', title: '공직 재직', desc: '30년간 몸에 익힌 원칙과 성실함' },
              { year: '2017년 늦가을 ~ 현재', title: '㈜YJK코리아 대표 (서울 구로구에서 시작)', desc: '이징캉 족욕기 한국 공식 판매 · 공직에서 쌓은 신뢰를 바탕으로 새로운 도전을 시작하다' },
              { year: '최근', title: "유튜브 채널 '헬시천국tv' 운영", desc: '건강 정보와 이징캉 이야기를 직접 전하고 있습니다' },
            ].map((item, i) => (
              <div key={i} className="lwk-t-item">
                <div className="lwk-t-year">{item.year}</div>
                <div className="lwk-t-title">{item.title}</div>
                <div className="lwk-t-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Business */}
      <section className="lwk-sec" style={{paddingTop:0}}>
        <div className="lwk-wrap">
          <div className="lwk-biz">
            <div className="lwk-sec-title" style={{textAlign:'left',marginBottom:'6px'}}>Business</div>
            <div className="lwk-biz-brandhead">
              <img className="lwk-biz-emblem" src={LWK_IMG + '03-biz-emblem.png'} alt="힐링숲라파 엠블럼" />
              <div className="lwk-biz-h3">이징캉, 신뢰로 전하는 제품</div>
            </div>
            <p className="lwk-biz-italic">
              "아프면서 살 것인가, 아프지 않고 건강하게 살 것인가 — 그 답을 찾는 여정에 함께하고 있습니다."
            </p>

            {/* 캐러셀 */}
            <div className="lwk-carousel">
              <div className="lwk-carousel-track" style={{transform:`translateX(-${bizIdx * 100}%)`}}>
                {LWK_SLIDES.map((slide, i) => (
                  <div key={i} className="lwk-slide" style={slide.src ? {padding:0} : {}}>
                    {slide.src
                      ? <img src={slide.src} alt={slide.alt} />
                      : <span style={{whiteSpace:'pre-line'}}>{slide.label}</span>
                    }
                  </div>
                ))}
              </div>
              <button className="lwk-car-btn prev" onClick={bizPrev} aria-label="이전 사진">‹</button>
              <button className="lwk-car-btn next" onClick={bizNext} aria-label="다음 사진">›</button>
            </div>
            <div className="lwk-dots">
              {LWK_SLIDES.map((_, i) => (
                <button key={i} className={`lwk-dot${bizIdx === i ? ' active' : ''}`}
                  onClick={() => setBizIdx(i)} aria-label={`슬라이드 ${i + 1}`} />
              ))}
            </div>

            <p>
              2017년 늦가을, 서울 구로구에서 첫걸음을 뗀 이후 지금까지 전국의 많은 고객들을 만나왔습니다.
              오랜 공직 생활 동안 몸에 익힌 원칙과 성실함이, 지금도 한 분 한 분을 대하는 기준이 되고 있습니다.
            </p>
            <p>
              하루의 마무리, 몸과 마음을 편안히 내려놓는 시간을 소중히 여기는 분들에게
              어울리는 제품을 소개합니다. 브랜드명은 '힐링숲라파' — 힐링과 건강을 함께 느낄 수 있는
              가족형 족욕 브랜드입니다.
            </p>

            <a className="lwk-brand-strip" href="https://www.eummedia.kr/article/article-xsfsn0ug" target="_blank" rel="noopener noreferrer">
              <img src={LWK_IMG + '06-brand-tile.png'} alt="Healingsoop LAFA" />
              <div>
                <div className="lwk-bs-en">Healingsoop LAFA</div>
                <div className="lwk-bs-ko">힐링숲라파</div>
                <div className="lwk-bs-desc">힐링과 건강을 함께 느낄 수 있는 가족형 족욕 브랜드입니다.</div>
                <div className="lwk-bs-link">이음미디어 인물기사 보기 <span>→</span></div>
              </div>
            </a>

            <div className="lwk-tags">
              {['힐링숲라파', '신뢰 경영', '라이프스타일', '꾸준함'].map(t => (
                <span key={t} className="lwk-tag">{t}</span>
              ))}
            </div>
            <div className="lwk-disclaimer">
              ※ 이징캉 족욕기는 의료기기가 아닌 공산품이며, 특정 질병의 치료·예방·완화 효과를 표방하지 않습니다.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Philosophy */}
      <section className="lwk-sec">
        <div className="lwk-wrap">
          <div className="lwk-sec-title">Philosophy</div>
          <div className="lwk-sec-heading">이광우 대표의 건강철학</div>
          <div className="lwk-phil-card">
            <img src={LWK_IMG + '07-philosophy.jpg'} alt="이광우 대표 - 건강철학" />
            <div className="lwk-phil-overlay">
              <div className="lwk-quote-mark">"</div>
              <div className="lwk-quote">내 몸속이 어떻게 돌아가는지를 알면,<br/>조심조심 살게 됩니다.</div>
            </div>
          </div>
          <div className="lwk-phil-sup">
            <div className="lwk-quote-sub">
              <p>내가 지금 무엇을 먹느냐에 따라 5년 후, 10년 후의 건강이 결정되기 때문에, 먹는 것을 아무렇게나 막 먹으면 안 됩니다.</p>
              <p>우리 몸을 구성하는 60조 개의 세포가 다 건강하면 몸은 저절로 건강해집니다. 그래서 세포 하나하나의 환경, 그리고 그 세포를 둘러싼 모세혈관의 건강에 집중해야 합니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Channels */}
      <section className="lwk-sec">
        <div className="lwk-wrap">
          <div className="lwk-sec-title">Channels</div>
          <div className="lwk-sec-heading">바로가기</div>
          <div className="lwk-channels">
            <a className="lwk-ch-card" href="http://yijingkangkorea.com" target="_blank" rel="noopener noreferrer">
              <div className="lwk-ch-icon">🏠</div>
              <div className="lwk-ch-title">홈페이지</div>
              <div className="lwk-ch-desc">yijingkangkorea.com</div>
            </a>
            <a className="lwk-ch-card" href="https://www.youtube.com/@%EC%9D%B4%EC%A7%95%EC%BA%89%EC%A1%B1%EC%9A%95%EA%B8%B0" target="_blank" rel="noopener noreferrer">
              <div className="lwk-ch-icon">▶️</div>
              <div className="lwk-ch-title">유튜브</div>
              <div className="lwk-ch-desc">헬시천국tv</div>
            </a>
            <a className="lwk-ch-card" href="https://blog.naver.com/heelingforestlafa" target="_blank" rel="noopener noreferrer">
              <div className="lwk-ch-icon">📝</div>
              <div className="lwk-ch-title">공식 블로그</div>
              <div className="lwk-ch-desc">이징캉(YJK)코리아 · 힐링숲라파</div>
            </a>
          </div>
        </div>
      </section>

      {/* 6. 대표 영상 + 숏츠 */}
      <section className="lwk-sec">
        <div className="lwk-wrap">
          <div className="lwk-sec-title">Featured Videos</div>
          <div className="lwk-sec-heading">대표 영상</div>
          <div className="lwk-yt-grid">
            <a className="lwk-yt-card" href="https://www.youtube.com/watch?v=HhVduBroiYg" target="_blank" rel="noopener noreferrer">
              <div className="lwk-yt-thumb">
                <img src="https://i.ytimg.com/vi/HhVduBroiYg/hqdefault.jpg" alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
                <div className="lwk-yt-shade" />
                <div className="lwk-yt-play">▶</div>
              </div>
              <div className="v-title">내 눈으로 직접 목격한 혈액순환의 비밀!?</div>
            </a>
            <a className="lwk-yt-card" href="https://youtu.be/HWW-_fKW2EE" target="_blank" rel="noopener noreferrer">
              <div className="lwk-yt-thumb">
                <img src="https://i.ytimg.com/vi/HWW-_fKW2EE/hqdefault.jpg" alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
                <div className="lwk-yt-shade" />
                <div className="lwk-yt-play">▶</div>
              </div>
              <div className="v-title">30년 공무원이 퇴직금 털어, 족욕기 사업에 뛰어든 이유?!</div>
            </a>
          </div>

          <div style={{height:'56px'}} />

          <div className="lwk-sec-title">Shorts</div>
          <div className="lwk-sec-heading" style={{marginBottom:'24px'}}>유튜브 숏츠</div>
          <div>
            <div className="lwk-shorts-row" ref={shortsRef}>
              {LWK_SHORTS.map(s => (
                <a key={s.id} className="lwk-short-card" href={`https://youtube.com/shorts/${s.id}`} target="_blank" rel="noopener noreferrer">
                  <div className="lwk-short-thumb">
                    <img src={`https://i.ytimg.com/vi/${s.id}/oardefault.jpg`} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
                    <div className="lwk-yt-shade" />
                    <div className="lwk-shorts-play">▶</div>
                  </div>
                  <div className="lwk-short-title">{s.title}</div>
                </a>
              ))}
            </div>
            <div className="lwk-shorts-nav">
              <button onClick={shortsPrev} aria-label="이전 숏츠">‹</button>
              <button onClick={shortsNext} aria-label="다음 숏츠">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 문의 */}
      <section className="lwk-sec">
        <div className="lwk-wrap">
          <div className="lwk-cta-heading">
            <h2>이광우 대표와 연결되고 싶으신가요?</h2>
            <p>바로 전화로 문의하시거나, 폼으로 남겨주시면 확인 후 답변드립니다.</p>
          </div>
          <div className="lwk-contact-actions">
            <a className="lwk-call-btn" href="tel:01053160087">📞 010-5316-0087 전화 연결</a>
          </div>
          <div className="lwk-divider">또는 폼으로 문의하기</div>
          <form className="lwk-form-wrap" onSubmit={handleSubmit}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--lwk-amber-l)', fontSize:16 }}>
                ✅ 문의가 전송됐습니다.<br/>
                <span style={{ fontSize:13, color:'var(--lwk-gray)', marginTop:8, display:'block' }}>
                  이광우 대표님이 확인 후 연락드립니다.
                </span>
              </div>
            ) : (
              <>
                <div className="lwk-form-row">
                  <label>이름</label>
                  <input type="text" placeholder="성함을 입력해주세요"
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className="lwk-form-row">
                  <label>연락처</label>
                  <input type="text" placeholder="연락 가능한 번호를 입력해주세요"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className="lwk-form-row">
                  <label>문의 내용</label>
                  <textarea placeholder="궁금한 점을 남겨주세요"
                    value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} />
                </div>
                {submitErr && (
                  <p style={{ fontSize:13, color:'#f87171', margin:'0 0 10px' }}>{submitErr}</p>
                )}
                <button className="lwk-submit-btn" type="submit" disabled={submitting}>
                  {submitting ? '전송 중...' : '문의 보내기'}
                </button>
                <div className="lwk-tg-note">
                  📨 전송 시 이광우 대표님 텔레그램으로 알림이 발송됩니다
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      {/* 8. 푸터 */}
      <footer className="lwk-footer">
        <img className="lwk-foot-emblem" src={LWK_IMG + '08-footer-mark.png'} alt="" />
        © 이음미디어 · PIUM
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════
   이문태 소장 프로필 — /pium-app/leemoontae
══════════════════════════════════════ */
const LMT_PAL=[['#3a2f18','#7a5f22'],['#22304a','#3f5a7f'],['#3a2626','#6b4030'],['#233a3a','#3f6b66'],
 ['#33283f','#5a4070'],['#2a3326','#4a5f3a'],['#3f3320','#7a6030'],['#2b2438','#4f4066'],
 ['#1f3040','#3a5f7a'],['#3a2b1f','#6b4f2a'],['#26333f','#456070'],['#332a26','#5f4a3a'],
 ['#2a3140','#4a5a75'],['#3f2f2a','#70503f']];
const LMT_TOTAL=14,LMT_PER_SHELF=3,LMT_SHELVES=2,LMT_PER_SLIDE=6,LMT_SLIDES=3;
const LMT_BOOKIMG=[
 '/pium-app/leemoontae/book01.jpg','/pium-app/leemoontae/book02.jpg',
 '/pium-app/leemoontae/book03.jpg','/pium-app/leemoontae/book04.jpg',
 '/pium-app/leemoontae/book05.jpg','/pium-app/leemoontae/book06.jpg',
 '/pium-app/leemoontae/book07.jpg','/pium-app/leemoontae/book08.jpg',
 '/pium-app/leemoontae/book09.jpg','/pium-app/leemoontae/book10.jpg',
 '/pium-app/leemoontae/book11.jpg','/pium-app/leemoontae/book12.jpg',
 '/pium-app/leemoontae/book13.jpg','/pium-app/leemoontae/book14.jpg'];
const LMT_BOOKT=[
 '1시간 만에 뚝딱!<br/>클로드로 완성하는 나만의 AI 도구 제작 실전',
 '코딩 몰라도 괜찮아,<br/>바이브코딩',
 '내 손안의 AI 비서<br/>제미나이 3.0 완전 정복',
 '콘텐츠 크리에이터를 위한<br/>AI 마스터 클래스',
 'AI는 시니어를<br/>은퇴시키지 못한다',
 '카톡 쓰듯이 편하게!<br/>50+ 시니어를 위한 AI 활용법',
 '시니어 세대를 위한<br/>생성형 AI 활용 꿀팁',
 'AI를 부리는 마케터<br/>VS AI에 밀리는 마케터',
 'AI의 선택을 받은,<br/>AI 소비자가 찾는 마케팅',
 '퇴근 후 1시간, AI 전문가의<br/>‘수익화 뇌’를 훔쳐라',
 '얼굴 없는 유튜버가<br/>"찐"이다',
 '인생을 바꾸는<br/>감사 스위치',
 '꿈은 늙지 않는다,<br/>다만 현실이 될 뿐',
 '100세 시대 최고의 투자,<br/>‘자연치유 건강재테크’'];
const LMT_ACTS=[
 {s:'/pium-app/leemoontae/act01.jpg',c:'마이크를 들면, 늘 웃습니다'},
 {s:'/pium-app/leemoontae/act02.jpg',c:'수강생 곁에서 한 사람씩'},
 {s:'/pium-app/leemoontae/act03.jpg',c:'대강당을 가득 채운 자리'},
 {s:'/pium-app/leemoontae/act04.jpg',c:'행복 인문학의 향연 · 행복누리 아카데미'},
 {s:'/pium-app/leemoontae/act05.jpg',c:'웃음이 번지는 강의실'},
 {s:'/pium-app/leemoontae/act06.jpg',c:'작은 강의실에서도 같은 마음으로'},
 {s:'/pium-app/leemoontae/act07.jpg',c:'2005. 12. 26 · 강사 이문태'}];
const LMT_APAGE=[3,2,2];
const LMT_VIDS=[
 {id:'KsT-bhTZAko',t:'왜 일을 하는가'},
 {id:'RSK4qnPK7W0',t:'인생 후반전 아직 끝나지 않았어'}];
const LMT_SHORTS=['ea5k_EcpVOs','n1O7teOXjWc','jGs_rfA8atE','m-oV44ixdXg','pSOvMetRbzw'];

const LMT_CSS=`
.lmt-wrap *{margin:0;padding:0;box-sizing:border-box}
.lmt-wrap{
 --bg:#0a0e1a;--card:#141a2b;--line:#232c44;
 --am:#f0a830;--am2:#e6b45c;--amd:#6a5424;
 --tx:#fdf8ee;--sub:#98a0b4;--dim:#6e768c;
 --shgap:18px;--bkgap:32px;--actgap:22px;
 background:var(--bg);color:var(--tx);font-family:'Noto Sans CJK KR','Noto Sans KR',sans-serif;
 -webkit-font-smoothing:antialiased;
}
.lmt-wrap .aibg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.lmt-wrap .aibg .mesh{position:absolute;inset:0;
 background-image:linear-gradient(rgba(240,168,48,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(240,168,48,.075) 1px,transparent 1px);
 background-size:64px 64px;
 mask-image:radial-gradient(1100px 900px at 50% 20%,#000 0%,rgba(0,0,0,.35) 55%,transparent 85%)}
.lmt-wrap .aibg .fine{position:absolute;inset:0;
 background-image:linear-gradient(rgba(124,159,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,159,255,.06) 1px,transparent 1px);
 background-size:16px 16px;
 mask-image:radial-gradient(700px 520px at 82% 68%,#000,transparent 72%)}
.lmt-wrap .aibg svg{position:absolute;inset:0;width:100%;height:100%}
.lmt-wrap .aibg .ln{stroke:rgba(240,168,48,.30);stroke-width:1;fill:none;stroke-dasharray:5 9;animation:lmt-flow 9s linear infinite}
.lmt-wrap .aibg .ln.b{stroke:rgba(124,159,255,.26);animation-duration:13s}
@keyframes lmt-flow{to{stroke-dashoffset:-140}}
.lmt-wrap .aibg .nd{fill:rgba(240,168,48,.75);animation:lmt-pulse 4.2s ease-in-out infinite}
.lmt-wrap .aibg .nd.b{fill:rgba(124,159,255,.65)}
@keyframes lmt-pulse{0%,100%{opacity:.25;r:2.4}50%{opacity:.95;r:4}}
.lmt-wrap .aibg .halo{position:absolute;border-radius:50%;filter:blur(70px)}
.lmt-wrap .aibg .h1{width:640px;height:640px;left:-180px;top:8%;background:radial-gradient(circle,rgba(240,168,48,.16),transparent 64%);animation:lmt-drift 24s ease-in-out infinite}
.lmt-wrap .aibg .h2{width:560px;height:560px;right:-160px;top:46%;background:radial-gradient(circle,rgba(124,159,255,.15),transparent 64%);animation:lmt-drift 31s ease-in-out infinite reverse}
@keyframes lmt-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(46px,-58px)}}
.lmt-wrap .aibg .scan{position:absolute;left:0;right:0;height:200px;background:linear-gradient(180deg,transparent,rgba(240,168,48,.05),transparent);animation:lmt-scan 15s linear infinite}
@keyframes lmt-scan{0%{top:-20%}100%{top:110%}}
@media(prefers-reduced-motion:reduce){.lmt-wrap .aibg *{animation:none!important}}
.lmt-wrap section{position:relative;z-index:1}
.lmt-wrap .wrap{max-width:1180px;margin:0 auto;padding:0 44px}
.lmt-wrap .need{display:inline-block;background:#c0392b;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px;margin-left:6px;vertical-align:middle}
.lmt-wrap .slot{background:repeating-linear-gradient(135deg,#1a2133 0 10px,#161d2e 10px 20px);border:1.5px dashed #3a4666;display:flex;align-items:center;justify-content:center;color:#66718c;font-size:13px;font-weight:700;text-align:center;line-height:1.55}
.lmt-wrap .sec{padding:100px 0}
.lmt-wrap .sec-h{font-size:12px;font-weight:800;letter-spacing:.24em;color:var(--am);margin-bottom:14px}
.lmt-wrap .sec-t{font-size:38px;font-weight:900;letter-spacing:-.02em;line-height:1.25}
.lmt-wrap .sec-d{font-size:16px;color:var(--sub);margin-top:14px;line-height:1.75}
.lmt-wrap .hero{position:relative;min-height:740px;display:flex;align-items:center;overflow:hidden;background:radial-gradient(1200px 720px at 76% -12%,#1d2438 0%,#0a0e1a 62%)}
.lmt-wrap .hero .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(240,168,48,.085) 1px,transparent 1px),linear-gradient(90deg,rgba(240,168,48,.085) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(900px 620px at 72% 30%,#000,transparent 78%)}
.lmt-wrap .hero .orb{position:absolute;right:-160px;top:-120px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(240,168,48,.16),transparent 62%);filter:blur(30px)}
.lmt-wrap .hero-in{position:relative;z-index:2;display:flex;gap:60px;align-items:center;width:100%}
.lmt-wrap .hero-L{flex:1;min-width:0}
.lmt-wrap .kick{font-size:13px;font-weight:800;letter-spacing:.22em;color:var(--am)}
.lmt-wrap .nm{font-size:96px;font-weight:900;letter-spacing:-.03em;line-height:1;margin-top:18px}
.lmt-wrap .en{font-size:18px;font-weight:500;letter-spacing:.3em;color:var(--sub);margin-top:16px}
.lmt-wrap .rule{width:64px;height:3px;background:var(--am);border-radius:2px;margin:26px 0}
.lmt-wrap .tag{font-size:23px;font-weight:700;line-height:1.55;color:#e8e2d4}
.lmt-wrap .tag em{font-style:normal;color:var(--am)}
.lmt-wrap .tag small{display:block;font-size:17px;font-weight:500;color:var(--sub);margin-top:8px}
.lmt-wrap .pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:26px}
.lmt-wrap .pill{border:1.2px solid var(--amd);color:var(--am2);border-radius:999px;padding:8px 17px;font-size:14px;font-weight:600}
.lmt-wrap .hero-R{width:390px;flex-shrink:0}
.lmt-wrap .photo{width:390px;height:490px;border-radius:16px;position:relative;overflow:hidden}
.lmt-wrap .photo img{width:100%;height:100%;object-fit:cover;display:block;border-radius:16px}
.lmt-wrap .photo::before{content:'';position:absolute;inset:0;z-index:1;border-radius:16px;pointer-events:none;background:linear-gradient(180deg,rgba(10,14,26,.10) 0%,transparent 34%,rgba(10,14,26,.40) 86%,rgba(10,14,26,.62) 100%)}
.lmt-wrap .photo::after{content:'';position:absolute;inset:0;border-radius:16px;z-index:3;box-shadow:inset 0 0 0 1px rgba(240,168,48,.30),0 0 70px rgba(240,168,48,.13);pointer-events:none}
.lmt-wrap .sigwrap{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);width:82%;z-index:2;opacity:.92;pointer-events:none}
.lmt-wrap .sig{width:100%;height:auto;display:block}
.lmt-wrap .car{overflow:hidden;position:relative}
.lmt-wrap .track{display:flex;transition:transform .5s cubic-bezier(.4,0,.2,1)}
.lmt-wrap .slide{flex:0 0 100%;min-width:0;max-width:100%}
.lmt-wrap .nav{display:flex;align-items:center;justify-content:center;gap:20px;margin-top:34px}
.lmt-wrap .arw{width:44px;height:44px;border-radius:50%;border:1.4px solid var(--amd);background:transparent;color:var(--am2);font-size:17px;cursor:pointer;font-family:inherit;flex-shrink:0}
.lmt-wrap .dots{display:flex;gap:9px}
.lmt-wrap .dot{width:9px;height:9px;border-radius:50%;background:#2f3a55;cursor:pointer;border:0;padding:0}
.lmt-wrap .dot.on{background:var(--am);width:26px;border-radius:5px}
.lmt-wrap .lib{background:linear-gradient(180deg,transparent,rgba(13,18,32,.5) 42%,transparent)}
.lmt-wrap .lib-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:46px}
.lmt-wrap .stage{max-width:840px;margin:0 auto}
.lmt-wrap .floor{position:relative;margin-bottom:46px}
.lmt-wrap .floor:last-child{margin-bottom:0}
.lmt-wrap .floor-tag{position:absolute;left:0;top:-26px;font-size:11px;font-weight:900;letter-spacing:.2em;color:var(--amd)}
.lmt-wrap .books{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--bkgap);align-items:end;min-height:322px}
.lmt-wrap .bk{position:relative;min-width:0}
.lmt-wrap .bk .cv{width:100%;aspect-ratio:3/4.25;border-radius:5px 9px 9px 5px;position:relative;overflow:hidden;box-shadow:0 18px 38px rgba(0,0,0,.6),0 0 30px rgba(240,168,48,.13)}
.lmt-wrap .bk .cv img{position:absolute;inset:0;z-index:1;width:100%;height:100%;object-fit:cover;display:block}
.lmt-wrap .bk .cv::before{content:'';position:absolute;left:0;top:0;bottom:0;width:9px;z-index:2;background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(255,255,255,.10))}
.lmt-wrap .bk .cv::after{content:'';position:absolute;inset:0;z-index:2;background:linear-gradient(115deg,rgba(255,255,255,.13),transparent 44%)}
.lmt-wrap .bk .ttl{font-size:13px;font-weight:700;color:var(--sub);margin-top:13px;line-height:1.5;text-align:center}
.lmt-wrap .shelf{height:6px;border-radius:4px;margin-top:18px;background:linear-gradient(90deg,#2a2213,var(--am) 45%,var(--am) 55%,#2a2213)}
.lmt-wrap .shelf-glow{height:32px;margin-top:-2px;border-radius:0 0 60px 60px;background:linear-gradient(180deg,rgba(240,168,48,.24),transparent 78%)}
.lmt-wrap .endcap{display:flex;align-items:center;justify-content:center;min-height:322px}
.lmt-wrap .ec{text-align:center;border:1.4px dashed rgba(240,168,48,.28);border-radius:16px;padding:44px 56px;background:rgba(240,168,48,.045)}
.lmt-wrap .ecsvg{width:220px;height:90px;fill:var(--am);stroke:rgba(240,168,48,.55);stroke-width:1.4;opacity:.85}
.lmt-wrap .ecsvg path{fill:none;stroke-dasharray:4 7;animation:lmt-flow 8s linear infinite}
.lmt-wrap .ect{font-size:24px;font-weight:900;color:var(--am);margin-top:10px;letter-spacing:-.01em}
.lmt-wrap .ecs{font-size:15px;color:var(--sub);margin-top:12px;line-height:1.75}
.lmt-wrap .phil{background:radial-gradient(760px 520px at 50% 38%,rgba(240,168,48,.10),transparent 70%);text-align:center}
.lmt-wrap .qmark{font-size:110px;font-weight:900;color:var(--amd);line-height:.7;font-family:Georgia,serif}
.lmt-wrap .big{font-size:52px;font-weight:900;letter-spacing:-.02em;margin-top:20px;color:var(--am)}
.lmt-wrap .qbody{max-width:760px;margin:38px auto 0;font-size:19px;line-height:2.05;color:#ddd6c8;text-align:left;font-weight:400}
.lmt-wrap .qbody b{color:var(--tx);font-weight:700}
.lmt-wrap .qby{margin-top:32px;font-size:14px;letter-spacing:.14em;color:var(--dim);font-weight:700}
.lmt-wrap .art{max-width:760px;margin:52px auto 0;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px 30px;display:flex;align-items:center;gap:22px;text-align:left}
.lmt-wrap .art .ic{width:52px;height:52px;border-radius:12px;background:rgba(240,168,48,.13);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--am)}
.lmt-wrap .art .tx{flex:1;min-width:0}
.lmt-wrap .art .k{font-size:11px;font-weight:800;letter-spacing:.18em;color:var(--am)}
.lmt-wrap .art .t{font-size:18px;font-weight:800;margin-top:6px}
.lmt-wrap .art{text-decoration:none;color:inherit;transition:.22s}
.lmt-wrap a.art:hover{border-color:var(--amd)}
.lmt-wrap .art .s{font-size:14px;color:var(--dim);margin-top:5px}
.lmt-wrap .art .go{border:1.3px solid var(--amd);color:var(--am2);border-radius:999px;padding:10px 20px;font-size:14px;font-weight:700;flex-shrink:0}
.lmt-wrap .onsite{margin-top:72px}
.lmt-wrap .onsite-h{display:flex;justify-content:space-between;align-items:flex-end;gap:30px;margin-bottom:30px}
.lmt-wrap .actgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--actgap)}
.lmt-wrap .act{min-width:0}
.lmt-wrap .act .im{width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;position:relative;background:#0b0f1c;box-shadow:0 14px 32px rgba(0,0,0,.5)}
.lmt-wrap .act .im img{width:100%;height:100%;object-fit:cover;display:block}
.lmt-wrap .act .im::after{content:'';position:absolute;inset:0;border-radius:14px;box-shadow:inset 0 0 0 1px rgba(240,168,48,.20)}
.lmt-wrap .act .cp{font-size:14px;color:var(--sub);margin-top:12px;line-height:1.55;text-align:center}
.lmt-wrap .vids{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin-top:44px}
.lmt-wrap .vid{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;display:block;transition:.25s}
.lmt-wrap .vid:hover{border-color:var(--amd);transform:translateY(-3px)}
.lmt-wrap .vid .th{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#0b0f1c}
.lmt-wrap .vid .th img{width:100%;height:100%;object-fit:cover;display:block}
.lmt-wrap .vid .pl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(10,14,26,.06),rgba(10,14,26,.52))}
.lmt-wrap .vid .pl i{width:66px;height:66px;border-radius:50%;background:rgba(240,168,48,.93);display:flex;align-items:center;justify-content:center;color:#1a1204;font-size:23px;font-style:normal;padding-left:5px;box-shadow:0 12px 34px rgba(0,0,0,.5)}
.lmt-wrap .vid .tt{padding:22px 24px;font-size:17px;font-weight:800;line-height:1.55}
.lmt-wrap #shCar{margin-top:44px}
.lmt-wrap .shorts{display:grid;grid-template-columns:repeat(5,1fr);gap:var(--shgap)}
.lmt-wrap .sh{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:block;transition:.25s}
.lmt-wrap .sh:hover{border-color:var(--amd);transform:translateY(-3px)}
.lmt-wrap .sh .th{position:relative;width:100%;aspect-ratio:9/16;overflow:hidden;background:#0b0f1c}
.lmt-wrap .sh .th img{width:100%;height:100%;object-fit:cover;display:block}
.lmt-wrap .sh .pl{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(10,14,26,.02),rgba(10,14,26,.5))}
.lmt-wrap .sh .pl i{width:44px;height:44px;border-radius:50%;background:rgba(240,168,48,.9);display:flex;align-items:center;justify-content:center;color:#1a1204;font-size:15px;font-style:normal;padding-left:3px}
.lmt-wrap .sh .tt{padding:14px 14px 17px;font-size:13px;color:var(--sub);line-height:1.55}
.lmt-wrap .acc{margin-top:44px;border-top:1px solid #1b2338}
.lmt-wrap details{border-bottom:1px solid #1b2338}
.lmt-wrap summary{list-style:none;cursor:pointer;padding:26px 4px;display:flex;align-items:center;gap:18px}
.lmt-wrap summary::-webkit-details-marker{display:none}
.lmt-wrap summary .no{font-size:12px;font-weight:900;letter-spacing:.14em;color:var(--amd);width:34px;flex-shrink:0}
.lmt-wrap summary .h{font-size:21px;font-weight:800;flex:1}
.lmt-wrap summary .sm{font-size:14px;color:var(--dim);font-weight:600}
.lmt-wrap summary .pm{width:32px;height:32px;border-radius:50%;border:1.3px solid var(--amd);color:var(--am2);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:.25s}
.lmt-wrap details[open] summary .pm{transform:rotate(45deg);background:rgba(240,168,48,.14)}
.lmt-wrap .body{padding:4px 4px 32px 52px}
.lmt-wrap .tl{position:relative;padding-left:30px}
.lmt-wrap .tl::before{content:'';position:absolute;left:6px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,transparent,var(--amd) 12%,var(--amd) 88%,transparent)}
.lmt-wrap .ev{position:relative;padding:0 0 32px 26px}
.lmt-wrap .ev:last-child{padding-bottom:4px}
.lmt-wrap .ev::before{content:'';position:absolute;left:-28px;top:5px;width:15px;height:15px;border-radius:50%;background:var(--bg);border:2.5px solid var(--amd)}
.lmt-wrap .ev.on::before{border-color:var(--am);box-shadow:0 0 0 6px rgba(240,168,48,.16)}
.lmt-wrap .ev .yr{font-size:13px;font-weight:800;letter-spacing:.06em;color:var(--am2)}
.lmt-wrap .ev .ti{font-size:19px;font-weight:800;margin-top:5px}
.lmt-wrap .ev .de{font-size:15px;color:var(--sub);margin-top:5px;line-height:1.7}
.lmt-wrap .rows li{list-style:none;font-size:16px;color:#cfd4e0;padding:13px 0;border-bottom:1px dashed #202940;display:flex;gap:20px}
.lmt-wrap .rows li:last-child{border:0}
.lmt-wrap .rows li b{color:var(--am2);font-weight:800;font-size:14px;width:92px;flex-shrink:0;padding-top:2px}
.lmt-wrap .chips{display:flex;flex-wrap:wrap;gap:10px}
.lmt-wrap .chip{border:1.2px solid #2f3a55;color:#cfd4e0;border-radius:999px;padding:9px 18px;font-size:15px;font-weight:600}
.lmt-wrap .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:48px}
.lmt-wrap .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px 28px}
.lmt-wrap .card .ic{width:46px;height:46px;border-radius:12px;background:rgba(240,168,48,.13);display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--am)}
.lmt-wrap .card b{display:block;font-size:19px;margin-top:20px}
.lmt-wrap .card p{font-size:15px;color:var(--sub);margin-top:10px;line-height:1.75}
.lmt-wrap .chs{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:44px}
.lmt-wrap .ch{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:26px 22px;display:flex;align-items:center;gap:14px}
.lmt-wrap .ch .d{width:38px;height:38px;border-radius:10px;background:rgba(240,168,48,.13);display:flex;align-items:center;justify-content:center;font-size:17px;color:var(--am)}
.lmt-wrap .ch{text-decoration:none;color:inherit;transition:.22s}
.lmt-wrap a.ch:hover{border-color:var(--amd);transform:translateY(-2px)}
.lmt-wrap .ch b{font-size:16px;display:block}
.lmt-wrap .ch span{font-size:13px;color:var(--dim)}
.lmt-wrap .ct{background:linear-gradient(180deg,#0d1220,#0a0e1a)}
.lmt-wrap .ctwrap{display:grid;grid-template-columns:1fr 1.05fr;gap:56px;margin-top:44px}
.lmt-wrap .info li{list-style:none;display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #1b2338;font-size:16px}
.lmt-wrap .info li span{color:var(--dim);width:76px;flex-shrink:0;font-size:14px;font-weight:700}
.lmt-wrap .form{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:32px}
.lmt-wrap .form label{display:block;font-size:13px;font-weight:700;color:var(--sub);margin:16px 0 7px}
.lmt-wrap .form label:first-child{margin-top:0}
.lmt-wrap .inp{width:100%;background:#0d1220;border:1px solid #253052;border-radius:10px;padding:13px 15px;color:var(--tx);font-size:15px;font-family:inherit}
.lmt-wrap textarea.inp{height:104px;resize:none}
.lmt-wrap .btn{width:100%;margin-top:24px;background:var(--am);color:#0a0e1a;border:0;border-radius:11px;padding:16px;font-size:17px;font-weight:900;font-family:inherit;cursor:pointer}
.lmt-wrap .note{text-align:center;font-size:13px;color:var(--dim);margin-top:14px}
.lmt-wrap .ft{padding:42px 0 60px;text-align:center;font-size:13px;color:#4d5568;border-top:1px solid #161d2e}
@media(max-width:1024px){
 .lmt-wrap .wrap{padding:0 28px}
 .lmt-wrap .sec{padding:76px 0}
 .lmt-wrap .sec-t{font-size:31px}
 .lmt-wrap .hero{min-height:0;padding:84px 0 66px}
 .lmt-wrap .hero-in{gap:38px}
 .lmt-wrap .nm{font-size:72px}
 .lmt-wrap .hero-R{width:320px}
 .lmt-wrap .photo{width:320px;height:410px}
 .lmt-wrap .sigwrap{width:78%}
 .lmt-wrap .lib-head,.lmt-wrap .onsite-h{flex-direction:column;align-items:flex-start;gap:16px}
 .lmt-wrap .lib-head .sec-d,.lmt-wrap .onsite-h .sec-d{max-width:none!important}
 .lmt-wrap .big{font-size:40px}
 .lmt-wrap .qmark{font-size:88px}
 .lmt-wrap .shorts{grid-template-columns:repeat(3,1fr)}
 .lmt-wrap .chs{grid-template-columns:repeat(2,1fr)}
 .lmt-wrap .ctwrap{grid-template-columns:1fr;gap:32px}
}
@media(max-width:640px){
 .lmt-wrap{--bkgap:14px;--actgap:14px;--shgap:12px}
 .lmt-wrap .wrap{padding:0 20px}
 .lmt-wrap .sec{padding:58px 0}
 .lmt-wrap .sec-h{font-size:11px;margin-bottom:11px}
 .lmt-wrap .sec-t{font-size:25px}
 .lmt-wrap .sec-d{font-size:15px}
 .lmt-wrap .hero{padding:64px 0 54px}
 .lmt-wrap .hero-in{flex-direction:column;align-items:stretch;gap:0}
 .lmt-wrap .hero-L{display:contents}
 .lmt-wrap .kick{order:1}
 .lmt-wrap .nm{order:2;font-size:52px;margin-top:14px}
 .lmt-wrap .en{order:3;font-size:15px;letter-spacing:.22em}
 .lmt-wrap .hero-R{order:4;width:100%;margin-top:24px}
 .lmt-wrap .rule{order:5;margin:20px 0}
 .lmt-wrap .tag{order:6;font-size:19px}
 .lmt-wrap .tag small{font-size:15px}
 .lmt-wrap .pills{order:7}
 .lmt-wrap .pill{font-size:13px;padding:7px 14px}
 .lmt-wrap .sigwrap{width:74%;bottom:16px}
 .lmt-wrap .photo{width:100%;height:400px}
 .lmt-wrap .stage{max-width:none}
 .lmt-wrap .floor{margin-bottom:32px}
 .lmt-wrap .books{min-height:0}
 .lmt-wrap .bk .ttl{font-size:10.5px;margin-top:9px;line-height:1.45}
 .lmt-wrap .floor-tag{font-size:10px;top:-20px}
 .lmt-wrap .shelf{margin-top:12px}
 .lmt-wrap .qmark{font-size:62px}
 .lmt-wrap .big{font-size:28px;margin-top:12px;word-break:keep-all;line-height:1.3}
 .lmt-wrap .qbody{font-size:16px;line-height:1.9;margin-top:26px}
 .lmt-wrap .qby{margin-top:24px;font-size:12.5px}
 .lmt-wrap .actgrid{grid-template-columns:1fr!important}
 .lmt-wrap .act .cp{font-size:13px}
 .lmt-wrap .onsite{margin-top:52px}
 .lmt-wrap .vids{grid-template-columns:1fr;gap:18px;margin-top:32px}
 .lmt-wrap .vid .tt{padding:17px 18px;font-size:15px}
 .lmt-wrap #shCar{margin-top:30px}
 .lmt-wrap .shorts{grid-template-columns:repeat(2,1fr)}
 .lmt-wrap .cards{grid-template-columns:1fr;gap:16px;margin-top:34px}
 .lmt-wrap .chs{grid-template-columns:1fr;gap:12px;margin-top:32px}
 .lmt-wrap .acc{margin-top:32px}
 .lmt-wrap summary{padding:20px 2px;gap:12px;flex-wrap:wrap}
 .lmt-wrap summary .no{width:28px}
 .lmt-wrap summary .h{font-size:18px}
 .lmt-wrap summary .sm{width:100%;padding-left:40px;font-size:13px}
 .lmt-wrap .body{padding:2px 2px 26px 8px}
 .lmt-wrap .ev .ti{font-size:17px}
 .lmt-wrap .ev .de{font-size:14px}
 .lmt-wrap .rows li{flex-direction:column;gap:4px;font-size:15px}
 .lmt-wrap .rows li b{width:auto}
 .lmt-wrap .art{flex-direction:column;align-items:flex-start;gap:14px;padding:22px 20px;margin-top:40px!important}
 .lmt-wrap .art .tx{width:100%}
 .lmt-wrap .art .t{font-size:17px}
 .lmt-wrap .art .go{align-self:stretch;text-align:center}
 .lmt-wrap .form{padding:24px 20px}
 .lmt-wrap .nav{gap:14px;margin-top:26px}
 .lmt-wrap .endcap{min-height:0}
 .lmt-wrap .ec{padding:28px 20px}
 .lmt-wrap .ecsvg{width:150px;height:62px}
 .lmt-wrap .ect{font-size:19px}
 .lmt-wrap .ecs{font-size:14px}
}
`;

function LeeMoontaePage() {
  const [libIdx, setLibIdx] = useState(0);
  const [actIdx, setActIdx] = useState(0);
  const [shIdx,  setShIdx]  = useState(0);
  const [isMob,  setIsMob]  = useState(() => window.matchMedia('(max-width:640px)').matches);
  const [isTab,  setIsTab]  = useState(() => window.matchMedia('(max-width:1024px)').matches);
  const [lmtForm, setLmtForm] = useState({name:'',phone:'',message:''});
  const [lmtSubmitting, setLmtSubmitting] = useState(false);
  const [lmtSubmitted, setLmtSubmitted] = useState(false);
  const [lmtErr, setLmtErr] = useState('');

  useEffect(() => {
    const mq1 = window.matchMedia('(max-width:640px)');
    const mq2 = window.matchMedia('(max-width:1024px)');
    const h1 = e => { setIsMob(e.matches); setActIdx(0); setShIdx(0); };
    const h2 = e => { setIsTab(e.matches); setActIdx(0); setShIdx(0); };
    mq1.addEventListener('change', h1);
    mq2.addEventListener('change', h2);
    return () => { mq1.removeEventListener('change', h1); mq2.removeEventListener('change', h2); };
  }, []);

  async function handleLmtSubmit(e) {
    e.preventDefault();
    if (!lmtForm.name || !lmtForm.phone || !lmtForm.message) {
      setLmtErr('이름, 연락처, 문의 내용을 모두 입력해 주세요.');
      return;
    }
    setLmtSubmitting(true);
    setLmtErr('');
    try {
      const res = await fetch('/api/lmt-lecture-inquiry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(lmtForm),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setLmtSubmitted(true);
        setLmtForm({name:'',phone:'',message:''});
      } else {
        setLmtErr(data.error || '전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch {
      setLmtErr('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLmtSubmitting(false);
    }
  }

  /* 서재 슬라이드 렌더링 헬퍼 */
  function LmtBookSlide({ si }) {
    return (
      <div className="slide">
        {Array.from({length:LMT_SHELVES}, (_,fi) => {
          const f = LMT_SHELVES - fi;
          const base = si * LMT_PER_SLIDE + (LMT_SHELVES - f) * LMT_PER_SHELF;
          const cnt = Math.max(0, Math.min(LMT_PER_SHELF, LMT_TOTAL - base));
          if (cnt === 0) return (
            <div key={f} className="floor endcap">
              <div className="ec">
                <svg viewBox="0 0 220 90" className="ecsvg">
                  <path d="M20 70 L70 30 L120 58 L170 22 L205 46"/>
                  <circle cx="70" cy="30" r="4"/><circle cx="120" cy="58" r="4"/><circle cx="170" cy="22" r="4"/>
                </svg>
                <div className="ect">14권, 그리고 계속</div>
                <div className="ecs">질문이 하나 생길 때마다<br/>책이 한 권씩 늘어납니다</div>
              </div>
            </div>
          );
          const gridStyle = cnt < LMT_PER_SHELF
            ? {gridTemplateColumns:`repeat(${cnt},calc((100% - 2*var(--bkgap))/3))`,justifyContent:'center'}
            : {};
          return (
            <div key={f} className="floor">
              <div className="floor-tag">{f}F</div>
              <div className="books" style={gridStyle}>
                {Array.from({length:cnt}, (_,i) => {
                  const n = base + i + 1;
                  const c = LMT_PAL[n-1];
                  return (
                    <div key={i} className="bk">
                      <div className="cv" style={{background:`linear-gradient(155deg,${c[1]},${c[0]})`}}>
                        <img src={LMT_BOOKIMG[n-1]}
                          alt={LMT_BOOKT[n-1].replace(/<br\/>/g,' ')}
                          onError={ev => { ev.currentTarget.style.display='none'; }} />
                      </div>
                      <div className="ttl" dangerouslySetInnerHTML={{__html: LMT_BOOKT[n-1]}} />
                    </div>
                  );
                })}
              </div>
              <div className="shelf"/><div className="shelf-glow"/>
            </div>
          );
        })}
      </div>
    );
  }

  /* 활동 현장 슬라이드 */
  const actPageSizes = isMob ? LMT_ACTS.map(() => 1) : LMT_APAGE;
  let _actOffset = 0;
  const actSlides = actPageSizes.map((cnt, si) => {
    const slice = LMT_ACTS.slice(_actOffset, _actOffset + cnt);
    _actOffset += cnt;
    const gridStyle = cnt < 3
      ? {gridTemplateColumns:`repeat(${cnt},calc((100% - 2*var(--actgap))/3))`,justifyContent:'center'}
      : {};
    return (
      <div key={si} className="slide">
        <div className="actgrid" style={gridStyle}>
          {slice.map((a,i) => (
            <div key={i} className="act">
              <div className="im">
                <img src={a.s} alt={a.c} onError={ev => { ev.currentTarget.style.display='none'; }} />
              </div>
              <div className="cp">{a.c}</div>
            </div>
          ))}
        </div>
      </div>
    );
  });

  /* 숏츠 캐러셀 */
  const SPER = isMob ? 2 : isTab ? 3 : 5;
  const shSlides = Math.ceil(LMT_SHORTS.length / SPER);

  return (
    <div className="lmt-wrap">
      <style>{LMT_CSS}</style>

      {/* AI 배경 */}
      <div className="aibg">
        <div className="mesh"/><div className="fine"/>
        <div className="halo h1"/><div className="halo h2"/>
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <path className="ln" d="M60 120 L300 210 L520 150 L780 260 L1050 190 L1380 300"/>
          <path className="ln b" d="M40 480 L260 400 L470 520 L720 430 L980 560 L1400 470" style={{animationDelay:'-3s'}}/>
          <path className="ln" d="M120 760 L360 690 L610 800 L900 700 L1180 820 L1420 730" style={{animationDelay:'-6s'}}/>
          <path className="ln b" d="M300 210 L260 400 L360 690"/>
          <path className="ln" d="M780 260 L720 430 L900 700" style={{animationDelay:'-2s'}}/>
          <path className="ln b" d="M1050 190 L980 560 L1180 820" style={{animationDelay:'-5s'}}/>
          <circle className="nd" cx="300" cy="210" r="3"/>
          <circle className="nd b" cx="520" cy="150" r="3" style={{animationDelay:'-1s'}}/>
          <circle className="nd" cx="780" cy="260" r="3" style={{animationDelay:'-2s'}}/>
          <circle className="nd b" cx="1050" cy="190" r="3" style={{animationDelay:'-3s'}}/>
          <circle className="nd b" cx="260" cy="400" r="3" style={{animationDelay:'-1.6s'}}/>
          <circle className="nd" cx="720" cy="430" r="3" style={{animationDelay:'-2.4s'}}/>
          <circle className="nd" cx="980" cy="560" r="3" style={{animationDelay:'-.8s'}}/>
          <circle className="nd b" cx="470" cy="520" r="3" style={{animationDelay:'-3.4s'}}/>
          <circle className="nd" cx="360" cy="690" r="3" style={{animationDelay:'-2.9s'}}/>
          <circle className="nd b" cx="900" cy="700" r="3" style={{animationDelay:'-1.2s'}}/>
          <circle className="nd" cx="1180" cy="820" r="3" style={{animationDelay:'-3.8s'}}/>
          <circle className="nd b" cx="610" cy="800" r="3" style={{animationDelay:'-.5s'}}/>
        </svg>
        <div className="scan"/>
      </div>

      {/* ① HERO */}
      <section className="hero">
        <div className="grid"/><div className="orb"/>
        <div className="wrap hero-in">
          <div className="hero-L">
            <div className="kick">PIUM · 이음미디어</div>
            <div className="nm">이문태</div>
            <div className="en">LEE MOON TAE</div>
            <div className="rule"/>
            <div className="tag">행복나눔 휴머니스트 · <em>AI 라이프 코치</em>
              <small>㈜봉숭아학당문화혁신학교 연구소장 · 웃자대한민국협회 사무총장<br/>
              열린사이버대학교 AI융합학과 특임교수</small>
            </div>
            <div className="pills">
              <span className="pill">AI 활용 교육</span>
              <span className="pill">5060 인생후반전</span>
              <span className="pill">인문학 강연</span>
              <span className="pill">전자책 14권</span>
              <span className="pill">서울</span>
            </div>
          </div>
          <div className="hero-R">
            <div className="photo">
              <img src="/pium-app/leemoontae/hero.jpg" alt="이문태 소장"
                onError={e => { e.currentTarget.style.display='none'; }} />
              <div className="sigwrap">
                <svg className="sig" viewBox="0 0 1000 300" xmlns="http://www.w3.org/2000/svg" aria-label="Lee Moon Tae">
                  <defs>
                    <linearGradient id="lmtSigG" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fdf3e0"/>
                      <stop offset="52%" stopColor="#f0a830"/>
                      <stop offset="100%" stopColor="#d08a12"/>
                    </linearGradient>
                  </defs>
                  <path d="M 96 200 C 118 178, 150 130, 162 96 C 170 72, 162 58, 148 62 C 132 67, 128 96, 132 128 C 137 166, 146 196, 152 210 C 158 222, 178 216, 196 196" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 196 196 C 208 188, 222 185, 230 178 C 236 173, 232 162, 222 162 C 208 162, 196 178, 198 196 C 200 212, 216 218, 232 208" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 232 208 C 244 198, 258 190, 266 182 C 272 176, 268 164, 258 164 C 244 164, 232 180, 234 198 C 236 214, 252 220, 268 210" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 310 214 C 316 178, 326 118, 336 92 C 342 74, 354 70, 358 86 C 362 104, 356 160, 352 214 C 358 172, 368 130, 380 112 C 388 100, 398 104, 398 124 C 398 152, 394 186, 392 214 C 398 176, 408 140, 420 124 C 428 113, 438 117, 438 136 C 438 162, 434 192, 432 212 C 431 222, 442 226, 456 214" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 500 174 C 492 158, 468 156, 458 172 C 448 188, 452 210, 470 214 C 486 218, 500 206, 500 190 C 500 182, 500 177, 500 174" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 500 190 C 508 194, 516 192, 524 184" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 570 176 C 562 160, 538 158, 528 174 C 518 190, 522 212, 540 216 C 556 220, 570 208, 570 192 C 570 184, 570 179, 570 176" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 570 192 C 578 194, 586 192, 592 186" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 592 188 C 596 198, 598 206, 599 212 C 603 188, 613 170, 627 168 C 641 166, 649 178, 649 194 C 649 204, 648 209, 648 212 C 650 220, 660 220, 670 208" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 704 92 C 726 74, 768 66, 806 72 C 818 74, 822 82, 814 88" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 770 72 C 762 108, 752 160, 748 190 C 746 206, 754 216, 768 212 C 778 209, 784 202, 788 196" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 826 170 C 818 158, 798 158, 790 172 C 782 186, 786 206, 802 210 C 814 213, 824 204, 826 190 C 828 176, 828 166, 828 160 C 826 178, 824 196, 826 204 C 828 212, 838 210, 846 200" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 846 200 C 858 192, 872 188, 880 181 C 886 176, 882 164, 872 164 C 858 164, 846 180, 848 198 C 850 214, 866 220, 882 210" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 882 210 C 918 220, 926 248, 892 258 C 830 270, 300 268, 190 250 C 160 245, 158 232, 184 226" fill="none" stroke="url(#lmtSigG)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ② 철학 + 현장 사진 + 기사 */}
      <section className="sec phil">
        <div className="wrap">
          <div className="qmark">&ldquo;</div>
          <div className="big">사람이 사랑입니다</div>
          <div className="qbody">우리는 이 지구별에 왜 왔을까요? <b>사랑받고, 사랑을 표현하기 위해서</b>입니다.
            그런데 그 사랑, 어떻게 표현할까요? 바로 <b>&ldquo;일&rdquo;</b>을 통해서입니다.
            우리가 살아있다는 걸 느끼는 순간은 내가 하는 그 일 속에 있습니다.<br/><br/>
            그럼 어떤 일을 해야 할까요? <b>가슴 뛰는 일</b>입니다.
            단순히 먹고살기 위한 일이 아니라 세상을 향해 사랑을 흘려보내는 일,
            그 일을 할 때 우리는 진짜 행복해집니다.<br/><br/>
            그래서 저는 이렇게 믿습니다. <b>사람은 사랑이고, 일은 그 사랑을 표현하는 방식입니다.</b>
          </div>
          <div className="qby">이문태 · 행복나눔 휴머니스트</div>

          {/* 활동 현장 */}
          <div className="onsite">
            <div className="onsite-h">
              <div><div className="sec-h">ON SITE</div><div className="sec-t" style={{fontSize:'30px'}}>현장에서</div></div>
              <div className="sec-d" style={{maxWidth:'420px',margin:'0',fontSize:'15px'}}>
                강의실에서, 강당에서, 마을 배움터에서.<br/>사람이 있는 자리라면 어디든 달려갔습니다.
              </div>
            </div>
            <div className="car">
              <div className="track" style={{transform:`translateX(${-100*actIdx}%)`}}>
                {actSlides}
              </div>
            </div>
            <div className="nav">
              <button className="arw" onClick={() => setActIdx(i => (i - 1 + actPageSizes.length) % actPageSizes.length)}>‹</button>
              <div className="dots">
                {actPageSizes.map((_,i) => (
                  <button key={i} className={`dot${i===actIdx?' on':''}`} onClick={() => setActIdx(i)}/>
                ))}
              </div>
              <button className="arw" onClick={() => setActIdx(i => (i + 1) % actPageSizes.length)}>›</button>
            </div>
          </div>

          <a className="art" style={{marginTop:'64px'}}
            href="https://www.eummedia.kr/article/%EC%9D%B4%EB%AC%B8%ED%83%9C-%ED%96%89%EB%B3%B5%EB%82%98%EB%88%94%ED%9C%B4%EB%A8%B8%EB%8B%88%EC%8A%A4%ED%8A%B8"
            target="_blank" rel="noopener noreferrer">
            <div className="ic">&#9636;</div>
            <div className="tx">
              <div className="k">이음미디어 인터뷰</div>
              <div className="t">이문태 — 행복나눔 휴머니스트</div>
              <div className="s">eummedia.kr · 살아온 이야기를 기사 전문으로 읽어 보세요</div>
            </div>
            <div className="go">기사 전문 보기 →</div>
          </a>
        </div>
      </section>

      {/* ③ 2층 AI 서재 */}
      <section className="sec lib">
        <div className="wrap">
          <div className="lib-head">
            <div>
              <div className="sec-h">DIGITAL LIBRARY</div>
              <div className="sec-t">2층으로 쌓아 올린<br/>전자책 14권</div>
            </div>
            <div className="sec-d" style={{maxWidth:'400px',margin:'0'}}>
              삶의 질문 하나에 책 한 권.<br/>한 번에 두 층 여섯 권씩, 세 번 넘기면 열네 권이 모두 보입니다.
            </div>
          </div>
          <div className="stage">
            <div className="car">
              <div className="track" style={{transform:`translateX(${-100*libIdx}%)`}}>
                {Array.from({length:LMT_SLIDES}, (_,si) => <LmtBookSlide key={si} si={si} />)}
              </div>
            </div>
            <div className="nav">
              <button className="arw" onClick={() => setLibIdx(i => (i - 1 + LMT_SLIDES) % LMT_SLIDES)}>‹</button>
              <div className="dots">
                {Array.from({length:LMT_SLIDES}, (_,i) => (
                  <button key={i} className={`dot${i===libIdx?' on':''}`} onClick={() => setLibIdx(i)}/>
                ))}
              </div>
              <button className="arw" onClick={() => setLibIdx(i => (i + 1) % LMT_SLIDES)}>›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ④ 대표 영상 */}
      <section className="sec" style={{background:'rgba(12,17,32,.52)'}}>
        <div className="wrap">
          <div className="lib-head">
            <div><div className="sec-h">ON AIR</div><div className="sec-t">대표 영상</div></div>
            <div className="sec-d" style={{maxWidth:'400px',margin:'0'}}>
              글로 다 담기지 않는 것이 있습니다.<br/>목소리와 표정으로 직접 만나 보세요.
            </div>
          </div>
          <div className="vids">
            {LMT_VIDS.map(v => (
              <a key={v.id} className="vid" href={`https://youtu.be/${v.id}`} target="_blank" rel="noopener noreferrer">
                <div className="th">
                  <img src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`} alt=""
                    onError={ev => { ev.currentTarget.src=`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`; }}/>
                  <div className="pl"><i>&#9654;</i></div>
                </div>
                <div className="tt">{v.t}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 이력 · 경력 · 자격 (아코디언) */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-h">CAREER</div>
          <div className="sec-t">10년마다 한 번씩, 길을 바꿨습니다</div>
          <div className="sec-d">군인에서 영업으로, 경영에서 돌봄으로, 돌봄에서 다시 AI로.<br/>
            자리를 옮길 때마다 향한 곳은 언제나 사람이었습니다.</div>
          <div className="acc">
            <details>
              <summary>
                <span className="no">01</span><span className="h">경력</span>
                <span className="sm">1989 — 현재 · 6단계</span><span className="pm">+</span>
              </summary>
              <div className="body"><div className="tl">
                <div className="ev"><div className="yr">1989 — 1991</div><div className="ti">육군 보병 11사단 연대교육장교</div>
                  <div className="de">가르치는 일로 사회생활을 시작했습니다.</div></div>
                <div className="ev"><div className="yr">1991 — 2002</div><div className="ti">삼성생명 영업소장</div>
                  <div className="de">11년간 사람의 살림과 미래를 상담했습니다.</div></div>
                <div className="ev"><div className="yr">2002 — 2012</div><div className="ti">열린아이티 영업이사 · 열린CNS 대표이사</div>
                  <div className="de">IT 현장에서 경영을 배웠습니다.</div></div>
                <div className="ev"><div className="yr">2012 — 2014</div><div className="ti">생명숲 실버타운 사무국장</div>
                  <div className="de">노년의 삶 가까이에서 일했습니다.</div></div>
                <div className="ev"><div className="yr">2014 — 2024</div><div className="ti">김오곤한의원 사무장 · 건강상담사</div>
                  <div className="de">10년간 몸과 마음의 회복을 상담했습니다.</div></div>
                <div className="ev on"><div className="yr">2025 — 현재</div><div className="ti">㈜봉숭아학당문화혁신학교 연구소장</div>
                  <div className="de">웃자대한민국협회 사무총장 겸임.</div></div>
              </div></div>
            </details>
            <details>
              <summary>
                <span className="no">02</span><span className="h">학력</span>
                <span className="sm">경영학사 · 사회복지 석사 · 자연의학 박사 수료</span><span className="pm">+</span>
              </summary>
              <div className="body"><ul className="rows">
                <li><b>2026</b>열린사이버대학교 AI융합학과 특임교수 (현재)</li>
                <li><b>2019</b>NWSS 동양의학대학 자연의학 박사 수료</li>
                <li><b>2016</b>서울사회복지대학원대학교 사회복지 석사</li>
                <li><b>1989</b>아주대학교 경영학사</li>
                <li><b>1985</b>유신고등학교 졸업</li>
              </ul></div>
            </details>
            <details>
              <summary>
                <span className="no">03</span><span className="h">자격증</span>
                <span className="sm">6종</span><span className="pm">+</span>
              </summary>
              <div className="body"><div className="chips">
                <span className="chip">NLP Master Practitioner · 2009</span>
                <span className="chip">사회복지사 · 2014</span>
                <span className="chip">평생교육사 · 2016</span>
                <span className="chip">가정상담사 · 2016</span>
                <span className="chip">심리상담사 · 2016</span>
                <span className="chip">요양보호사 · 2017</span>
              </div></div>
            </details>
            <details>
              <summary>
                <span className="no">04</span><span className="h">연구소</span>
                <span className="sm">2곳 · 2015년부터</span><span className="pm">+</span>
              </summary>
              <div className="body"><ul className="rows">
                <li><b>2015 ~ 현재</b>한국행복누리연구소 · 소장</li>
                <li><b>2016 ~ 현재</b>뫔 자연치유건강연구소 · 소장</li>
              </ul></div>
            </details>
            <details>
              <summary>
                <span className="no">05</span><span className="h">강의해 온 곳</span>
                <span className="sm">대학 평생교육원 · 경찰서 · 공공기관</span><span className="pm">+</span>
              </summary>
              <div className="body"><ul className="rows">
                <li><b>2025</b>대한노인회</li>
                <li><b>2018</b>대명고등학교 한울대안학교 (명상교사)</li>
                <li><b>2017</b>덕성여자대학교 평생교육원 · 파워지식포럼</li>
                <li><b>2016</b>고려대학교 · 연세대학교 · 서울사회복지대학원대학교 평생교육원</li>
                <li><b>2015</b>사강 장수대학</li>
                <li><b>2014</b>화성동부경찰서 · 안산상록경찰서 · 여주 농촌진흥청</li>
              </ul></div>
            </details>
          </div>
        </div>
      </section>

      {/* ⑥ 하는 일 */}
      <section className="sec" style={{background:'rgba(12,17,32,.52)'}}>
        <div className="wrap">
          <div className="sec-h">WHAT I DO</div>
          <div className="sec-t">AI를 배우러 오셨다가,<br/>다시 사는 법을 배워 가십니다</div>
          <div className="sec-d">주로 만나는 분들은 5060세대입니다. 인생 후반전을 시작하는 자리에서 함께합니다.</div>
          <div className="cards">
            <div className="card"><div className="ic">&#9672;</div><b>AI 활용 교육</b>
              <p>5060세대가 실제로 쓸 수 있는 도구까지. 어렵게 설명하지 않습니다.</p></div>
            <div className="card"><div className="ic">&#9670;</div><b>사업기획</b>
              <p>문화혁신학교의 교육 사업을 설계하고 현장에 옮깁니다.</p></div>
            <div className="card"><div className="ic">&#10022;</div><b>협회 총괄</b>
              <p>웃자대한민국협회 사무총장으로 웃음과 나눔의 판을 만듭니다.</p></div>
          </div>
        </div>
      </section>

      {/* ⑦ 숏츠 */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-h">SHORTS</div>
          <div className="sec-t">1분 안에 만나는 이야기</div>
          <div className="sec-d">짧지만 하고 싶은 말은 다 들어 있습니다.</div>
          <div id="shCar" className="car">
            <div className="track" style={{transform:`translateX(${-100*shIdx}%)`}}>
              {Array.from({length:shSlides}, (_,si) => {
                const slice = LMT_SHORTS.slice(si*SPER, (si+1)*SPER);
                const shGridStyle = slice.length < SPER
                  ? {gridTemplateColumns:`repeat(${slice.length},calc((100% - ${SPER-1}*var(--shgap))/${SPER}))`,justifyContent:'center'}
                  : {};
                return (
                  <div key={si} className="slide">
                    <div className="shorts" style={shGridStyle}>
                      {slice.map(id => (
                        <a key={id} className="sh" href={`https://youtube.com/shorts/${id}`} target="_blank" rel="noopener noreferrer">
                          <div className="th">
                            <img src={`https://i.ytimg.com/vi/${id}/oardefault.jpg`} alt=""
                              onError={ev => { ev.currentTarget.src=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`; }}/>
                            <div className="pl"><i>&#9654;</i></div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {shSlides > 1 && (
            <div className="nav">
              <button className="arw" onClick={() => setShIdx(i => (i-1+shSlides)%shSlides)}>‹</button>
              <div className="dots">
                {Array.from({length:shSlides}, (_,i) => (
                  <button key={i} className={`dot${i===shIdx?' on':''}`} onClick={() => setShIdx(i)}/>
                ))}
              </div>
              <button className="arw" onClick={() => setShIdx(i => (i+1)%shSlides)}>›</button>
            </div>
          )}
        </div>
      </section>

      {/* ⑧ 채널 */}
      <section className="sec" style={{background:'rgba(12,17,32,.52)'}}>
        <div className="wrap">
          <div className="sec-h">CHANNELS</div>
          <div className="sec-t">채널 바로가기</div>
          <div className="chs">
            <a className="ch" href="https://www.youtube.com/@%ED%96%89%EB%B3%B5%ED%9E%90%EB%A7%81tv" target="_blank" rel="noopener noreferrer">
              <div className="d">&#9654;</div><div><b>행복힐링tv</b><span>YouTube</span></div>
            </a>
            <a className="ch" href="https://blog.naver.com/happynuri35" target="_blank" rel="noopener noreferrer">
              <div className="d">&#9998;</div><div><b>행복누리 블로그</b><span>naver blog</span></div>
            </a>
            <a className="ch" href="https://www.instagram.com/happyman9141" target="_blank" rel="noopener noreferrer">
              <div className="d">&#9711;</div><div><b>@happyman9141</b><span>Instagram</span></div>
            </a>
            <a className="ch" href="https://www.facebook.com/people/%EC%9D%B4%EB%AC%B8%ED%83%9C/pfbid0k3NWjSqNmmbVUWDe5RkcfDYD5DgLzYa4pQu48YYMkFX7gmYyktyV2wneA1QLuYWRl/" target="_blank" rel="noopener noreferrer">
              <div className="d">f</div><div><b>이문태</b><span>Facebook</span></div>
            </a>
          </div>
        </div>
      </section>

      {/* ⑨ 문의 */}
      <section className="sec ct">
        <div className="wrap">
          <div className="sec-h">CONTACT</div>
          <div className="sec-t">강의 · 상담 문의</div>
          <div className="ctwrap">
            <ul className="info">
              <li><span>전화</span>010-3708-3952</li>
              <li><span>이메일</span>happynuri35@naver.com</li>
              <li><span>텔레그램</span>happynuri35</li>
              <li><span>활동 지역</span>서울시 · 전국 출강</li>
              <li><span>주요 대상</span>5060세대 · 기관 · 평생교육원</li>
            </ul>
            <form className="form" onSubmit={handleLmtSubmit}>
              {lmtSubmitted ? (
                <div style={{textAlign:'center',padding:'40px 0'}}>
                  <div style={{fontSize:'36px',marginBottom:'16px'}}>✅</div>
                  <div style={{fontSize:'18px',fontWeight:800,color:'var(--am)'}}>문의가 전송되었습니다!</div>
                  <div style={{fontSize:'14px',color:'var(--sub)',marginTop:'10px'}}>
                    이문태 소장님께 알림이 발송되었습니다.<br/>빠른 시일 내에 연락드리겠습니다.
                  </div>
                </div>
              ) : (
                <>
                  <label>성함</label>
                  <input className="inp" placeholder="홍길동" value={lmtForm.name}
                    onChange={e => setLmtForm(f => ({...f, name: e.target.value}))}/>
                  <label>연락처</label>
                  <input className="inp" placeholder="010-0000-0000" value={lmtForm.phone}
                    onChange={e => setLmtForm(f => ({...f, phone: e.target.value}))}/>
                  <label>문의 내용</label>
                  <textarea className="inp" placeholder="강의 주제와 일정을 적어 주세요"
                    value={lmtForm.message}
                    onChange={e => setLmtForm(f => ({...f, message: e.target.value}))}/>
                  {lmtErr && <div style={{color:'#e05555',fontSize:'14px',marginTop:'12px'}}>{lmtErr}</div>}
                  <button className="btn" type="submit" disabled={lmtSubmitting}>
                    {lmtSubmitting ? '전송 중…' : '문의 보내기'}
                  </button>
                  <div className="note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14,verticalAlign:-2,marginRight:6}}>
                      <rect x="2.5" y="5" width="19" height="14" rx="2.5"/>
                      <path d="M3 7l9 6 9-6"/>
                    </svg>
                    전송 시 이문태 소장님께 알림이 발송됩니다
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <div className="ft">PIUM 전문가 프로필 · 이음미디어 &nbsp;|&nbsp; eummedia.kr/pium-app/leemoontae</div>
    </div>
  );
}

/* ── 메인 컴포넌트 ── */
export default function PiumAppDetailPage() {
  const { slug } = useParams();

  if (slug === "sungchangwoon") return <SungchangwoonPage />;
  if (slug === "ohaengja")     return <OhaengjaPage />;
  if (slug === "leekwangwoo")  return <LeekwangwooPage />;
  if (slug === "choiilrye")    return <ChoiilryePage />;
  if (slug === "leemoontae")   return <LeeMoontaePage />;

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
