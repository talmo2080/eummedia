// 접근성 안내 페이지 (뼈대) — 상단 배지·푸터에서 연결
// ※ 문안은 세연이 최종 작성 예정. 여기선 뼈대만.
// ※ h1 1개, 다크·라이트 대비 준수, 키보드 이동 가능.

const NAVY = "#0d2d52";
const GOLD = "#c9a84c";
const TEXT = "#2a2a2a";
const SUB = "#555";
const CARD = "#fff";
const BG = "#f7f7f4";

export default function Accessibility() {
  return (
    <main id="main-content" style={{
      background: BG, minHeight: "60vh",
      fontFamily: "'Noto Sans KR', sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        <h1 style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 30, fontWeight: 800,
          color: NAVY, margin: "0 0 8px",
          lineHeight: 1.35,
        }}>이음미디어 접근성 안내</h1>

        <p style={{
          color: SUB, fontSize: 15, lineHeight: 1.7,
          margin: "0 0 32px",
        }}>
          이음미디어는 눈이 피로한 독자, 노안이 있는 어르신,
          이동 중인 독자, 화면낭독기 사용자 모두를 고려해 만들어집니다.
        </p>

        {/* ── 지원 항목 ─────────── */}
        <section style={cardStyle}>
          <h2 style={h2Style}>이음미디어가 지원하는 것</h2>
          <ul style={ulStyle}>
            <li>모든 기사에 듣기 기능 (재생·정지·속도 조절)</li>
            <li>화면낭독기 호환 (제목·본문·인용 구분, 이미지 대체 텍스트)</li>
            <li>키보드만으로 이용 가능 (본문 바로가기 링크 포함)</li>
            <li>색 대비 기준 충족 (본문 4.5:1 이상, 대체로 7:1 이상)</li>
          </ul>
        </section>

        {/* ── 듣기 사용법 ─────────── */}
        <section style={cardStyle}>
          <h2 style={h2Style}>듣기 기능 사용법</h2>
          <ul style={ulStyle}>
            <li>기사 제목 아래 [▶ 기사 듣기] 버튼을 누르세요.</li>
            <li>속도는 0.8배에서 1.5배까지 조절됩니다.</li>
            <li>재생 중에는 지금 읽고 있는 문단이 옅게 표시됩니다.</li>
            <li>브라우저 탭을 벗어나도 재생은 이어집니다. 정지 버튼으로 끌 수 있습니다.</li>
          </ul>
          <p style={{ color: SUB, fontSize: 13.5, lineHeight: 1.7, margin: "10px 0 0" }}>
            브라우저 내장 음성을 사용하므로 기기·브라우저에 따라 억양이 다를 수 있습니다.
            한국어 음성이 설치되지 않은 기기에서는 듣기 버튼이 표시되지 않습니다.
          </p>
        </section>

        {/* ── 의견 보내기 ─────────── */}
        <section style={cardStyle}>
          <h2 style={h2Style}>의견 보내기</h2>
          <p style={{ color: TEXT, fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            읽기 힘든 화면, 잘못 낭독되는 부분, 키보드로 도달하지 못하는 요소가 있으면
            알려주세요. 다음 개선에 반영합니다.
          </p>
          <p style={{ margin: "12px 0 0" }}>
            <a href="mailto:press@eummedia.kr" style={{
              color: NAVY, fontWeight: 700, fontSize: 16,
              textDecoration: "underline",
            }}>press@eummedia.kr</a>
          </p>
        </section>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a href="/" style={{
            color: NAVY, fontSize: 14, fontWeight: 700,
            textDecoration: "none",
            borderBottom: `1px solid ${NAVY}`,
            paddingBottom: 1,
          }}>← 홈으로 돌아가기</a>
        </div>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: 8,
  padding: "24px 26px",
  marginBottom: 20,
};

const h2Style = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 20, fontWeight: 700,
  color: NAVY, margin: "0 0 14px",
  borderLeft: `4px solid ${GOLD}`,
  paddingLeft: 10, lineHeight: 1.4,
};

const ulStyle = {
  color: TEXT, fontSize: 15, lineHeight: 1.85,
  margin: 0, padding: "0 0 0 20px",
};
