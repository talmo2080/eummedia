import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Store, Sprout, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const font   = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN  = "#16a34a";
const TEAL   = "#0F766E";
const PLUM   = "#6B1F5C";
const DARK   = "#0b1929";
const INK    = "#374151";   // 평소 먹색
const INK_SB = "#6b7280";   // 평소 아이콘 서브

const NAV = [
  { label: "피움 이야기",   path: "/pium",         Icon: BookOpen },
  { label: "웹앱 둘러보기", path: "/pium-store",   Icon: Store },
  { label: "내 앱 피우기",  path: "/pium-submit",  Icon: Sprout },
  { label: "웹앱 의뢰하기", path: "/pium-request", Icon: Send },
];

export default function PiumHeader() {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    setOpen(false);
  }

  const isAdmin = profile?.role === "admin";

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(255,255,255,0.97)",
        borderBottom: `2px solid ${GREEN}22`,
        backdropFilter: "blur(12px)",
        fontFamily: font,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 20px",
          display: "flex", alignItems: "center",
          height: 64, gap: 16,
        }}>

          {/* 로고 */}
          <Link to="/pium-store" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img src="/pium-logo.png" alt="피움" style={{ height: 48, width: "auto", objectFit: "contain" }} />
          </Link>

          {/* 데스크탑 네비 */}
          <nav className="hidden md:flex" style={{ flex: 1, gap: 2, alignItems: "center" }}>
            {NAV.map(({ label, path, Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path} to={path}
                  style={{
                    padding: "8px 12px", fontSize: 13,
                    fontWeight: active ? 800 : 500,
                    color: active ? TEAL : INK,
                    textDecoration: "none", borderRadius: 8,
                    background: active ? "#f0fdfa" : "transparent",
                    borderBottom: active ? `2px solid ${TEAL}` : "2px solid transparent",
                    transition: "all 0.15s", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = PLUM;
                      e.currentTarget.style.background = "#fdf4ff";
                      e.currentTarget.querySelectorAll("svg").forEach(s => s.style.stroke = PLUM);
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = INK;
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.querySelectorAll("svg").forEach(s => s.style.stroke = INK_SB);
                    }
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8}
                    color={active ? TEAL : INK_SB} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* 우측: 이음미디어 + auth */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Link to="/" style={{
              fontSize: 12, color: "#9ca3af", fontWeight: 600,
              textDecoration: "none", padding: "4px 10px",
              border: "1px solid #e5e7eb", borderRadius: 6,
              transition: "color 0.15s",
            }}>이음미디어 →</Link>

            {isAdmin && (
              <Link to="/pium-admin" style={{
                fontSize: 13, color: "#7c3aed", fontWeight: 700,
                textDecoration: "none", padding: "6px 12px",
                border: "1.5px solid #7c3aed", borderRadius: 8,
                background: pathname === "/pium-admin" ? "#faf5ff" : "transparent",
              }}>관리자</Link>
            )}

            {user ? (
              <button onClick={handleLogout} style={{
                fontSize: 13, color: "#6b7280", fontWeight: 600,
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: 8, padding: "6px 12px",
                cursor: "pointer", fontFamily: font,
              }}>로그아웃</button>
            ) : (
              <Link to="/login" style={{
                fontSize: 13, color: "white", fontWeight: 700,
                textDecoration: "none", padding: "7px 16px",
                background: GREEN, borderRadius: 8,
              }}>로그인</Link>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="flex md:hidden"
            onClick={() => setOpen(v => !v)}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", padding: 8, color: DARK,
            }}
            aria-label="메뉴"
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        {open && (
          <div
            className="md:hidden"
            style={{
              background: "white", borderTop: `1px solid #e5e7eb`,
              padding: "12px 20px 20px",
            }}
          >
            {NAV.map(({ label, path, Icon }) => {
              const active = pathname === path;
              return (
                <Link key={path} to={path}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 16px",
                    fontSize: 16, fontWeight: active ? 800 : 500,
                    color: active ? TEAL : INK,
                    textDecoration: "none",
                    borderLeft: `3px solid ${active ? TEAL : "transparent"}`,
                    background: active ? "#f0fdfa" : "transparent",
                    marginBottom: 4, borderRadius: "0 8px 8px 0",
                  }}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8}
                    color={active ? TEAL : INK_SB} />
                  {label}
                </Link>
              );
            })}

            <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 12, paddingTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {isAdmin && (
                <Link to="/pium-admin" onClick={() => setOpen(false)} style={{
                  fontSize: 14, color: "#7c3aed", fontWeight: 700,
                  textDecoration: "none", padding: "8px 14px",
                  border: "1.5px solid #7c3aed", borderRadius: 8,
                }}>관리자</Link>
              )}
              <Link to="/" onClick={() => setOpen(false)} style={{
                fontSize: 14, color: "#9ca3af", fontWeight: 600,
                textDecoration: "none", padding: "8px 14px",
                border: "1px solid #e5e7eb", borderRadius: 8,
              }}>이음미디어 →</Link>
              {user ? (
                <button onClick={handleLogout} style={{
                  fontSize: 14, color: "#6b7280", fontWeight: 600,
                  background: "none", border: "1px solid #e5e7eb",
                  borderRadius: 8, padding: "8px 14px",
                  cursor: "pointer", fontFamily: font,
                }}>로그아웃</button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} style={{
                  fontSize: 14, color: "white", fontWeight: 700,
                  textDecoration: "none", padding: "8px 16px",
                  background: GREEN, borderRadius: 8,
                }}>로그인</Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
