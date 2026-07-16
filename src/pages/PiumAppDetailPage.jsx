import { useState } from "react";
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
  .ohj3-thesis .small { margin-top:14px; font-size:15px; color:var(--mute); }

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
    padding-bottom:8px; -webkit-overflow-scrolling:touch;
    scrollbar-width:thin; scrollbar-color:#E11D74 transparent; }
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

  /* 강연 현장 */
  .ohj3-stage-band { background:var(--blush); padding:58px 0; }
  .ohj3-feature-img { width:100%; border-radius:20px; display:block;
    object-fit:cover; max-height:340px; }
  .ohj3-lecture-strip { margin-top:14px; display:flex; gap:10px; overflow-x:auto;
    padding-bottom:8px; -webkit-overflow-scrolling:touch;
    scrollbar-width:thin; scrollbar-color:#E11D74 transparent; }
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

function OhaengjaPage() {
  const [formOpen,   setFormOpen]   = useState(false);
  const [formData,   setFormData]   = useState(OHJ3_BLANK);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr,  setSubmitErr]  = useState('');

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
          <div className="ohj3-tv-strip">
            {Array.from({length:OHJ3_TV_COUNT},(_,i)=>i+1).map(n=>(
              <img key={n} src={`/ohaengja-tv-photos/ohaengja-tv-${n}.jpg`}
                alt={`방송 출연 ${n}`}
                onError={e=>{ e.currentTarget.style.display="none"; }}/>
            ))}
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

      {/* 강연 현장 — 34장 */}
      <div className="ohj3-stage-band">
        <div className="ohj3-inner">
          <div className="ohj3-sec-k">ON STAGE</div>
          <div className="ohj3-sec-h jua">강연 현장</div>
          <img src="/ohaengja-lecture-photos/ohaengja-lecture-1.jpg"
            alt="오행자 대표 강연" className="ohj3-feature-img"
            onError={e=>{ e.currentTarget.style.display="none"; }}/>
          <div className="ohj3-lecture-strip">
            {Array.from({length:33},(_,i)=>i+2).map(n=>(
              <img key={n}
                src={`/ohaengja-lecture-photos/ohaengja-lecture-${n}.jpg`}
                alt={`강연 현장 ${n}`}
                onError={e=>{ e.currentTarget.style.display="none"; }}/>
            ))}
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
            <a href="https://www.eummedia.kr/" target="_blank" rel="noopener noreferrer" className="ohj3-ch">
              <span className="ci">▤</span>
              <div className="ct"><b>이음미디어</b><span>인터넷신문</span></div>
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

/* ── 메인 컴포넌트 ── */
export default function PiumAppDetailPage() {
  const { slug } = useParams();

  if (slug === "sungchangwoon") return <SungchangwoonPage />;
  if (slug === "ohaengja")     return <OhaengjaPage />;

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
