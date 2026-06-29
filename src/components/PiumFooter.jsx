import { Link } from "react-router-dom";

const font  = "'Pretendard', 'Noto Sans KR', sans-serif";
const GREEN = "#16a34a";

export default function PiumFooter() {
  return (
    <footer style={{
      background: "#0b1929",
      borderTop: `3px solid ${GREEN}44`,
      padding: "48px 24px 32px",
      fontFamily: font,
      color: "#94a3b8",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* 로고 + 슬로건 */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <img
            src="/pium-logo.png"
            alt="피움"
            style={{ height: 52, width: "auto", objectFit: "contain", marginBottom: 12, filter: "brightness(1.1)" }}
          />
          <p style={{ fontSize: 14, color: "#64748b", margin: 0, letterSpacing: 1 }}>
            경험이 기술을 입다
          </p>
        </div>

        {/* 사업자 정보 */}
        <div style={{
          fontSize: 13, lineHeight: 2, color: "#64748b",
          textAlign: "center", marginBottom: 28,
        }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong style={{ color: "#94a3b8" }}>운영:</strong> 닥터리부트 두피센터&nbsp;&nbsp;|&nbsp;&nbsp;
            <strong style={{ color: "#94a3b8" }}>대표:</strong> 정세연
          </p>
          <p style={{ margin: "0 0 4px" }}>
            경기도 고양시 일산동구 강석로 149, 4층 404호 (마두동, 강촌프라자)
          </p>
          <p style={{ margin: "0 0 4px" }}>
            사업자등록번호 677-40-00844&nbsp;&nbsp;|&nbsp;&nbsp;통신판매업신고 제2021-고양일산동-1019호
          </p>
          <p style={{ margin: 0, color: "#475569" }}>
            문의:&nbsp;
            <span style={{ color: "#475569", fontStyle: "italic" }}>준비 중</span>
          </p>
        </div>

        {/* 링크 + 카피라이트 */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
            <Link to="/privacy" style={{ color: "#64748b", textDecoration: "none" }}>개인정보처리방침</Link>
            <span style={{ color: "#334155" }}>|</span>
            <Link to="/terms" style={{ color: "#64748b", textDecoration: "none" }}>이용약관</Link>
          </div>
          <p style={{ fontSize: 12, color: "#334155", margin: 0 }}>
            ⓒ 2026 PIUM. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
