import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ── 색상 ── */
const DARK_BG  = "#0b1929";
const NAVY     = "#1e3a5f";
const GREEN    = "#166534";
const GREEN_LT = "#4ade80";
const PLUM     = "#7c3aed";
const PLUM_LT  = "#c084fc";
const TEXT_HI  = "#f0f9ff";
const TEXT_MID = "#94a3b8";
const TEXT_LOW = "#64748b";

/* ── fade-in 훅 ── */
function useFadeIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          ob.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [delay]);
  return ref;
}

/* ── 회로 배경 SVG ── */
function CircuitBg({ opacity = 0.07 }) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        opacity, pointerEvents: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="10%" y1="20%" x2="40%" y2="20%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="40%" y1="20%" x2="40%" y2="45%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="40%" y1="45%" x2="70%" y2="45%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="70%" y1="45%" x2="70%" y2="70%" stroke="#c084fc" strokeWidth="1"/>
      <line x1="70%" y1="70%" x2="90%" y2="70%" stroke="#c084fc" strokeWidth="1"/>
      <line x1="60%" y1="15%" x2="60%" y2="45%" stroke="#c084fc" strokeWidth="1"/>
      <line x1="20%" y1="60%" x2="40%" y2="60%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="20%" y1="45%" x2="20%" y2="75%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="5%"  y1="80%" x2="30%" y2="80%" stroke="#c084fc" strokeWidth="1"/>
      <line x1="80%" y1="25%" x2="95%" y2="25%" stroke="#4ade80" strokeWidth="1"/>
      <line x1="80%" y1="10%" x2="80%" y2="45%" stroke="#4ade80" strokeWidth="1"/>
      {[[40,20],[70,45],[20,60],[80,25],[60,45],[40,60],[70,70],[20,75],[80,10]].map(([cx,cy],i)=>(
        <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="3"
          fill={i%2===0 ? "#4ade80" : "#c084fc"} />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────
   히어로 배경 — 중앙에서 바깥으로 뻗는 회로
──────────────────────────────────────── */
function HeroBg() {
  /* 중심: SVG 좌표계 500,340 (viewBox 1000x680) */
  const CX = 500, CY = 340;

  /* 정적 회로 라인 (가늘고 섬세하게) */
  const staticPaths = [
    /* 우상단 */
    `M${CX},${CY} L560,${CY} L560,270 L660,270 L660,170 L800,170`,
    `M560,270 L640,270 L640,200 L760,200 L760,130`,
    `M660,170 L700,170 L700,100 L860,100`,
    /* 좌상단 */
    `M${CX},${CY} L430,${CY} L430,250 L310,250 L310,140 L170,140`,
    `M430,250 L360,250 L360,170 L230,170 L230,80`,
    `M310,140 L280,140 L280,60 L150,60`,
    /* 우하단 */
    `M${CX},${CY} L590,${CY} L590,420 L700,420 L700,540`,
    `M590,420 L660,420 L660,490 L800,490 L800,580`,
    `M700,420 L740,420 L740,520 L900,520`,
    /* 좌하단 */
    `M${CX},${CY} L400,${CY} L400,430 L280,430 L280,560`,
    `M400,430 L330,430 L330,510 L190,510`,
    `M280,430 L260,430 L260,560 L100,560`,
    /* 우 */
    `M${CX},${CY} L620,${CY} L620,290 L820,290`,
    `M620,290 L760,290 L760,240 L920,240`,
    /* 좌 */
    `M${CX},${CY} L370,${CY} L370,310 L200,310`,
    `M370,310 L300,310 L300,380 L120,380`,
  ];

  /* 빛 흐르는 라인 (stroke-dashoffset 애니메이션) */
  const animPaths = [
    { d:`M${CX},${CY} L560,${CY} L560,270 L660,270 L660,170 L800,170`, c:"#16a34a", len:370, dur:"3s",   b:"0s"   },
    { d:`M${CX},${CY} L430,${CY} L430,250 L310,250 L310,140 L170,140`, c:"#7c3aed", len:390, dur:"3.5s", b:"0.6s" },
    { d:`M${CX},${CY} L590,${CY} L590,420 L700,420 L700,540`,          c:"#16a34a", len:320, dur:"2.8s", b:"1.2s" },
    { d:`M${CX},${CY} L400,${CY} L400,430 L280,430 L280,560`,          c:"#7c3aed", len:340, dur:"3.2s", b:"0.4s" },
    { d:`M560,270 L640,270 L640,200 L760,200 L760,130`,                 c:"#16a34a", len:260, dur:"2.4s", b:"0.8s" },
    { d:`M430,250 L360,250 L360,170 L230,170 L230,80`,                  c:"#9333ea", len:260, dur:"2.6s", b:"1.5s" },
    { d:`M${CX},${CY} L620,${CY} L620,290 L820,290`,                    c:"#16a34a", len:320, dur:"2.9s", b:"0.2s" },
    { d:`M${CX},${CY} L370,${CY} L370,310 L200,310`,                    c:"#7c3aed", len:300, dur:"3.1s", b:"1.0s" },
  ];

  /* 노드 (교차점 반짝임) */
  const nodes = [
    { x:560, y:CY,  c:"#16a34a", d:"2.2s", b:"0s"   },
    { x:560, y:270, c:"#16a34a", d:"2.5s", b:"0.3s" },
    { x:660, y:270, c:"#16a34a", d:"1.9s", b:"0.7s" },
    { x:660, y:170, c:"#16a34a", d:"2.7s", b:"1.1s" },
    { x:430, y:CY,  c:"#7c3aed", d:"2.3s", b:"0.4s" },
    { x:430, y:250, c:"#7c3aed", d:"2.1s", b:"0.8s" },
    { x:310, y:250, c:"#7c3aed", d:"2.6s", b:"0.2s" },
    { x:310, y:140, c:"#7c3aed", d:"1.8s", b:"1.3s" },
    { x:590, y:420, c:"#16a34a", d:"2.4s", b:"0.5s" },
    { x:700, y:420, c:"#16a34a", d:"2.0s", b:"0.9s" },
    { x:400, y:430, c:"#9333ea", d:"2.2s", b:"1.2s" },
    { x:280, y:430, c:"#9333ea", d:"2.8s", b:"0.6s" },
    { x:620, y:CY,  c:"#16a34a", d:"2.1s", b:"0.3s" },
    { x:370, y:CY,  c:"#7c3aed", d:"2.5s", b:"0.7s" },
    { x:640, y:270, c:"#16a34a", d:"1.7s", b:"1.0s" },
    { x:360, y:250, c:"#9333ea", d:"2.3s", b:"0.1s" },
  ];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 680"
      preserveAspectRatio="xMidYMid slice"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 배경 그라데이션 */}
        <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#e8fdf5"/>
          <stop offset="35%"  stopColor="#f0fdf9"/>
          <stop offset="65%"  stopColor="#faf5ff"/>
          <stop offset="100%" stopColor="#ede9fe"/>
        </linearGradient>

        {/* 중심→가장자리 페이드 마스크 */}
        <radialGradient id="circuit-fade" cx="50%" cy="50%" r="50%">
          <stop offset="10%"  stopColor="white" stopOpacity="1"/>
          <stop offset="75%"  stopColor="white" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="fade-out">
          <rect width="1000" height="680" fill="url(#circuit-fade)"/>
        </mask>
      </defs>

      {/* ① 배경 */}
      <rect width="1000" height="680" fill="url(#hero-bg)"/>

      {/* ② 정적 회로 (fade mask 적용) */}
      <g mask="url(#fade-out)" stroke="#a7f3d0" strokeWidth="0.7" fill="none" opacity="0.7">
        {staticPaths.map((d,i)=>(
          <path key={i} d={d} strokeLinecap="round" strokeLinejoin="round"/>
        ))}
      </g>

      {/* ③ 빛 흐르는 라인 */}
      <g mask="url(#fade-out)">
        {animPaths.map(({d,c,len,dur,b},i)=>(
          <path key={i} d={d} stroke={c} strokeWidth="1.2" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={`28 ${len}`} strokeDashoffset={len}>
            <animate attributeName="strokeDashoffset"
                     from={len} to={-28}
                     dur={dur} begin={b} repeatCount="indefinite"/>
          </path>
        ))}
      </g>

      {/* ④ 노드 */}
      {nodes.map(({x,y,c,d,b},i)=>(
        <circle key={i} cx={x} cy={y} r="2.5" fill={c} opacity="0">
          <animate attributeName="opacity" values="0;0.8;0" dur={d} begin={b} repeatCount="indefinite"/>
          <animate attributeName="r"       values="1.5;3;1.5" dur={d} begin={b} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────
   plum SVG 로고 (애니메이션, 밝은 배경용)
──────────────────────────────────────── */
function PlumLogoSVG() {
  return (
    <svg
      viewBox="0 0 440 280"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width:"min(380px,86vw)", height:"auto", overflow:"visible" }}
      aria-label="plum — 경험이 AI를 입다"
    >
      <defs>
        <filter id="fg2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fp2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="fl2" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* 줄기 */}
      <path d="M 185 185 L 185 118" stroke="#166534" strokeWidth="3.5" strokeLinecap="round"/>

      {/* 잎 1 (좌측) */}
      <path d="M 185 118 C 165 105 138 92 140 68 C 142 48 168 46 183 62 Q 190 88 185 118 Z"
            fill="#15803d" filter="url(#fl2)">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M 185 118 L 158 80" stroke="#166534" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* 잎 2 (우측, 메인) */}
      <path d="M 185 100 C 200 88 228 75 238 52 C 246 33 228 20 210 34 Q 196 58 185 100 Z"
            fill="#166534" filter="url(#fl2)">
        <animate attributeName="opacity" values="0.85;1;0.85" dur="2.5s" begin="0.4s" repeatCount="indefinite"/>
      </path>
      <path d="M 185 100 L 220 55" stroke="#166534" strokeWidth="1" fill="none" opacity="0.4"/>

      {/* 잎 3 (소) */}
      <path d="M 185 140 C 170 132 158 118 165 105 C 170 95 184 100 185 115 Z"
            fill="#14532d">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" begin="1s" repeatCount="indefinite"/>
      </path>

      {/* 회로 라인 1 */}
      <path d="M 235 50 L 262 50 L 262 28 L 305 28"
            stroke="#16a34a" strokeWidth="1.4" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="28 100" strokeDashoffset="100">
        <animate attributeName="strokeDashoffset" from="100" to="-28" dur="2s" repeatCount="indefinite"/>
      </path>

      {/* 회로 라인 2 */}
      <path d="M 262 28 L 310 28 L 310 48 L 370 48"
            stroke="#9333ea" strokeWidth="1.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="28 120" strokeDashoffset="120">
        <animate attributeName="strokeDashoffset" from="120" to="-28" dur="2.4s" begin="0.4s" repeatCount="indefinite"/>
      </path>

      {/* 회로 라인 3 */}
      <path d="M 262 50 L 300 72 L 345 72"
            stroke="#16a34a" strokeWidth="1.2" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="28 110" strokeDashoffset="110">
        <animate attributeName="strokeDashoffset" from="110" to="-28" dur="2.2s" begin="0.7s" repeatCount="indefinite"/>
      </path>

      {/* 회로 라인 4 */}
      <path d="M 310 48 L 345 48 L 345 30 L 390 30"
            stroke="#9333ea" strokeWidth="1" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="28 100" strokeDashoffset="100">
        <animate attributeName="strokeDashoffset" from="100" to="-28" dur="1.9s" begin="1.1s" repeatCount="indefinite"/>
      </path>

      {/* 노드 */}
      {[
        { cx:262, cy:50,  c:"#16a34a", d:"2s",   b:"0s"   },
        { cx:305, cy:28,  c:"#16a34a", d:"1.8s", b:"0.3s" },
        { cx:310, cy:48,  c:"#9333ea", d:"2.4s", b:"0.6s" },
        { cx:370, cy:48,  c:"#9333ea", d:"2.0s", b:"0.9s" },
        { cx:300, cy:72,  c:"#16a34a", d:"2.2s", b:"0.4s" },
        { cx:345, cy:72,  c:"#16a34a", d:"1.9s", b:"1.2s" },
        { cx:390, cy:30,  c:"#9333ea", d:"1.7s", b:"0.8s" },
      ].map(({cx,cy,c,d,b},i)=>(
        <g key={i}>
          <circle cx={cx} cy={cy} r="4" fill={c} opacity="0.15"/>
          <circle cx={cx} cy={cy} r="2.2" fill={c}>
            <animate attributeName="opacity" values="0.2;1;0.2" dur={d} begin={b} repeatCount="indefinite"/>
            <animate attributeName="r" values="1.8;3.2;1.8"    dur={d} begin={b} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}

      {/* 보라 반짝임 */}
      {[
        { cx:380, cy:18, d:"1.4s", b:"0s"   },
        { cx:400, cy:42, d:"1.8s", b:"0.5s" },
        { cx:365, cy:58, d:"2.1s", b:"0.9s" },
        { cx:415, cy:28, d:"1.6s", b:"0.3s" },
      ].map(({cx,cy,d,b},i)=>(
        <circle key={i} cx={cx} cy={cy} r="2" fill="#9333ea">
          <animate attributeName="opacity" values="0;0.7;0" dur={d} begin={b} repeatCount="indefinite"/>
        </circle>
      ))}

      {/* "p" 보라 */}
      <text x="108" y="235"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="95" fontWeight="900"
            fill="#6d28d9" textAnchor="middle">
        p
        <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/>
      </text>

      {/* "lum" 초록 */}
      <text x="285" y="235"
            fontFamily="Georgia,'Times New Roman',serif"
            fontSize="95" fontWeight="900"
            fill="#14532d" textAnchor="middle">
        lum
      </text>

      {/* 서브타이틀 */}
      <text x="220" y="268"
            fontFamily="'Noto Sans KR',sans-serif"
            fontSize="13" fontWeight="700" letterSpacing="1.5"
            fill="#6b7280" textAnchor="middle">
        경험이 AI를 입다
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────
   블록 1 — 풀스크린 히어로 (밝은 사이버틱 가든)
──────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      position: "relative",
      minHeight: "100svh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px 80px",
      textAlign: "center",
      overflow: "hidden",
    }}>
      {/* ★ 밝은 회로 배경 */}
      <HeroBg />

      {/* ★ SVG 로고 */}
      <div style={{ marginBottom:44, position:"relative", zIndex:1 }}>
        <PlumLogoSVG />
      </div>

      {/* 메인 카피 — 진남색 */}
      <h1 style={{
        fontSize:"clamp(22px,5vw,42px)",
        fontWeight:900,
        color:"#0f2845",
        lineHeight:1.55,
        margin:"0 0 24px",
        fontFamily:"'Noto Sans KR',sans-serif",
        letterSpacing:"-0.5px",
        position:"relative", zIndex:1,
      }}>
        몸으로 배운 마지막 세대,<br/>
        AI를 손에 쥔 첫 세대.<br/>
        <span style={{
          background:"linear-gradient(90deg,#16a34a,#7c3aed)",
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
        }}>그 사이에 우리가 서 있습니다.</span>
      </h1>

      {/* 서브 카피 */}
      <p style={{
        fontSize:"clamp(15px,2.5vw,20px)",
        color:"#374151",
        lineHeight:1.8,
        margin:"0 0 28px",
        maxWidth:540,
        position:"relative", zIndex:1,
      }}>
        평생의 경험을 기술로 남길 시간은,<br/>
        <strong style={{color:"#0f2845"}}>지금밖에 없습니다.</strong>
      </p>

      {/* 소개 문구 */}
      <p style={{
        fontSize:"clamp(12px,2vw,14px)",
        color:"#6b7280",
        lineHeight:1.9,
        maxWidth:480,
        margin:"0 0 64px",
        position:"relative", zIndex:1,
      }}>
        코딩 한 줄 못 하던 27년 차 두피전문가가<br/>
        3주 만에 신문 한 채를 지었습니다.<br/>
        이제, 당신 차례입니다.
      </p>

      {/* 스크롤 화살표 */}
      <div style={{
        position:"absolute", bottom:32, left:"50%",
        transform:"translateX(-50%)",
        display:"flex", flexDirection:"column", alignItems:"center", gap:4,
        animation:"pium-bounce 1.8s infinite",
        zIndex:1,
      }}>
        <span style={{fontSize:10, color:"#9ca3af", letterSpacing:2}}>SCROLL</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path d="M2 2l8 8 8-8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes pium-bounce {
          0%,100%{transform:translateX(-50%) translateY(0)}
          50%{transform:translateX(-50%) translateY(8px)}
        }
      `}</style>
    </section>
  );
}

/* ────────────────────────────────────────
   블록 2 — 왜
──────────────────────────────────────── */
function WhyBlock() {
  const ref = useFadeIn(0);
  return (
    <section style={{
      position:"relative",
      background:`linear-gradient(180deg,${DARK_BG} 0%,${NAVY} 100%)`,
      padding:"100px 24px",
      overflow:"hidden",
    }}>
      <CircuitBg opacity={0.04}/>
      <div ref={ref} style={{
        maxWidth:680, margin:"0 auto",
        opacity:0, transform:"translateY(32px)",
        transition:"opacity 0.8s ease,transform 0.8s ease",
      }}>
        {/* 큰 인용구 */}
        <div style={{
          fontSize:"clamp(22px,4vw,38px)",
          fontWeight:900,
          color:TEXT_HI,
          lineHeight:1.4,
          marginBottom:40,
          paddingLeft:20,
          borderLeft:`4px solid ${PLUM_LT}`,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          "AI가 읽지 못하는<br/>신문이 있었습니다."
        </div>

        {/* 본문 */}
        <div style={{
          fontSize:"clamp(15px,2.2vw,18px)",
          color:TEXT_MID,
          lineHeight:2,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          <p style={{margin:"0 0 20px"}}>
            사람들은 이제 검색창이 아니라 AI에게 묻습니다.<br/>
            그런데 정작 제 기사는, AI가 가져가지 못했습니다.
          </p>
          <p style={{margin:"0 0 20px"}}>
            저를 믿고 가게 이야기를 맡겨주신 분들의 글이<br/>
            세상이 가장 많이 찾는 곳에 닿지 못한 거예요.
          </p>
          <p style={{margin:"0 0 20px", color:TEXT_HI, fontWeight:700}}>
            미안해서 잠이 오지 않았습니다.
          </p>
          <p style={{margin:0}}>
            그래서 —{" "}
            <span style={{
              background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              fontWeight:900,
            }}>직접 짓기로 했습니다.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────
   블록 3 — 깨달음
──────────────────────────────────────── */
function InsightBlock() {
  const ref = useFadeIn(0);
  return (
    <section style={{
      position:"relative",
      background:NAVY,
      padding:"100px 24px",
      overflow:"hidden",
    }}>
      {/* 초록 글로우 */}
      <div style={{
        position:"absolute", top:"50%", right:"10%",
        transform:"translateY(-50%)",
        width:400, height:400,
        background:`radial-gradient(circle,${GREEN}1a 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      <div ref={ref} style={{
        maxWidth:680, margin:"0 auto",
        opacity:0, transform:"translateY(32px)",
        transition:"opacity 0.8s ease,transform 0.8s ease",
      }}>
        {/* 큰 인용구 */}
        <div style={{
          fontSize:"clamp(22px,4vw,38px)",
          fontWeight:900,
          color:TEXT_HI,
          lineHeight:1.4,
          marginBottom:40,
          paddingLeft:20,
          borderLeft:`4px solid ${GREEN_LT}`,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          "빌릴 수 없는 것이<br/>있습니다."
        </div>

        {/* 본문 */}
        <div style={{
          fontSize:"clamp(15px,2.2vw,18px)",
          color:TEXT_MID,
          lineHeight:2,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          <p style={{margin:"0 0 20px"}}>
            기술은 AI가 거듭니다.
          </p>
          <p style={{margin:"0 0 20px"}}>
            하지만 27년의 경험과 마음은<br/>
            그 누구도, 그 어떤 AI도 따라올 수 없습니다.
          </p>
          <p style={{margin:0}}>
            당신이 매일 쌓아온 현장의 전문성 —<br/>
            <span style={{
              color:GREEN_LT,
              fontWeight:800,
            }}>그것이 누구도 흉내 낼 수 없는,<br/>당신만의 재료입니다.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────
   블록 4 — plum이 하는 일
──────────────────────────────────────── */
function WhatBlock() {
  const ref    = useFadeIn(0);
  const refL   = useFadeIn(150);
  const refBtn = useFadeIn(300);

  const items = [
    "당신의 경험으로 만든 앱을 올리고",
    "같은 고민을 가진 사람과 잇고",
    "필요한 앱은 직접 의뢰하세요",
  ];

  return (
    <section style={{
      position:"relative",
      background:`linear-gradient(180deg,${NAVY} 0%,${DARK_BG} 100%)`,
      padding:"100px 24px",
      overflow:"hidden",
    }}>
      <CircuitBg opacity={0.05}/>
      <div style={{
        position:"absolute", bottom:"10%", left:"5%",
        width:300, height:300,
        background:`radial-gradient(circle,${PLUM}18 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      <div style={{maxWidth:680, margin:"0 auto"}}>
        {/* 소개 문구 */}
        <div ref={ref} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease",
          marginBottom:48,
        }}>
          <p style={{
            fontSize:"clamp(18px,3vw,28px)",
            fontWeight:900,
            color:TEXT_HI,
            lineHeight:1.6,
            margin:"0 0 16px",
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            plum은,{" "}
            <span style={{
              background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
            }}>그 경험이 '웹앱'이 되는 곳</span>
            입니다.
          </p>
          <p style={{
            fontSize:"clamp(14px,2vw,17px)",
            color:TEXT_MID,
            lineHeight:1.8,
            margin:0,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            설치도, 복잡한 과정도 없이 — 링크 하나로 바로 쓰는 앱.
          </p>
        </div>

        {/* 리스트 */}
        <div ref={refL} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease",
          marginBottom:48,
          display:"flex", flexDirection:"column", gap:16,
        }}>
          {items.map((text,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:16,
              padding:"16px 20px",
              background:"rgba(255,255,255,0.04)",
              border:`1px solid rgba(74,222,128,0.15)`,
              borderRadius:8,
            }}>
              <span style={{fontSize:22, flexShrink:0}}>🌱</span>
              <span style={{
                fontSize:"clamp(14px,2vw,17px)",
                color:TEXT_HI,
                fontFamily:"'Noto Sans KR',sans-serif",
                lineHeight:1.5,
              }}>{text}</span>
            </div>
          ))}
        </div>

        {/* 버튼 2개 */}
        <div ref={refBtn} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease",
          display:"flex", gap:12, flexWrap:"wrap",
        }}>
          <Link to="/pium" style={{
            flex:"1 1 200px",
            display:"block", textAlign:"center",
            background:`linear-gradient(135deg,${GREEN},#15803d)`,
            color:"#fff",
            textDecoration:"none",
            fontSize:15, fontWeight:800,
            padding:"14px 20px",
            borderRadius:6,
            fontFamily:"'Noto Sans KR',sans-serif",
            boxShadow:`0 4px 24px ${GREEN}44`,
          }}>
            웹앱스토어 구경하기 →
          </Link>
          <Link to="/pium-request" style={{
            flex:"1 1 200px",
            display:"block", textAlign:"center",
            background:"transparent",
            color:GREEN_LT,
            textDecoration:"none",
            fontSize:15, fontWeight:800,
            padding:"14px 20px",
            borderRadius:6,
            border:`1.5px solid ${GREEN_LT}`,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            이런 앱이 필요하세요? →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────
   블록 5 — 마지막 CTA
──────────────────────────────────────── */
function ClosingBlock() {
  const ref = useFadeIn(0);
  return (
    <section style={{
      position:"relative",
      background:DARK_BG,
      padding:"100px 24px 80px",
      textAlign:"center",
      overflow:"hidden",
    }}>
      {/* 보라+초록 글로우 */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:700, height:400,
        background:`radial-gradient(ellipse,${PLUM}1a 0%,transparent 65%)`,
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", bottom:0, left:"50%",
        transform:"translateX(-50%)",
        width:400, height:200,
        background:`radial-gradient(ellipse,${GREEN}18 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <CircuitBg opacity={0.05}/>

      <div ref={ref} style={{
        maxWidth:600, margin:"0 auto",
        opacity:0, transform:"translateY(32px)",
        transition:"opacity 0.8s ease,transform 0.8s ease",
        position:"relative",
      }}>
        {/* 메인 문구 */}
        <p style={{
          fontSize:"clamp(20px,4vw,36px)",
          fontWeight:900,
          color:TEXT_HI,
          lineHeight:1.6,
          margin:"0 0 16px",
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          곧, 첫 번째 앱들이 피어납니다.
        </p>
        <p style={{
          fontSize:"clamp(18px,3.5vw,30px)",
          fontWeight:900,
          lineHeight:1.6,
          margin:"0 0 48px",
          fontFamily:"'Noto Sans KR',sans-serif",
          background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
        }}>
          당신이 plum의 1호 메이커가 되어주세요. 🌱
        </p>

        {/* 구독 버튼 */}
        <Link to="/subscribe" style={{
          display:"inline-block",
          background:`linear-gradient(135deg,${PLUM},#6d28d9)`,
          color:"#fff",
          textDecoration:"none",
          fontSize:16, fontWeight:800,
          padding:"16px 40px",
          borderRadius:8,
          fontFamily:"'Noto Sans KR',sans-serif",
          boxShadow:`0 4px 32px ${PLUM}55`,
          marginBottom:56,
        }}>
          오픈 소식 받기 →
        </Link>

        {/* 하단 서명 */}
        <div style={{
          borderTop:"1px solid rgba(255,255,255,0.08)",
          paddingTop:32,
        }}>
          <p style={{
            fontSize:13,
            color:TEXT_LOW,
            lineHeight:1.9,
            margin:0,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            당신의 성공이 우리의 뉴스입니다.<br/>
            <span style={{color:TEXT_MID}}>— 세상과 당신을 잇는, 이음미디어</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   메인 컴포넌트
════════════════════════════════════════ */
export default function Pium() {
  return (
    <div style={{ background:DARK_BG, fontFamily:"'Noto Sans KR',sans-serif" }}>
      <Hero />
      <WhyBlock />
      <InsightBlock />
      <WhatBlock />
      <ClosingBlock />
    </div>
  );
}
