import { useState } from "react";
import { Link } from "react-router-dom";

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

        {/* 우측 버튼 */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/advertise" style={{
            color: "#c9a84c",
            textDecoration: "none",
            fontSize: 13,
            padding: "5px 8px"
          }}>광고문의</Link>
          <Link to="/write" style={{
            background: "#1c4f8a",
            color: "#fff",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            padding: "5px 14px",
            borderRadius: 4
          }}>✍️ 기사 쓰기</Link>
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
        </div>
      </div>

      {/* 채널 메뉴 */}
      <nav style={{
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
    </header>
  );
}
