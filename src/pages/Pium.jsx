import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

/* ── 다크 블록 공용 색상 ── */
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

/* ── 다크 블록 회로 배경 SVG ── */
function CircuitBg({ opacity = 0.07 }) {
  return (
    <svg aria-hidden="true"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity, pointerEvents:"none" }}
      xmlns="http://www.w3.org/2000/svg">
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
   피움 로그인 상태 바
──────────────────────────────────────── */
function PiumAuthBar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/pium");
  }

  const piumRole = profile?.pium_role === "maker" ? "메이커" : "이용자";

  if (!user) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, margin: "0 auto 44px", flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 14, color: "#6b7280" }}>
          메이커로 참여하려면 로그인하세요
        </span>
        <Link to="/login" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#FEE500", color: "#000",
          textDecoration: "none", fontSize: 14, fontWeight: 700,
          padding: "10px 20px", borderRadius: 8,
          fontFamily: "'Noto Sans KR', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="7.5" rx="4.5" ry="4.5" fill="#000"/>
            <path d="M3 15c0-3.314 2.686-5.5 6-5.5s6 2.186 6 5.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          카카오 로그인
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 14, margin: "0 auto 44px", flexWrap: "wrap",
    }}>
      <span style={{
        fontSize: 14, color: "#374151", fontWeight: 600,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        안녕하세요, <strong style={{ color: "#166534" }}>{profile?.nickname ?? "이용자"}</strong>님
        &nbsp;
        <span style={{
          background: profile?.pium_role === "maker"
            ? "linear-gradient(90deg,#16a34a,#7c3aed)" : "#e5e7eb",
          color: profile?.pium_role === "maker" ? "#fff" : "#374151",
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
        }}>{piumRole}</span>
      </span>
      <Link to="/mypage" style={{
        fontSize: 13, color: "#166534", fontWeight: 700,
        textDecoration: "none", padding: "6px 14px",
        border: "1.5px solid #166534", borderRadius: 8,
      }}>마이페이지</Link>
      <button onClick={handleLogout} style={{
        fontSize: 13, color: "#9ca3af", fontWeight: 600,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "'Noto Sans KR', sans-serif", padding: 0,
      }}>로그아웃</button>
    </div>
  );
}

/* ────────────────────────────────────────
   잎사귀 중심에서 뻗는 빛나는 전선 SVG
   — pium-bg.png 위에 absolute 얹기
   — feGaussianBlur glow + 흐르는 파티클
──────────────────────────────────────── */
function GlowWires() {
  /* 로고 중심 = 약 (500, 345) / viewBox 1000×700 */
  const CX = 500, CY = 345;

  /* 미세 전선 경로 — 잎사귀에서 사방으로 */
  const wires = [
    /* 오른쪽 상단 */
    { d:`M${CX},${CY} L590,${CY} L590,255 L700,255 L700,155 L860,155`, c:"#22c55e", len:480, dur:"2.8s", b:"0s"    },
    { d:`M${CX},${CY} L560,${CY} L560,210 L660,210 L660,110`,           c:"#16a34a", len:380, dur:"3.2s", b:"0.6s"  },
    { d:`M${CX},${CY} L650,${CY} L650,290 L870,290`,                    c:"#4ade80", len:370, dur:"2.5s", b:"1.0s"  },
    /* 왼쪽 상단 */
    { d:`M${CX},${CY} L410,${CY} L410,255 L300,255 L300,155 L140,155`,  c:"#a855f7", len:480, dur:"3.0s", b:"0.4s"  },
    { d:`M${CX},${CY} L440,${CY} L440,210 L340,210 L340,110`,           c:"#7c3aed", len:380, dur:"3.4s", b:"1.2s"  },
    { d:`M${CX},${CY} L350,${CY} L350,290 L130,290`,                    c:"#c084fc", len:370, dur:"2.7s", b:"0.8s"  },
    /* 오른쪽 하단 */
    { d:`M${CX},${CY} L600,${CY} L600,435 L740,435 L740,560`,           c:"#22c55e", len:400, dur:"3.1s", b:"0.5s"  },
    { d:`M${CX},${CY} L570,${CY} L570,480 L460,480 L460,600`,           c:"#16a34a", len:380, dur:"2.9s", b:"1.4s"  },
    /* 왼쪽 하단 */
    { d:`M${CX},${CY} L400,${CY} L400,435 L260,435 L260,560`,           c:"#9333ea", len:400, dur:"3.3s", b:"0.2s"  },
    { d:`M${CX},${CY} L430,${CY} L430,480 L540,480 L540,600`,           c:"#7c3aed", len:380, dur:"3.0s", b:"0.9s"  },
    /* 정상/정하 */
    { d:`M${CX},${CY} L${CX},230 L620,230 L620,110 L760,110`,           c:"#4ade80", len:400, dur:"2.6s", b:"0.7s"  },
    { d:`M${CX},${CY} L${CX},460 L380,460 L380,590`,                    c:"#c084fc", len:360, dur:"2.9s", b:"1.1s"  },
  ];

  /* 노드 — 전선 꺾이는 지점 */
  const nodes = [
    {x:590,y:CY,c:"#22c55e"},{x:590,y:255,c:"#22c55e"},{x:700,y:255,c:"#22c55e"},{x:700,y:155,c:"#4ade80"},
    {x:410,y:CY,c:"#a855f7"},{x:410,y:255,c:"#a855f7"},{x:300,y:255,c:"#a855f7"},{x:300,y:155,c:"#c084fc"},
    {x:600,y:435,c:"#22c55e"},{x:740,y:435,c:"#4ade80"},
    {x:400,y:435,c:"#9333ea"},{x:260,y:435,c:"#c084fc"},
    {x:CX,y:230,c:"#4ade80"},{x:620,y:230,c:"#4ade80"},
    {x:CX,y:460,c:"#c084fc"},{x:380,y:460,c:"#c084fc"},
    {x:650,y:CY,c:"#4ade80"},{x:350,y:CY,c:"#c084fc"},
  ];

  return (
    <svg aria-hidden="true"
      viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet"
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:3 }}>
      <defs>
        {/* 초록 glow */}
        <filter id="glow-g" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* 보라 glow */}
        <filter id="glow-p" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* 노드 강한 glow */}
        <filter id="glow-node" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* 중심에서 희미해지는 마스크 */}
        <radialGradient id="gw-fade" cx="50%" cy="49%" r="50%">
          <stop offset="10%"  stopColor="white" stopOpacity="1"/>
          <stop offset="55%"  stopColor="white" stopOpacity="0.8"/>
          <stop offset="85%"  stopColor="white" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        <mask id="gw-mask">
          <rect width="1000" height="700" fill="url(#gw-fade)"/>
        </mask>
      </defs>

      <g mask="url(#gw-mask)">
        {/* ── 기본 전선 (얇고 반투명) ── */}
        {wires.map(({d,c},i)=>(
          <path key={`base-${i}`} d={d} stroke={c} strokeWidth="0.8"
                fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35"/>
        ))}

        {/* ── 흐르는 빛 파티클 ── */}
        {wires.map(({d,c,len,dur,b},i)=>{
          const isGreen = c.startsWith("#2") || c.startsWith("#1") || c.startsWith("#4");
          return (
            <path key={`anim-${i}`} d={d} stroke={c} strokeWidth="2"
                  fill="none" strokeLinecap="round" strokeLinejoin="round"
                  filter={isGreen ? "url(#glow-g)" : "url(#glow-p)"}
                  strokeDasharray={`18 ${len}`} strokeDashoffset={len} opacity="0">
              <animate attributeName="strokeDashoffset"
                       from={len} to={-18} dur={dur} begin={b} repeatCount="indefinite"/>
              <animate attributeName="opacity"
                       values="0;0.9;0.9;0" keyTimes="0;0.05;0.9;1"
                       dur={dur} begin={b} repeatCount="indefinite"/>
            </path>
          );
        })}

        {/* ── 노드 (꺾이는 지점 반짝임) ── */}
        {nodes.map(({x,y,c},i)=>{
          const isGreen = c.startsWith("#2") || c.startsWith("#1") || c.startsWith("#4");
          return (
            <circle key={i} cx={x} cy={y} r="2.2" fill={c}
                    filter="url(#glow-node)" opacity="0">
              <animate attributeName="opacity" values="0;0.9;0"
                       dur={`${1.6+i*0.22}s`} begin={`${(i*0.35)%2.5}s`} repeatCount="indefinite"/>
              <animate attributeName="r" values="1.5;3.5;1.5"
                       dur={`${1.6+i*0.22}s`} begin={`${(i*0.35)%2.5}s`} repeatCount="indefinite"/>
            </circle>
          );
        })}

        {/* ── 중심 로고 위치 펄스 ── */}
        <circle cx={CX} cy={CY} r="18" fill="none" stroke="#22c55e" strokeWidth="1.5"
                filter="url(#glow-g)" opacity="0">
          <animate attributeName="opacity" values="0;0.6;0" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="r" values="14;28;14" dur="2.4s" repeatCount="indefinite"/>
        </circle>
        <circle cx={CX} cy={CY} r="24" fill="none" stroke="#a855f7" strokeWidth="1"
                filter="url(#glow-p)" opacity="0">
          <animate attributeName="opacity" values="0;0.4;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
          <animate attributeName="r" values="18;36;18" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════
   블록 1 — 히어로
   pium-bg.png 배경 + pium-logo.png 오버레이
   + 잎사귀 중심 glow 전선
════════════════════════════════════════ */
function Hero() {
  return (
    <section style={{
      background: "#e8f5ef",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>

      {/* 배경 + 로고 + 빛 전선 */}
      <div style={{ position:"relative", width:"100%", lineHeight:0 }}>
        {/* 배경: pium-bg.png */}
        <img
          src="/pium-bg.png"
          alt=""
          aria-hidden="true"
          style={{ display:"block", width:"100%", height:"auto", objectFit:"contain" }}
        />

        {/* 빛나는 전선 SVG */}
        <GlowWires />
      </div>

      {/* ③ 텍스트 블록 — 이미지 바로 아래, 겹침 없음 */}
      <div style={{
        background: "linear-gradient(180deg, #f0fdf9 0%, #faf5ff 100%)",
        padding: "52px 24px 72px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "clamp(22px, 5vw, 42px)",
          fontWeight: 900,
          color: "#0f2845",
          lineHeight: 1.55,
          margin: "0 0 22px",
          letterSpacing: "-0.5px",
        }}>
          몸으로 배운 마지막 세대,<br/>
          AI를 손에 쥔 첫 세대.<br/>
          <span style={{
            background: "linear-gradient(90deg, #16a34a, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>그 사이에 우리가 서 있습니다.</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2.5vw, 20px)",
          color: "#374151",
          lineHeight: 1.8,
          margin: "0 auto 20px",
          maxWidth: 540,
        }}>
          평생의 경험을 기술로 남길 시간은,<br/>
          <strong style={{ color:"#0f2845" }}>지금밖에 없습니다.</strong>
        </p>

        <p style={{
          fontSize: "clamp(12px, 2vw, 14px)",
          color: "#6b7280",
          lineHeight: 1.9,
          margin: "0 auto 32px",
          maxWidth: 460,
        }}>
          코딩 한 줄 못 하던 27년 차 두피전문가가<br/>
          3주 만에 신문 한 채를 지었습니다.<br/>
          이제, 당신 차례입니다.
        </p>

        {/* 로그인 상태 표시 */}
        <PiumAuthBar />

        {/* 스크롤 유도 */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          animation: "pium-bounce 1.8s infinite",
        }}>
          <span style={{ fontSize:10, color:"#9ca3af", letterSpacing:2 }}>SCROLL</span>
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M2 2l8 8 8-8" stroke="#16a34a" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes pium-bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(7px); }
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
        <div style={{
          fontSize:"clamp(22px,4vw,38px)", fontWeight:900, color:TEXT_HI,
          lineHeight:1.4, marginBottom:40, paddingLeft:20,
          borderLeft:`4px solid ${PLUM_LT}`,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          "AI가 읽지 못하는<br/>신문이 있었습니다."
        </div>
        <div style={{
          fontSize:"clamp(15px,2.2vw,18px)", color:TEXT_MID,
          lineHeight:2, fontFamily:"'Noto Sans KR',sans-serif",
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
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", fontWeight:900,
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
      position:"relative", background:NAVY,
      padding:"100px 24px", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:"50%", right:"10%", transform:"translateY(-50%)",
        width:400, height:400,
        background:`radial-gradient(circle,${GREEN}1a 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <div ref={ref} style={{
        maxWidth:680, margin:"0 auto",
        opacity:0, transform:"translateY(32px)",
        transition:"opacity 0.8s ease,transform 0.8s ease",
      }}>
        <div style={{
          fontSize:"clamp(22px,4vw,38px)", fontWeight:900, color:TEXT_HI,
          lineHeight:1.4, marginBottom:40, paddingLeft:20,
          borderLeft:`4px solid ${GREEN_LT}`,
          fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          "빌릴 수 없는 것이<br/>있습니다."
        </div>
        <div style={{
          fontSize:"clamp(15px,2.2vw,18px)", color:TEXT_MID,
          lineHeight:2, fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          <p style={{margin:"0 0 20px"}}>기술은 AI가 거듭니다.</p>
          <p style={{margin:"0 0 20px"}}>
            하지만 27년의 경험과 마음은<br/>
            그 누구도, 그 어떤 AI도 따라올 수 없습니다.
          </p>
          <p style={{margin:0}}>
            당신이 매일 쌓아온 현장의 전문성 —<br/>
            <span style={{color:GREEN_LT, fontWeight:800}}>
              그것이 누구도 흉내 낼 수 없는,<br/>당신만의 재료입니다.
            </span>
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
  const items  = [
    "당신의 경험으로 만든 앱을 올리고",
    "같은 고민을 가진 사람과 잇고",
    "필요한 앱은 직접 의뢰하세요",
  ];
  return (
    <section style={{
      position:"relative",
      background:`linear-gradient(180deg,${NAVY} 0%,${DARK_BG} 100%)`,
      padding:"100px 24px", overflow:"hidden",
    }}>
      <CircuitBg opacity={0.05}/>
      <div style={{
        position:"absolute", bottom:"10%", left:"5%",
        width:300, height:300,
        background:`radial-gradient(circle,${PLUM}18 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <div style={{maxWidth:680, margin:"0 auto"}}>
        <div ref={ref} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease", marginBottom:48,
        }}>
          <p style={{
            fontSize:"clamp(18px,3vw,28px)", fontWeight:900, color:TEXT_HI,
            lineHeight:1.6, margin:"0 0 16px", fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            plum은,{" "}
            <span style={{
              background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>그 경험이 '웹앱'이 되는 곳</span>
            입니다.
          </p>
          <p style={{
            fontSize:"clamp(14px,2vw,17px)", color:TEXT_MID,
            lineHeight:1.8, margin:0, fontFamily:"'Noto Sans KR',sans-serif",
          }}>
            설치도, 복잡한 과정도 없이 — 링크 하나로 바로 쓰는 앱.
          </p>
        </div>
        <div ref={refL} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease",
          marginBottom:48, display:"flex", flexDirection:"column", gap:16,
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
                fontSize:"clamp(14px,2vw,17px)", color:TEXT_HI,
                fontFamily:"'Noto Sans KR',sans-serif", lineHeight:1.5,
              }}>{text}</span>
            </div>
          ))}
        </div>
        <div ref={refBtn} style={{
          opacity:0, transform:"translateY(32px)",
          transition:"opacity 0.8s ease,transform 0.8s ease",
          display:"flex", gap:12, flexWrap:"wrap",
        }}>
          <Link to="/pium" style={{
            flex:"1 1 200px", display:"block", textAlign:"center",
            background:`linear-gradient(135deg,${GREEN},#15803d)`,
            color:"#fff", textDecoration:"none",
            fontSize:15, fontWeight:800, padding:"14px 20px", borderRadius:6,
            fontFamily:"'Noto Sans KR',sans-serif",
            boxShadow:`0 4px 24px ${GREEN}44`,
          }}>웹앱스토어 구경하기 →</Link>
          <Link to="/pium-request" style={{
            flex:"1 1 200px", display:"block", textAlign:"center",
            background:"transparent", color:GREEN_LT,
            textDecoration:"none", fontSize:15, fontWeight:800,
            padding:"14px 20px", borderRadius:6,
            border:`1.5px solid ${GREEN_LT}`,
            fontFamily:"'Noto Sans KR',sans-serif",
          }}>이런 앱이 필요하세요? →</Link>
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
      position:"relative", background:DARK_BG,
      padding:"100px 24px 80px", textAlign:"center", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:700, height:400,
        background:`radial-gradient(ellipse,${PLUM}1a 0%,transparent 65%)`,
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:400, height:200,
        background:`radial-gradient(ellipse,${GREEN}18 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <CircuitBg opacity={0.05}/>
      <div ref={ref} style={{
        maxWidth:600, margin:"0 auto",
        opacity:0, transform:"translateY(32px)",
        transition:"opacity 0.8s ease,transform 0.8s ease", position:"relative",
      }}>
        <p style={{
          fontSize:"clamp(20px,4vw,36px)", fontWeight:900, color:TEXT_HI,
          lineHeight:1.6, margin:"0 0 16px", fontFamily:"'Noto Sans KR',sans-serif",
        }}>
          곧, 첫 번째 앱들이 피어납니다.
        </p>
        <p style={{
          fontSize:"clamp(18px,3.5vw,30px)", fontWeight:900,
          lineHeight:1.6, margin:"0 0 48px", fontFamily:"'Noto Sans KR',sans-serif",
          background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          당신이 plum의 1호 메이커가 되어주세요. 🌱
        </p>
        <Link to="/subscribe" style={{
          display:"inline-block",
          background:`linear-gradient(135deg,${PLUM},#6d28d9)`,
          color:"#fff", textDecoration:"none",
          fontSize:16, fontWeight:800, padding:"16px 40px", borderRadius:8,
          fontFamily:"'Noto Sans KR',sans-serif",
          boxShadow:`0 4px 32px ${PLUM}55`, marginBottom:56,
        }}>오픈 소식 받기 →</Link>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:32 }}>
          <p style={{
            fontSize:13, color:TEXT_LOW, lineHeight:1.9,
            margin:0, fontFamily:"'Noto Sans KR',sans-serif",
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
    <div style={{ fontFamily:"'Noto Sans KR',sans-serif" }}>
      <Hero />
      <WhyBlock />
      <InsightBlock />
      <WhatBlock />
      <ClosingBlock />
    </div>
  );
}
