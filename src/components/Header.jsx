import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

// 시안(이음미디어_헤더제호시안.html .new) 정확 매핑
const NAVY = "#0d2d52";
const GOLD_SOFT = "#c9a84c";     // 활성 채널 하단선
const IVORY = "#f4f2ea";          // 날짜 줄 배경
const IVORY_BORDER = "#e3e0d5";   // 날짜 줄 하단 보더
const INK = "#1a1a1a";
const INK_SUB = "#3a3a3a";        // 슬로건
const DATE_INK = "#444";          // 날짜
const REG_INK = "#6b6b6b";        // 등록번호
const RED = "#a8321f";            // 로고 빨강 포인트
const CHANNEL_INACTIVE = "#dbe3ec";

// 채널 네비 — "홈" 맨 앞 + 채널 7개
const navItems = [
  { name: "홈",        path: "/" },
  { name: "이음매거진", path: "/channel/magazine" },
  { name: "이음피플",   path: "/channel/people" },
  { name: "이음로컬",   path: "/channel/local" },
  { name: "이음에듀",   path: "/channel/edu" },
  { name: "이음뷰",     path: "/channel/view" },
  { name: "이음트렌드", path: "/channel/trend" },
  { name: "이음보이스", path: "/channel/voice" },
  { name: "🌱 피움", path: "/pium" },
];

// 오늘 날짜 — YYYY년 M월 D일 요일 (한국어)
function formatToday() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
}

export default function Header() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!user;
  const role = profile?.role;
  const canSeeAdmin = role === "admin" || role === "publisher";
  const roleLabel =
    role === "admin" ? "편집국장" :
    role === "publisher" ? "발행인" :
    role === "writer" ? "기자" : "독자";
  // 닉네임 버튼 목적지 — admin·publisher는 /admin (기사관리+내 임시저장 통합), writer/reader는 /mypage
  const myPageTarget = (role === "admin" || role === "publisher") ? "/admin" : "/mypage";

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [today] = useState(formatToday);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    navigate("/");
  }

  // 활성 메뉴 판단 — pathname 정확 매칭
  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      backgroundColor: "#fff",
      color: INK,
      fontFamily: "'Noto Sans KR', sans-serif",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      {/* ① 맨 위 날짜·등록번호 줄 (시안 .new-meta) */}
      <div style={{
        background: IVORY,
        borderBottom: `1px solid ${IVORY_BORDER}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "9px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 11.5, color: DATE_INK, fontWeight: 700 }}>{today}</span>
          <span style={{ fontSize: 10.5, color: REG_INK, fontWeight: 600 }}>등록 서울 아56526</span>
        </div>
      </div>

      {/* ② 제호 본체 — 시안 .new-head (흰 배경 + 네이비 하단선 3px) */}
      <div style={{
        borderBottom: `3px solid ${NAVY}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "15px 20px 13px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {/* 로고 + 제호 */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11 }}>
            {/* 로고 박스 — 네이비 테두리 2.5px + 우하단 빨강 납작 막대 */}
            <div style={{
              position: "relative",
              width: 44, height: 44,
              border: `2.5px solid ${NAVY}`,
              borderRadius: 3,
              padding: 3, boxSizing: "border-box",
              background: "#fff",
              flexShrink: 0,
            }}>
              <img src="/logo.png" alt="이음미디어 로고"
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              {/* 시안 ::after — 납작한 가로 막대 */}
              <div style={{
                position: "absolute",
                right: 5, bottom: 5,
                width: 9, height: 2.5,
                background: RED,
              }} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 27, fontWeight: 900,
                color: NAVY,
                letterSpacing: 0.5, lineHeight: 1,
              }}>이음미디어</div>
              <div style={{
                fontSize: 11.5, color: INK_SUB, fontWeight: 700,
                marginTop: 5, letterSpacing: 0.3,
              }}>
                세상과 당신을 잇는 인터넷신문
              </div>
            </div>
          </Link>

          {/* 우측 버튼 — 데스크탑 (768px+) */}
          <div className="hidden md:flex" style={{ gap: 10, alignItems: "center" }}>
            {/* 피움 로고 */}
            <Link to="/pium" style={{ display: "flex", alignItems: "center", textDecoration: "none", marginRight: 4, background: "#ffffff", borderRadius: 4, padding: "2px 4px" }}>
              <img src="/pium-logo.png" alt="" style={{ height: 56, width: "auto", objectFit: "contain", display: "block", background: "#ffffff" }} />
            </Link>
            <Link to="/advertise" style={{
              color: NAVY, textDecoration: "none",
              fontSize: 13, fontWeight: 700,
              padding: "6px 10px",
            }}>광고문의</Link>
            {!isLoggedIn ? (
              <>
                <Link to="/login" style={{
                  color: NAVY, textDecoration: "none",
                  fontSize: 13, fontWeight: 700,
                  border: `1.5px solid ${NAVY}`,
                  padding: "6px 14px", borderRadius: 4,
                }}>로그인</Link>
                <Link to="/register" style={{
                  background: NAVY, color: "#fff",
                  textDecoration: "none",
                  fontSize: 13, fontWeight: 800,
                  padding: "7px 14px", borderRadius: 4,
                }}>회원가입</Link>
              </>
            ) : (
              <>
                {role !== "admin" && (
                  <Link to={myPageTarget} style={{
                    color: NAVY, textDecoration: "none",
                    border: `1.5px solid ${NAVY}`,
                    borderRadius: 4,
                    fontSize: 13, fontWeight: 700,
                    padding: "6px 14px",
                  }}>
                    {profile?.nickname || "회원"} {roleLabel}
                  </Link>
                )}
                <button onClick={handleLogout} style={{
                  color: NAVY, background: "transparent",
                  cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  border: `1.5px solid ${NAVY}`,
                  padding: "6px 14px", borderRadius: 4,
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}>로그아웃</button>
              </>
            )}
            {canSeeAdmin && (
              <Link to="/admin" style={{
                color: INK_SUB, textDecoration: "none",
                fontSize: 13, fontWeight: 700,
                padding: "6px 8px",
              }}>⚙️ 관리자</Link>
            )}
          </div>

          {/* 햄버거 — 모바일 (768px 미만) */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="메뉴 열기"
            className="flex md:hidden items-center justify-center"
            style={{
              width: 52, height: 52,
              background: "transparent", border: "none",
              color: NAVY, fontSize: 28, fontWeight: 700,
              cursor: "pointer", padding: 0,
              fontFamily: "inherit",
            }}
          >☰</button>
        </div>
      </div>

      {/* ③ 채널 네비 — PC·모바일 공통 (네이비 배경, 모바일은 가로 스크롤) */}
      <nav style={{
        backgroundColor: NAVY,
      }}>
        <div
          className="no-scrollbar"
          style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "0 20px",
            display: "flex",
            overflowX: "auto",
            scrollbarWidth: "none",     // Firefox
            msOverflowStyle: "none",    // IE/Edge
          }}>
          {navItems.map((ch) => {
            const active = isActive(ch.path);
            return (
              <Link
                key={ch.path}
                to={ch.path}
                style={{
                  color: active ? "#fff" : CHANNEL_INACTIVE,
                  textDecoration: "none",
                  fontSize: 13, fontWeight: active ? 800 : 700,
                  padding: "12px 14px",
                  display: "block",
                  borderBottom: `3px solid ${active ? GOLD_SOFT : "transparent"}`,
                  transition: "color 0.15s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = CHANNEL_INACTIVE; }}
              >
                {ch.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 모바일 풀스크린 오버레이 */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          role="dialog"
          aria-modal="true"
          aria-label="전체 메뉴"
          className="md:hidden"
          style={{
            position: "fixed", inset: 0,
            background: NAVY,
            zIndex: 2000,
            overflowY: "auto",
            padding: "16px 20px 32px",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            {/* 닫기 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button
                onClick={closeMenu}
                aria-label="메뉴 닫기"
                style={{
                  width: 52, height: 52,
                  background: "transparent", border: "none",
                  color: GOLD_SOFT, fontSize: 28,
                  cursor: "pointer", padding: 0,
                  fontFamily: "inherit",
                }}
              >✕</button>
            </div>

            {/* 채널 8개 (홈 + 7) — 활성 골드 하단선 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                color: GOLD_SOFT,
                fontSize: 13, fontWeight: 700,
                letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
              }}>채널</div>
              {navItems.map((ch) => {
                const active = isActive(ch.path);
                return (
                  <Link
                    key={ch.path}
                    to={ch.path}
                    onClick={closeMenu}
                    style={{
                      display: "flex", alignItems: "center",
                      minHeight: 52, padding: "10px 16px",
                      color: active ? "#fff" : CHANNEL_INACTIVE,
                      textDecoration: "none",
                      fontSize: 19, fontWeight: active ? 800 : 700,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      borderLeft: active ? `4px solid ${GOLD_SOFT}` : "4px solid transparent",
                    }}
                  >{ch.name}</Link>
                );
              })}
            </div>

            {/* 활동 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                color: GOLD_SOFT,
                fontSize: 13, fontWeight: 700,
                letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
              }}>활동</div>

              <Link
                to="/pium"
                onClick={closeMenu}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 52, padding: "10px 16px", marginBottom: 10,
                  color: "#166534", border: "1.5px solid #166534",
                  fontSize: 19, fontWeight: 700, textDecoration: "none",
                  borderRadius: 4, background: "#f0fdf4",
                }}
              >🌱 피움앱</Link>
              <Link
                to="/advertise"
                onClick={closeMenu}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 52, padding: "10px 16px", marginBottom: 10,
                  color: GOLD_SOFT, border: `1.5px solid ${GOLD_SOFT}`,
                  fontSize: 19, fontWeight: 700, textDecoration: "none",
                  borderRadius: 4,
                }}
              >📢 광고문의</Link>

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minHeight: 52, padding: "10px 16px", marginBottom: 10,
                      color: GOLD_SOFT, border: `1.5px solid ${GOLD_SOFT}`,
                      fontSize: 19, fontWeight: 700, textDecoration: "none",
                      borderRadius: 4,
                    }}
                  >로그인</Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minHeight: 52, padding: "10px 16px",
                      background: GOLD_SOFT, color: NAVY,
                      fontSize: 19, fontWeight: 800, textDecoration: "none",
                      borderRadius: 4,
                    }}
                  >회원가입</Link>
                </>
              ) : (
                <>
                  {role !== "admin" && (
                    <Link
                      to={myPageTarget}
                      onClick={closeMenu}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        minHeight: 52, padding: "10px 16px", marginBottom: 10,
                        color: GOLD_SOFT, border: `1.5px solid ${GOLD_SOFT}`,
                        fontSize: 19, fontWeight: 700, textDecoration: "none",
                        borderRadius: 4,
                      }}
                    >
                      {profile?.nickname || "회원"} {roleLabel}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", minHeight: 52, padding: "10px 16px",
                      color: GOLD_SOFT, background: "transparent",
                      border: `1.5px solid ${GOLD_SOFT}`,
                      fontSize: 19, fontWeight: 700, borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >로그아웃</button>
                </>
              )}
            </div>

            {canSeeAdmin && (
              <div>
                <div style={{
                  color: GOLD_SOFT,
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
                }}>관리</div>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 52, padding: "10px 16px",
                    color: "#fff", border: `1.5px solid ${CHANNEL_INACTIVE}`,
                    fontSize: 17, fontWeight: 700, textDecoration: "none",
                    borderRadius: 4,
                  }}
                >⚙️ 관리자 페이지</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
