import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const GREEN      = "#166534";
const GREEN_DARK = "#14532d";

/* ── 로고 중심에서 뻗는 빛나는 전선 SVG (PiumRequest와 동일) ── */
function GlowWires() {
  const CX = 500, CY = 330;
  const wires = [
    { d:`M${CX},${CY} L600,${CY} L600,240 L720,240 L720,130 L880,130`, c:"#22c55e", len:480, dur:"2.8s", b:"0s"   },
    { d:`M${CX},${CY} L570,${CY} L570,195 L670,195 L670,90`,           c:"#16a34a", len:370, dur:"3.2s", b:"0.6s" },
    { d:`M${CX},${CY} L660,${CY} L660,285 L880,285`,                   c:"#4ade80", len:370, dur:"2.5s", b:"1.0s" },
    { d:`M${CX},${CY} L400,${CY} L400,240 L280,240 L280,130 L120,130`, c:"#a855f7", len:480, dur:"3.0s", b:"0.4s" },
    { d:`M${CX},${CY} L430,${CY} L430,195 L330,195 L330,90`,           c:"#7c3aed", len:370, dur:"3.4s", b:"1.2s" },
    { d:`M${CX},${CY} L340,${CY} L340,285 L120,285`,                   c:"#c084fc", len:370, dur:"2.7s", b:"0.8s" },
    { d:`M${CX},${CY} L610,${CY} L610,420 L760,420 L760,560`,          c:"#22c55e", len:380, dur:"3.1s", b:"0.5s" },
    { d:`M${CX},${CY} L390,${CY} L390,420 L240,420 L240,560`,          c:"#9333ea", len:380, dur:"3.3s", b:"0.2s" },
    { d:`M${CX},${CY} L${CX},215 L630,215 L630,90 L780,90`,            c:"#4ade80", len:390, dur:"2.6s", b:"0.7s" },
    { d:`M${CX},${CY} L${CX},445 L370,445 L370,580`,                   c:"#c084fc", len:360, dur:"2.9s", b:"1.1s" },
  ];
  const nodes = [
    {x:600,y:CY,c:"#22c55e"},{x:600,y:240,c:"#22c55e"},{x:720,y:240,c:"#22c55e"},
    {x:400,y:CY,c:"#a855f7"},{x:400,y:240,c:"#a855f7"},{x:280,y:240,c:"#a855f7"},
    {x:610,y:420,c:"#22c55e"},{x:760,y:420,c:"#4ade80"},
    {x:390,y:420,c:"#9333ea"},{x:240,y:420,c:"#c084fc"},
    {x:CX,y:215,c:"#4ade80"},{x:630,y:215,c:"#4ade80"},
    {x:CX,y:445,c:"#c084fc"},{x:370,y:445,c:"#c084fc"},
    {x:660,y:CY,c:"#4ade80"},{x:340,y:CY,c:"#c084fc"},
  ];
  return (
    <svg aria-hidden="true"
      viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid slice"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:2 }}>
      <defs>
        <filter id="ps-glow-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ps-glow-p" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ps-glow-node" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="ps-fade" cx="50%" cy="49%" r="48%">
          <stop offset="15%"  stopColor="white" stopOpacity="1"/>
          <stop offset="60%"  stopColor="white" stopOpacity="0.7"/>
          <stop offset="85%"  stopColor="white" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="ps-mask">
          <rect width="1000" height="680" fill="url(#ps-fade)"/>
        </mask>
      </defs>
      <g mask="url(#ps-mask)">
        {wires.map(({d,c},i)=>(
          <path key={`base-${i}`} d={d} stroke={c} strokeWidth="0.9"
                fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        ))}
        {wires.map(({d,c,len,dur,b},i)=>{
          const isG = c.startsWith("#2")||c.startsWith("#1")||c.startsWith("#4");
          return (
            <path key={`anim-${i}`} d={d} stroke={c} strokeWidth="2.2"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  filter={isG ? "url(#ps-glow-g)" : "url(#ps-glow-p)"}
                  strokeDasharray={`16 ${len}`} strokeDashoffset={len} opacity="0">
              <animate attributeName="strokeDashoffset" from={len} to={-16} dur={dur} begin={b} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur={dur} begin={b} repeatCount="indefinite"/>
            </path>
          );
        })}
        {nodes.map(({x,y,c},i)=>(
          <circle key={i} cx={x} cy={y} r="2.5" fill={c}
                  filter="url(#ps-glow-node)" opacity="0">
            <animate attributeName="opacity" values="0;1;0"
                     dur={`${1.6+i*0.2}s`} begin={`${(i*0.32)%2.4}s`} repeatCount="indefinite"/>
            <animate attributeName="r" values="1.5;4;1.5"
                     dur={`${1.6+i*0.2}s`} begin={`${(i*0.32)%2.4}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        <circle cx={CX} cy={CY} r="18" fill="none" stroke="#22c55e" strokeWidth="1.5"
                filter="url(#ps-glow-g)" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="r" values="14;30;14" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx={CX} cy={CY} r="24" fill="none" stroke="#a855f7" strokeWidth="1"
                filter="url(#ps-glow-p)" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
          <animate attributeName="r" values="20;38;20" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}

/* ── 상수 ── */
const CATEGORIES = [
  { value: "",              label: "카테고리를 선택하세요" },
  { value: "health_beauty", label: "🏥 건강·뷰티" },
  { value: "small_biz",     label: "🏪 소상공인·창업" },
  { value: "education",     label: "📚 교육·학습" },
  { value: "ai_tool",       label: "🤖 AI 활용" },
  { value: "productivity",  label: "🛠️ 업무·생산성" },
  { value: "lifestyle",     label: "🌿 생활·편의" },
  { value: "hobby",         label: "🎨 취미·창작" },
  { value: "community",     label: "🏘️ 지역·커뮤니티" },
  { value: "media",         label: "📰 정보·미디어" },
  { value: "expert_tool",   label: "💼 전문가 도구" },
];

const COMPLETENESS_OPTIONS = [
  { value: "seed",   label: "🌱 씨앗", desc: "완성 전, 써볼 수 있어요" },
  { value: "sprout", label: "🌿 새싹", desc: "기본 기능은 작동해요" },
  { value: "bloom",  label: "🌸 활짝", desc: "완성된 앱이에요" },
];

function slugify(title) {
  const ascii = title.replace(/[^\w\s-]/g, "").trim().toLowerCase().replace(/\s+/g, "-").slice(0, 24);
  const base  = ascii || "pium-app";
  const rand  = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
}

/* ── 공통 스타일 ── */
const inputStyle = {
  width: "100%", padding: "13px 16px", fontSize: 17,
  border: "1.5px solid #d1d5db", borderRadius: 8,
  fontFamily: "'Noto Sans KR', sans-serif",
  boxSizing: "border-box", outline: "none",
  color: "#1a1a1a", background: "#fff",
};
const labelStyle = {
  display: "block", fontSize: 16, fontWeight: 700,
  color: "#1f2937", marginBottom: 8,
};
const sectionTitle = {
  fontSize: 15, fontWeight: 800, color: GREEN,
  letterSpacing: "0.05em", textTransform: "uppercase",
  marginBottom: 16, paddingBottom: 8,
  borderBottom: `2px solid #dcfce7`,
};

/* ── 메인 컴포넌트 ── */
export default function PiumSubmitPage() {
  const { user, profile } = useAuth();
  const navigate          = useNavigate();
  const fileRef           = useRef();

  const [form, setForm] = useState({
    title: "", tagline: "", app_url: "",
    is_free: "true",
    price: "",
    description: "", how_to_use: "", target_user: "",
    category: "", completeness: "", article_url: "",
  });
  const [thumbnail,        setThumbnail]        = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [status,           setStatus]           = useState("idle"); // idle | sending | done | error
  const [errorMsg,         setErrorMsg]         = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    // 필수 항목 검증
    if (!form.title.trim())        return setErrorMsg("앱 이름을 입력해주세요.");
    if (!form.tagline.trim())      return setErrorMsg("한 줄 소개를 입력해주세요.");
    if (!form.app_url.trim())      return setErrorMsg("앱 링크를 입력해주세요.");
    if (!thumbnail)                return setErrorMsg("썸네일 이미지를 업로드해주세요.");
    if (!form.description.trim())  return setErrorMsg("'이런 걸 해줘요'를 입력해주세요.");
    if (!form.how_to_use.trim())   return setErrorMsg("'이렇게 쓰면 돼요'를 입력해주세요.");
    if (!form.category)            return setErrorMsg("카테고리를 선택해주세요.");
    if (!form.completeness)        return setErrorMsg("완성도를 선택해주세요.");

    setStatus("sending");

    try {
      // 1. 썸네일 → pium-thumbnails 버킷
      const ext      = thumbnail.name.split(".").pop().toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("pium-thumbnails")
        .upload(fileName, thumbnail, { upsert: false });
      if (uploadError) throw new Error(`썸네일 업로드 실패: ${uploadError.message}`);

      const { data: urlData } = supabase.storage.from("pium-thumbnails").getPublicUrl(fileName);
      const thumbnailUrl = urlData.publicUrl;

      // 2. API → apps INSERT + pium_role 업데이트 + 텔레그램
      const res = await fetch("/api/pium-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_model:   form.is_free === "true" ? "free" : "paid",
          price:         form.is_free === "true" ? 0 : (parseInt(form.price, 10) || 0),
          thumbnail_url: thumbnailUrl,
          slug:          slugify(form.title),
          maker_id:      user.id,
          nickname:      profile?.nickname ?? user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "제출에 실패했어요.");

      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "오류가 발생했어요. 다시 시도해주세요.");
      setStatus("idle");
    }
  }

  /* ── 완료 화면 ── */
  if (status === "done") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
                    background:"linear-gradient(135deg,#f0fdf9,#faf5ff)",
                    fontFamily:"'Noto Sans KR',sans-serif", padding:"40px 20px" }}>
        <div style={{ maxWidth:440, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🌸</div>
          <h2 style={{ fontSize:24, fontWeight:900, color:GREEN_DARK, margin:"0 0 16px" }}>
            등록 신청이 완료됐어요!
          </h2>
          <p style={{ fontSize:16, color:"#374151", lineHeight:1.8, marginBottom:32 }}>
            세연(운영자)이 확인 후<br/>
            1~3일 안에 결과를 알려드릴게요.
          </p>
          <button
            onClick={() => navigate("/pium")}
            style={{ background:`linear-gradient(90deg,${GREEN},#7c3aed)`,
                     color:"#fff", border:"none", borderRadius:10,
                     padding:"14px 32px", fontSize:15, fontWeight:700,
                     cursor:"pointer", fontFamily:"inherit" }}>
            피움 홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  /* ── 메인 폼 화면 ── */
  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Noto Sans KR',sans-serif", position:"relative" }}>

      {/* 배경 */}
      <div style={{ position:"fixed", inset:0, zIndex:0,
                    backgroundImage:"url(/pium-bg.png)",
                    backgroundSize:"cover", backgroundPosition:"center center" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:1, background:"rgba(236,253,245,0.72)" }}/>
      <div style={{ position:"fixed", inset:0, zIndex:2, pointerEvents:"none" }}>
        <GlowWires />
      </div>

      {/* 콘텐츠 */}
      <div style={{ position:"relative", zIndex:3,
                    maxWidth:620, margin:"0 auto", padding:"80px 20px 80px" }}>

        {/* ── 페이지 타이틀 ── */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src="/pium-logo.png" alt="plum"
               style={{ height:44, width:"auto", objectFit:"contain",
                        mixBlendMode:"multiply", marginBottom:12 }}/>
          <h1 style={{ fontSize:"clamp(20px,4vw,26px)", fontWeight:900,
                       color:GREEN_DARK, margin:"0 0 6px", lineHeight:1.3 }}>
            앱 등록 신청
          </h1>
          <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>Make it. Bloom it. PIUM. 🌸</p>
        </div>

        {/* ── 안내문 카드 ── */}
        <div style={{ background:"#fff", borderRadius:16, padding:"28px 28px 24px",
                      boxShadow:"0 4px 24px rgba(0,0,0,0.10)", marginBottom:20 }}>
          <p style={{ fontSize:16, fontWeight:800, color:GREEN, margin:"0 0 14px" }}>
            🌱 피움에 앱을 올리기 전에 꼭 읽어주세요
          </p>
          <p style={{ fontSize:17, fontWeight:700, color:"#111827", margin:"0 0 12px", lineHeight:1.8 }}>
            피움은 세상에 없던 플랫폼이에요.
          </p>
          <p style={{ fontSize:16, color:"#4b5563", lineHeight:1.9, margin:"0 0 16px" }}>
            앱스토어에는 개발자가 만든 앱이 있고<br/>
            쇼핑몰에는 누군가 만든 제품이 있죠.<br/>
            피움에는 <strong style={{ color:GREEN_DARK }}>경험</strong>이 있어요.
          </p>
          <p style={{ fontSize:16, color:"#4b5563", lineHeight:1.9, margin:"0 0 16px" }}>
            코딩을 몰라도 괜찮아요.<br/>
            AI와 함께 만들어도 괜찮아요.<br/>
            완벽하지 않아도 괜찮아요.<br/>
            단 하나, <strong style={{ color:GREEN_DARK }}>당신의 경험이 담겨 있어야 해요.</strong>
          </p>
          <div style={{ background:"#f0fdf4", borderRadius:10, padding:"14px 16px",
                        marginBottom:16, fontSize:16, color:"#166534", lineHeight:2.1 }}>
            ✅ 내가 직접 기획하고 만든 앱이에요<br/>
            ✅ 링크를 클릭하면 실제로 열리고 작동해요<br/>
            ✅ 내 경험과 전문성이 이 앱에 녹아 있어요
          </div>
          <p style={{ fontSize:15, color:"#6b7280", lineHeight:1.9, margin:0 }}>
            세연(운영자)이 직접 확인 후<br/>
            1~3일 안에 결과를 알려드릴게요.<br/>
            <span style={{ fontWeight:700, color:GREEN }}>Make it. Bloom it. PIUM. 🌸</span>
          </p>
        </div>

        {/* ── 폼 카드 ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ background:"#fff", borderRadius:16, padding:"28px 28px 24px",
                        boxShadow:"0 4px 24px rgba(0,0,0,0.10)" }}>

            {/* ── 기본 정보 ── */}
            <p style={sectionTitle}>기본 정보</p>

            {/* 앱 이름 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>앱 이름 <span style={{ color:"#dc2626" }}>*</span></label>
              <input name="title" value={form.title} onChange={handleChange}
                     placeholder="예: 이음미디어" style={inputStyle} maxLength={60}/>
            </div>

            {/* 한 줄 소개 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>
                한 줄 소개 <span style={{ color:"#dc2626" }}>*</span>
                <span style={{ fontWeight:400, color:"#9ca3af", marginLeft:6 }}>
                  ({form.tagline.length}/50자)
                </span>
              </label>
              <input name="tagline" value={form.tagline} onChange={handleChange}
                     placeholder="앱 카드에 표시되는 짧은 소개" style={inputStyle} maxLength={50}/>
            </div>

            {/* 앱 링크 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>앱 링크(URL) <span style={{ color:"#dc2626" }}>*</span></label>
              <input name="app_url" value={form.app_url} onChange={handleChange}
                     type="url" placeholder="https://" style={inputStyle}/>
            </div>

            {/* 썸네일 업로드 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>썸네일 이미지 <span style={{ color:"#dc2626" }}>*</span></label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ border:`2px dashed ${thumbnailPreview ? GREEN : "#d1d5db"}`,
                         borderRadius:10, padding:thumbnailPreview ? 8 : "24px 16px",
                         textAlign:"center", cursor:"pointer",
                         background: thumbnailPreview ? "#f0fdf4" : "#fafafa",
                         transition:"all .2s" }}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="미리보기"
                       style={{ maxHeight:160, maxWidth:"100%", borderRadius:8, objectFit:"cover" }}/>
                ) : (
                  <>
                    <div style={{ fontSize:32, marginBottom:8 }}>🖼️</div>
                    <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>
                      클릭해서 이미지 선택<br/>
                      <span style={{ fontSize:11, color:"#9ca3af" }}>JPG, PNG, WEBP (권장: 800×600)</span>
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                     style={{ display:"none" }} onChange={handleFile}/>
              {thumbnailPreview && (
                <button type="button"
                  onClick={() => { setThumbnail(null); setThumbnailPreview(null); fileRef.current.value = ""; }}
                  style={{ marginTop:6, fontSize:12, color:"#9ca3af", background:"none",
                           border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                  ✕ 이미지 다시 선택
                </button>
              )}
            </div>

            {/* 무료/유료 */}
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>가격 <span style={{ color:"#dc2626" }}>*</span></label>
              <div style={{ display:"flex", gap:12 }}>
                {[{ value:"true", label:"무료" }, { value:"false", label:"유료" }].map(opt => (
                  <label key={opt.value}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                             gap:8, padding:"12px 0", borderRadius:10, cursor:"pointer",
                             border:`2px solid ${form.is_free === opt.value ? GREEN : "#e5e7eb"}`,
                             background: form.is_free === opt.value ? "#f0fdf4" : "#fff",
                             fontWeight: form.is_free === opt.value ? 700 : 400,
                             color: form.is_free === opt.value ? GREEN : "#374151",
                             fontSize:14, transition:"all .15s" }}>
                    <input type="radio" name="is_free" value={opt.value}
                           checked={form.is_free === opt.value}
                           onChange={handleChange} style={{ display:"none" }}/>
                    {opt.value === "true" ? "🎁" : "💳"} {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* 유료 선택 안내 + 희망 판매가 */}
            {form.is_free === "false" && (
              <>
                <div style={{ background:"#fefce8", border:"1.5px solid #fde68a",
                              borderRadius:10, padding:"16px 18px", marginTop:-8, marginBottom:16,
                              fontSize:15, color:"#92400e", lineHeight:1.9 }}>
                  <p style={{ margin:"0 0 6px", fontWeight:700 }}>💳 유료를 선택하셨네요!</p>
                  <p style={{ margin:0 }}>
                    피움의 결제 기능은 준비 중이에요.<br/>
                    법적 절차(통신판매중개 신고 등)를 갖춘 뒤<br/>
                    정식으로 열릴 예정이에요.<br/><br/>
                    지금은 무료로 먼저 나눠보셔도 좋아요.<br/>
                    결제가 열리면 가장 먼저 알려드릴게요! 🌸
                  </p>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={labelStyle}>희망 판매가 (원)</label>
                  <input
                    name="price" type="number" min="0" value={form.price}
                    onChange={handleChange}
                    placeholder="예: 9900"
                    style={inputStyle}
                  />
                  <p style={{ fontSize:13, color:"#9ca3af", margin:"6px 0 0" }}>
                    수요 파악용으로만 저장되며, 실제 결제는 6단계에서 열립니다.
                  </p>
                </div>
              </>
            )}

            {/* ── 앱 소개 ── */}
            <p style={sectionTitle}>앱 소개</p>

            {/* 이런 걸 해줘요 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>이런 걸 해줘요 <span style={{ color:"#dc2626" }}>*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange}
                        rows={4} placeholder={"핵심 기능을 3줄 이내로 적어주세요.\n예: · 매장 정보를 AI가 자동으로 정리해줘요\n    · 블로그 초안을 5초 만에 만들어줘요"}
                        style={{ ...inputStyle, resize:"vertical", lineHeight:1.7 }}/>
            </div>

            {/* 이렇게 쓰면 돼요 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>이렇게 쓰면 돼요 <span style={{ color:"#dc2626" }}>*</span></label>
              <textarea name="how_to_use" value={form.how_to_use} onChange={handleChange}
                        rows={3} placeholder="사용 방법을 심플하게 설명해주세요."
                        style={{ ...inputStyle, resize:"vertical", lineHeight:1.7 }}/>
            </div>

            {/* 누구에게 좋아요 */}
            <div style={{ marginBottom:24 }}>
              <label style={labelStyle}>
                누구에게 좋아요
                <span style={{ fontWeight:400, color:"#9ca3af", marginLeft:6 }}>(선택)</span>
              </label>
              <input name="target_user" value={form.target_user} onChange={handleChange}
                     placeholder="예: 소셜미디어 마케터, 50대 자영업자" style={inputStyle}/>
            </div>

            {/* ── 분류 ── */}
            <p style={sectionTitle}>분류</p>

            {/* 카테고리 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>카테고리 <span style={{ color:"#dc2626" }}>*</span></label>
              <select name="category" value={form.category} onChange={handleChange}
                      style={{ ...inputStyle, appearance:"auto" }}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} disabled={c.value === ""}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 완성도 */}
            <div style={{ marginBottom:18 }}>
              <label style={labelStyle}>완성도 <span style={{ color:"#dc2626" }}>*</span></label>
              <div style={{ display:"flex", gap:10 }}>
                {COMPLETENESS_OPTIONS.map(opt => (
                  <label key={opt.value}
                    style={{ flex:1, display:"flex", flexDirection:"column",
                             alignItems:"center", justifyContent:"center", gap:4,
                             padding:"14px 8px", borderRadius:12, cursor:"pointer",
                             border:`2px solid ${form.completeness === opt.value ? GREEN : "#e5e7eb"}`,
                             background: form.completeness === opt.value ? "#f0fdf4" : "#fff",
                             textAlign:"center", transition:"all .15s" }}>
                    <input type="radio" name="completeness" value={opt.value}
                           checked={form.completeness === opt.value}
                           onChange={handleChange} style={{ display:"none" }}/>
                    <span style={{ fontSize:22 }}>{opt.label.split(" ")[0]}</span>
                    <span style={{ fontSize:13, fontWeight:700,
                                   color: form.completeness === opt.value ? GREEN : "#374151" }}>
                      {opt.label.split(" ")[1]}
                    </span>
                    <span style={{ fontSize:11, color:"#9ca3af", lineHeight:1.4 }}>
                      {opt.desc}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 연결 기사 */}
            <div style={{ marginBottom:28 }}>
              <label style={labelStyle}>
                연결 기사 URL
                <span style={{ fontWeight:400, color:"#9ca3af", marginLeft:6 }}>(선택)</span>
              </label>
              <input name="article_url" value={form.article_url} onChange={handleChange}
                     type="url" placeholder="이음미디어 기사 링크 (선택사항)" style={inputStyle}/>
              <p style={{ fontSize:11, color:"#9ca3af", margin:"6px 0 0" }}>
                이 앱과 관련된 이음미디어 기사가 있으면 연결할 수 있어요.
              </p>
            </div>

            {/* 에러 메시지 */}
            {errorMsg && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca",
                            borderRadius:8, padding:"12px 16px", marginBottom:16,
                            fontSize:13, color:"#dc2626" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 제출 버튼 */}
            <button type="submit" disabled={status === "sending"}
              style={{ width:"100%", padding:"16px 0",
                       background: status === "sending"
                         ? "#9ca3af"
                         : `linear-gradient(90deg,${GREEN},#7c3aed)`,
                       color:"#fff", border:"none", borderRadius:12,
                       fontSize:16, fontWeight:900, cursor: status === "sending" ? "not-allowed" : "pointer",
                       fontFamily:"'Noto Sans KR',sans-serif",
                       boxShadow:"0 4px 16px rgba(22,101,52,0.25)",
                       transition:"opacity .2s" }}>
              {status === "sending" ? "⏳ 등록 중..." : "🌸 등록 신청하기"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
