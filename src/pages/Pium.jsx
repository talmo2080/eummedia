import { Link } from "react-router-dom";

const GREEN = "#166534";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_BORDER = "#bbf7d0";

export default function Pium() {
  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: GREEN_LIGHT,
      padding: "48px 20px",
      fontFamily: "'Noto Sans KR', sans-serif",
      textAlign: "center",
    }}>
      <img
        src="/pium-logo.png"
        alt="피움앱 로고"
        style={{ height: 72, width: "auto", objectFit: "contain", marginBottom: 24 }}
      />

      <h1 style={{
        fontSize: 28,
        fontWeight: 900,
        color: GREEN,
        margin: "0 0 12px",
        lineHeight: 1.3,
      }}>
        준비중 — 곧 만나요 🌱
      </h1>

      <p style={{
        fontSize: 16,
        color: "#3d5a3e",
        lineHeight: 1.8,
        maxWidth: 400,
        margin: "0 0 8px",
      }}>
        비개발자가 만든 웹앱이 피어나는 곳,<br />
        <strong>피움앱</strong>을 준비하고 있어요.
      </p>

      <p style={{
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 1.7,
        maxWidth: 360,
        margin: "0 0 36px",
      }}>
        나눔이든 수익이든, 만든 사람이 빛납니다.<br />
        Make it. Bloom it. PIUM.
      </p>

      <div style={{
        background: "#fff",
        border: `1.5px solid ${GREEN_BORDER}`,
        borderRadius: 8,
        padding: "20px 28px",
        marginBottom: 32,
        maxWidth: 340,
        width: "100%",
      }}>
        <div style={{ fontSize: 13, color: GREEN, fontWeight: 700, marginBottom: 6 }}>
          📬 오픈 소식 받기
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
          이음미디어 뉴스레터를 구독하시면<br />
          피움앱 오픈 소식을 가장 먼저 알려드려요.
        </div>
        <Link to="/subscribe" style={{
          display: "block",
          marginTop: 14,
          background: GREEN,
          color: "#fff",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 700,
          padding: "9px 0",
          borderRadius: 4,
          fontFamily: "inherit",
        }}>
          뉴스레터 구독하기 →
        </Link>
      </div>

      {/* 🌱 피움 → 이음 기사 연결 뼈대 */}
      {/* TODO: 나중에 실제 메이커 이야기 기사 목록으로 교체 */}
      <div style={{
        marginTop: 12,
        marginBottom: 32,
        padding: "16px 20px",
        background: "#fff",
        border: "1.5px solid #e5e7eb",
        borderRadius: 8,
        maxWidth: 340,
        width: "100%",
        textAlign: "left",
      }}>
        <div style={{ fontSize: 12, color: "#166534", fontWeight: 700, marginBottom: 6 }}>
          📰 메이커 이야기
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 12 }}>
          이음미디어에서 피움 메이커들의<br />창작 이야기를 기사로 만납니다.
        </div>
        <Link to="/channel/magazine" style={{
          display: "block",
          textAlign: "center",
          background: "#0d2d52",
          color: "#fff",
          textDecoration: "none",
          fontSize: 12,
          fontWeight: 700,
          padding: "8px 0",
          borderRadius: 4,
          fontFamily: "inherit",
        }}>
          이음매거진 보러가기 →
        </Link>
      </div>

      <Link to="/" style={{
        fontSize: 13,
        color: "#9ca3af",
        textDecoration: "none",
        fontWeight: 600,
      }}>
        ← 이음미디어 홈으로
      </Link>
    </div>
  );
}
