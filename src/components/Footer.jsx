import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: "#0d2d52",
      color: "rgba(255,255,255,0.65)",
      fontFamily: "'Noto Sans KR', sans-serif",
      borderTop: "3px solid #c9a84c",
      marginTop: 60
    }}>
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "40px 24px",
        textAlign: "center"
      }}>
        {/* 로고 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 20
        }}>
          <img src="/logo.png" alt="이음미디어 로고" style={{ height: 52, width: "auto", objectFit: "contain", marginBottom: 10 }} />
          <div style={{
            fontFamily: "'Noto Serif KR', serif",
            fontSize: 24,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-1px"
          }}>
            이음<span style={{ color: "#c9a84c" }}>미디어</span>
          </div>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace", letterSpacing: "0.12em" }}>E-EUM MEDIA</div>
        </div>

        {/* 슬로건 강조 */}
        <div style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#c9a84c",
          marginTop: 12,
          marginBottom: 6,
          fontFamily: "'Noto Serif KR', serif",
          letterSpacing: "-0.5px"
        }}>
          세상을 잇고, 사람을 잇는다
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 20,
          letterSpacing: "0.5px"
        }}>
          당신의 성공이 우리의 뉴스다
        </div>

        {/* 등록정보 */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.9, marginBottom: 16 }}>
          등록번호: 서울, 이56526 | 발행인: 성창운 | 편집인: 정세연<br />
          청소년보호책임자: 정세연 | press@eummedia.kr<br />
          주소: 경기도 고양시 일산 | 발행일: 매주
        </div>

        {/* 링크 */}
        <div style={{
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          fontSize: 11,
          marginBottom: 12
        }}>
          {[
            { href: "/privacy", label: "개인정보처리방침" },
            { href: "/terms", label: "이용약관" },
            { href: "/youth", label: "청소년보호정책" },
            { href: "/about#editorial", label: "편집방침" },
            { href: "/ad", label: "광고문의" },
            { href: "/about", label: "이음미디어 소개" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = "#c9a84c"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >{l.label}</a>
          ))}
        </div>

        {/* 카피라이트 */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          © 2026 이음미디어. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
