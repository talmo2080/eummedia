// /accessibility 페이지의 '목소리에 관하여' 안내 섹션 (지시서 【4】-4-2)
// 별도 컴포넌트로 분리 — 최종 문안 수정은 세연이 직접 이 파일만 편집하면 됨.

const NAVY = '#0d2d52';
const GOLD = '#c9a84c';
const TEXT = '#2a2a2a';
const SUB = '#555';

const cardStyle = {
  background: '#fff',
  border: '1px solid #e8e8e8',
  borderRadius: 8,
  padding: '24px 26px',
  marginBottom: 20,
};

const h2Style = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 20, fontWeight: 700,
  color: NAVY, margin: '0 0 14px',
  borderLeft: `4px solid ${GOLD}`,
  paddingLeft: 10, lineHeight: 1.4,
};

const h3Style = {
  fontFamily: "'Noto Serif KR', serif",
  fontSize: 16, fontWeight: 700,
  color: NAVY, margin: '20px 0 10px',
};

const pStyle = { color: TEXT, fontSize: 15, lineHeight: 1.85, margin: '0 0 12px' };
const ulStyle = { color: TEXT, fontSize: 15, lineHeight: 1.85, margin: 0, padding: '0 0 0 20px' };

export default function AccessibilityVoiceGuide() {
  return (
    <section style={cardStyle}>
      <h2 style={h2Style}>목소리에 관하여</h2>
      <p style={pStyle}>
        이음미디어의 듣기 기능은 독자의 기기에 설치된 음성을 사용합니다.
        별도 프로그램을 설치하실 필요가 없는 대신, 사용하시는 기기와
        브라우저에 따라 목소리가 다르게 들립니다.
      </p>
      <ul style={ulStyle}>
        <li>윈도우 컴퓨터, 아이폰, 안드로이드폰이 각각 다른 목소리로 읽습니다.</li>
        <li>같은 기기라도 브라우저에 따라 달라질 수 있습니다.</li>
        <li>기기에 여러 음성이 설치되어 있으면 듣기 컨트롤에서 고르실 수 있습니다.</li>
      </ul>

      <h3 style={h3Style}>소리가 나지 않는다면</h3>
      <ul style={ulStyle}>
        <li>기기 음량과 무음 모드를 확인해주세요.</li>
        <li>아이폰은 화면 옆 무음 스위치를 확인해주세요.</li>
        <li>기기에 한국어 음성이 설치되어 있지 않으면 듣기 버튼이 보이지 않습니다.</li>
      </ul>
    </section>
  );
}
