import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const channels = [
  { name: "이음매거진", path: "/channel/magazine" },
  { name: "이음피플",   path: "/channel/people" },
  { name: "이음로컬",   path: "/channel/local" },
  { name: "이음에듀",   path: "/channel/edu" },
  { name: "이음뷰",     path: "/channel/view" },
  { name: "이음트렌드", path: "/channel/trend" },
  { name: "이음보이스", path: "/channel/voice" },
];

export default function Header() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const role = profile?.role;
  const isAdmin = role === "admin";
  const roleLabel = role === "admin" ? "편집국장" : role === "writer" ? "기자" : "독자";
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

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

  return (
    <header style={{
      backgroundColor: "#0d2d52",
      color: "#fff",
      fontFamily: "'Noto Sans KR', sans-serif",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
    }}>
      {/* 상단 로고 영역 */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* 로고 + 텍스트 */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/logo.png" alt="이음미디어 로고" style={{ height: 44, width: "auto", objectFit: "contain" }} />
          <div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#c9a84c",
              fontFamily: "'Noto Serif KR', serif",
              letterSpacing: 2,
              lineHeight: 1.2
            }}>이음미디어</div>
            <div style={{ fontSize: 11, color: "#aac4e0" }}>
              세상과 당신을 잇는 인터넷신문
            </div>
          </div>
        </Link>

        {/* 우측 버튼 — 데스크탑 (768px+) */}
        <div className="hidden md:flex" style={{ gap: 12, alignItems: "center" }}>
          <Link to="/advertise" style={{
            color: "#c9a84c",
            textDecoration: "none",
            fontSize: 13,
            padding: "5px 8px"
          }}>광고문의</Link>
          {!isLoggedIn ? (
            <>
              <Link to="/login" style={{
                color: "#c9a84c",
                textDecoration: "none",
                fontSize: 13,
                border: "1px solid #c9a84c",
                padding: "5px 14px",
                borderRadius: 4
              }}>로그인</Link>
              <Link to="/signup" style={{
                backgroundColor: "#c9a84c",
                color: "#0d2d52",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 4
              }}>회원가입</Link>
            </>
          ) : (
            <>
              <Link
                to="/mypage"
                className="inline-flex items-center hover:bg-yellow-500/10 transition"
                style={{
                  color: "#c9a84c",
                  border: "2px solid #c9a84c",
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 14px",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {profile?.nickname || "회원"} {roleLabel}
              </Link>
              <button onClick={handleLogout} style={{
                color: "#c9a84c",
                background: "transparent",
                cursor: "pointer",
                fontSize: 13,
                border: "1px solid #c9a84c",
                padding: "5px 14px",
                borderRadius: 4,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>로그아웃</button>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" style={{
              color: "#888",
              textDecoration: "none",
              fontSize: 12,
              padding: "5px 8px"
            }}>⚙️ 관리자</Link>
          )}
        </div>

        {/* 햄버거 버튼 — 모바일 (768px 미만) */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="메뉴 열기"
          className="flex md:hidden items-center justify-center"
          style={{
            width: 52, height: 52,
            background: "transparent", border: "none",
            color: "#c9a84c", fontSize: 28,
            cursor: "pointer", padding: 0,
            fontFamily: "inherit",
          }}
        >☰</button>
      </div>

      {/* 채널 메뉴 — 데스크탑 (768px+) */}
      <nav className="hidden md:block" style={{
        backgroundColor: "#0a2240",
        borderTop: "1px solid rgba(201,168,76,0.3)"
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
        }}>
          {channels.map((ch) => (
            <Link
              key={ch.path}
              to={ch.path}
              style={{
                color: "#e0e8f0",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                padding: "10px 18px",
                display: "block",
                borderBottom: "3px solid transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#c9a84c";
                e.currentTarget.style.borderBottomColor = "#c9a84c";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "#e0e8f0";
                e.currentTarget.style.borderBottomColor = "transparent";
              }}
            >
              {ch.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* 모바일 풀스크린 오버레이 (768px 미만 + menuOpen) */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          role="dialog"
          aria-modal="true"
          aria-label="전체 메뉴"
          className="md:hidden"
          style={{
            position: "fixed", inset: 0,
            background: "#0a2240",
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
            {/* 닫기 버튼 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button
                onClick={closeMenu}
                aria-label="메뉴 닫기"
                style={{
                  width: 52, height: 52,
                  background: "transparent", border: "none",
                  color: "#c9a84c", fontSize: 28,
                  cursor: "pointer", padding: 0,
                  fontFamily: "inherit",
                }}
              >✕</button>
            </div>

            {/* 채널 7개 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                color: "rgba(201,168,76,0.75)",
                fontSize: 13, fontWeight: 700,
                letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
              }}>채널</div>
              {channels.map((ch) => (
                <Link
                  key={ch.path}
                  to={ch.path}
                  onClick={closeMenu}
                  style={{
                    display: "flex", alignItems: "center",
                    minHeight: 52, padding: "10px 16px",
                    color: "#e0e8f0", textDecoration: "none",
                    fontSize: 19, fontWeight: 600,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >{ch.name}</Link>
              ))}
            </div>

            {/* 활동 버튼 */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                color: "rgba(201,168,76,0.75)",
                fontSize: 13, fontWeight: 700,
                letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
              }}>활동</div>

              {isLoggedIn && (
                <Link
                  to="/mypage"
                  onClick={closeMenu}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 52, padding: "10px 16px", marginBottom: 10,
                    color: "#c9a84c", border: "1px solid #c9a84c",
                    fontSize: 19, fontWeight: 600, textDecoration: "none",
                    borderRadius: 4,
                  }}
                >📋 마이페이지</Link>
              )}

              <Link
                to="/advertise"
                onClick={closeMenu}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 52, padding: "10px 16px", marginBottom: 10,
                  color: "#c9a84c", border: "1px solid #c9a84c",
                  fontSize: 19, fontWeight: 600, textDecoration: "none",
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
                      color: "#c9a84c", border: "1px solid #c9a84c",
                      fontSize: 19, fontWeight: 600, textDecoration: "none",
                      borderRadius: 4,
                    }}
                  >로그인</Link>
                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minHeight: 52, padding: "10px 16px",
                      background: "#c9a84c", color: "#0d2d52",
                      fontSize: 19, fontWeight: 700, textDecoration: "none",
                      borderRadius: 4,
                    }}
                  >회원가입</Link>
                </>
              ) : (
                <>
                  <Link
                    to="/mypage"
                    onClick={closeMenu}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      color: "#c9a84c",
                      border: "2px solid #c9a84c",
                      borderRadius: 4,
                      fontSize: 17, fontWeight: 500,
                      padding: "10px 18px",
                      marginBottom: 6,
                      alignSelf: "center",
                      textDecoration: "none",
                    }}
                  >
                    {profile?.nickname || "회원"} {roleLabel}
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", minHeight: 52, padding: "10px 16px",
                      color: "#c9a84c", background: "transparent",
                      border: "1px solid #c9a84c",
                      fontSize: 19, fontWeight: 600, borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                  >로그아웃</button>
                </>
              )}
            </div>

            {isAdmin && (
              <div>
                <div style={{
                  color: "rgba(201,168,76,0.75)",
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: 2, marginBottom: 10, paddingLeft: 4,
                }}>관리</div>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: 52, padding: "10px 16px",
                    color: "#aaa", border: "1px solid #555",
                    fontSize: 17, fontWeight: 600, textDecoration: "none",
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
