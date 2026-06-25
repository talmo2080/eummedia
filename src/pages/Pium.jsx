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
   블록 1 — 풀스크린 히어로
──────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      position: "relative",
      minHeight: "100svh",
      background: DARK_BG,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px 80px",
      textAlign: "center",
      overflow: "hidden",
    }}>
      <CircuitBg />

      {/* 글로우 */}
      <div style={{
        position:"absolute", top:"30%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:600, height:600,
        background:`radial-gradient(circle,${PLUM}22 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", bottom:"20%", left:"20%",
        width:300, height:300,
        background:`radial-gradient(circle,${GREEN}22 0%,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      {/* plum 로고 */}
      <div style={{
        marginBottom:40,
        filter:"drop-shadow(0 0 24px #4ade8066) drop-shadow(0 0 48px #c084fc44)",
        position:"relative",
      }}>
        <img src="/pium-banner.png" alt="plum"
          style={{ width:"min(320px,80vw)", height:"auto", objectFit:"contain", display:"block" }}/>
      </div>

      {/* 메인 카피 */}
      <h1 style={{
        fontSize:"clamp(22px,5vw,42px)",
        fontWeight:900,
        color:TEXT_HI,
        lineHeight:1.5,
        margin:"0 0 24px",
        fontFamily:"'Noto Sans KR',sans-serif",
        letterSpacing:"-0.5px",
        position:"relative",
      }}>
        몸으로 배운 마지막 세대,<br/>
        AI를 손에 쥔 첫 세대.<br/>
        <span style={{
          background:`linear-gradient(90deg,${GREEN_LT},${PLUM_LT})`,
          WebkitBackgroundClip:"text",
          WebkitTextFillColor:"transparent",
        }}>그 사이에 우리가 서 있습니다.</span>
      </h1>

      {/* 서브 카피 */}
      <p style={{
        fontSize:"clamp(15px,2.5vw,20px)",
        color:TEXT_MID,
        lineHeight:1.8,
        margin:"0 0 28px",
        maxWidth:540,
        position:"relative",
      }}>
        평생의 경험을 기술로 남길 시간은,<br/>
        <strong style={{color:TEXT_HI}}>지금밖에 없습니다.</strong>
      </p>

      {/* 소개 문구 */}
      <p style={{
        fontSize:"clamp(12px,2vw,14px)",
        color:TEXT_LOW,
        lineHeight:1.9,
        maxWidth:480,
        margin:"0 0 64px",
        position:"relative",
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
      }}>
        <span style={{fontSize:10, color:TEXT_LOW, letterSpacing:2}}>SCROLL</span>
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path d="M2 2l8 8 8-8" stroke={GREEN_LT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
