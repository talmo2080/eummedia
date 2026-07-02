import { Link } from "react-router-dom";

const font  = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN = "#16a34a";

export default function PiumFooter() {
  return (
    <footer style={{
      background: "#0b1929",
      borderTop: `2px solid ${GREEN}33`,
      padding: "24px 24px 16px",
      fontFamily: font,
      color: "#94a3b8",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* 로고 + 슬로건 한 줄 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, marginBottom: 14,
        }}>
          <img
            src="/pium-logo.png"
            alt="피움"
            style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(1.1)" }}
          />
          <span style={{ fontSize: 13, color: "#475569", letterSpacing: "0.04em" }}>
            경험이 기술을 입다
          </span>
        </div>

        {/* 사업자 정보 — 한 블록으로 압축 */}
        <p style={{
          fontSize: 12, lineHeight: 1.8, color: "#475569",
          textAlign: "center", margin: "0 0 14px",
        }}>
          <strong style={{ color: "#64748b" }}>운영</strong> 닥터리부트 두피센터&nbsp;
          <span style={{ color: "#334155" }}>|</span>&nbsp;
          <strong style={{ color: "#64748b" }}>대표</strong> 정세연&nbsp;
          <span style={{ color: "#334155" }}>|</span>&nbsp;
          사업자 677-40-00844&nbsp;
          <span style={{ color: "#334155" }}>|</span>&nbsp;
          통신판매 제2021-고양일산동-1019호<br />
          경기도 고양시 일산동구 강석로 149, 4층 404호&nbsp;
          <span style={{ color: "#334155" }}>|</span>&nbsp;
          문의 <em style={{ fontStyle: "normal", color: "#334155" }}>준비 중</em>
        </p>

        {/* 링크 + 카피라이트 */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 16, flexWrap: "wrap",
        }}>
          <Link to="/privacy" style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>개인정보처리방침</Link>
          <span style={{ color: "#334155", fontSize: 11 }}>|</span>
          <Link to="/terms"   style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>이용약관</Link>
          <span style={{ color: "#334155", fontSize: 11 }}>|</span>
          <span style={{ fontSize: 11, color: "#334155" }}>ⓒ 2026 PIUM. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
}
