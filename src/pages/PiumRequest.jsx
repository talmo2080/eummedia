import { useState } from "react";
import { Link } from "react-router-dom";

const GREEN      = "#166534";
const GREEN_DARK = "#14532d";

/* ── 로고 중심에서 뻗는 빛나는 전선 SVG ── */
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
        <filter id="rq-glow-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rq-glow-p" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="rq-glow-node" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="rq-fade" cx="50%" cy="49%" r="48%">
          <stop offset="15%"  stopColor="white" stopOpacity="1"/>
          <stop offset="60%"  stopColor="white" stopOpacity="0.7"/>
          <stop offset="85%"  stopColor="white" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="rq-mask">
          <rect width="1000" height="680" fill="url(#rq-fade)"/>
        </mask>
      </defs>
      <g mask="url(#rq-mask)">
        {/* 기본 전선 */}
        {wires.map(({d,c},i)=>(
          <path key={`base-${i}`} d={d} stroke={c} strokeWidth="0.9"
                fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
        ))}
        {/* 흐르는 빛 파티클 */}
        {wires.map(({d,c,len,dur,b},i)=>{
          const isG = c.startsWith("#2")||c.startsWith("#1")||c.startsWith("#4");
          return (
            <path key={`anim-${i}`} d={d} stroke={c} strokeWidth="2.2"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  filter={isG ? "url(#rq-glow-g)" : "url(#rq-glow-p)"}
                  strokeDasharray={`16 ${len}`} strokeDashoffset={len} opacity="0">
              <animate attributeName="strokeDashoffset" from={len} to={-16} dur={dur} begin={b} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.9;1" dur={dur} begin={b} repeatCount="indefinite"/>
            </path>
          );
        })}
        {/* 노드 반짝임 */}
        {nodes.map(({x,y,c},i)=>(
          <circle key={i} cx={x} cy={y} r="2.5" fill={c}
                  filter="url(#rq-glow-node)" opacity="0">
            <animate attributeName="opacity" values="0;1;0"
                     dur={`${1.6+i*0.2}s`} begin={`${(i*0.32)%2.4}s`} repeatCount="indefinite"/>
            <animate attributeName="r" values="1.5;4;1.5"
                     dur={`${1.6+i*0.2}s`} begin={`${(i*0.32)%2.4}s`} repeatCount="indefinite"/>
          </circle>
        ))}
        {/* 중심 펄스 */}
        <circle cx={CX} cy={CY} r="18" fill="none" stroke="#22c55e" strokeWidth="1.5"
                filter="url(#rq-glow-g)" opacity="0">
          <animate attributeName="opacity" values="0;0.7;0" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="r" values="14;30;14" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx={CX} cy={CY} r="24" fill="none" stroke="#a855f7" strokeWidth="1"
                filter="url(#rq-glow-p)" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
          <animate attributeName="r" values="20;38;20" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}

export default function PiumRequest() {
  const [form, setForm]     = useState({ name: "", contact: "", description: "" });
  const [status, setStatus] = useState("idle");

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.description.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/pium-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: 15,
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontFamily: "'Noto Sans KR', sans-serif",
    boxSizing: "border-box",
    outline: "none",
    color: "#1a1a1a",
    background: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 7,
  };

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Noto Sans KR', sans-serif",
      position: "relative",
    }}>
      {/* 배경 이미지 — 고정, 중앙 정렬 */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundImage: "url(/pium-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}/>

      {/* 연한 오버레이 — 로고 보이되 가독성 확보 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "rgba(236,253,245,0.70)",
      }}/>

      {/* GlowWires — 로고 위에 빛 효과 */}
      <div style={{ position:"fixed", inset:0, zIndex:2, pointerEvents:"none" }}>
        <GlowWires />
      </div>

      {/* 콘텐츠 */}
      <div style={{
        position: "relative", zIndex: 3,
        maxWidth: 500,
        margin: "0 auto",
        padding: "120px 20px 72px",
      }}>

        {/* 상단 — 배경에 로고가 보이므로 헤딩 텍스트만 */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontSize: "clamp(22px, 5vw, 30px)",
            fontWeight: 900,
            color: GREEN_DARK,
            margin: "0 0 10px",
            lineHeight: 1.35,
          }}>
            필요한 앱, 만들어드려요 🌱
          </h1>
          <p style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1f2937",
            lineHeight: 1.8,
            margin: 0,
          }}>
            매장·업무·취미 — 필요한 웹앱을 직접 제작해드립니다.<br/>
            아래로 편하게 문의 주세요.
          </p>
        </div>

        {/* 폼 카드 */}
        {status === "done" ? (
          <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "40px 28px",
            textAlign: "center",
            boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🌱</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: GREEN, marginBottom: 10 }}>
              문의가 접수됐어요!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.9, marginBottom: 28 }}>
              빠르게 확인 후 연락드릴게요.<br/>
              피움앱을 찾아주셔서 감사합니다.
            </div>
            <Link to="/" style={{
              display: "inline-block",
              background: GREEN,
              color: "#fff",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 8,
              fontFamily: "inherit",
            }}>
              이음미디어 홈으로 →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#fff",
            borderRadius: 14,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
            boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
          }}>
            <div>
              <label style={labelStyle} htmlFor="name">이름 *</label>
              <input
                id="name" name="name" type="text"
                placeholder="홍길동"
                value={form.name} onChange={handleChange} required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="contact">연락처 *</label>
              <input
                id="contact" name="contact" type="text"
                placeholder="전화번호 또는 이메일"
                value={form.contact} onChange={handleChange} required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="description">어떤 앱이 필요하신가요? *</label>
              <textarea
                id="description" name="description"
                placeholder={"예) 우리 카페 메뉴판 앱이 필요해요.\n손님이 QR 찍으면 메뉴 보고 주문까지 할 수 있으면 좋겠어요."}
                value={form.description} onChange={handleChange} required
                rows={6}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.75 }}
              />
            </div>
            {status === "error" && (
              <div style={{
                padding: "11px 16px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: 8,
                fontSize: 13,
                color: "#dc2626",
              }}>
                전송 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
              </div>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: status === "sending" ? "#4ade80" : GREEN,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "15px",
                fontSize: 16,
                fontWeight: 800,
                cursor: status === "sending" ? "default" : "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
                transition: "background 0.2s",
              }}
            >
              {status === "sending" ? "전송 중…" : "문의 보내기"}
            </button>
            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", margin: 0 }}>
              입력하신 정보는 문의 확인 목적으로만 사용됩니다.
            </p>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/pium" style={{ fontSize: 13, color: "#1f2937", textDecoration: "none", fontWeight: 600 }}>
            ← 피움앱으로
          </Link>
        </div>
      </div>
    </div>
  );
}
