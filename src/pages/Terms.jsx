const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const GOLD = '#c9a84c'
const SUB = '#f0a882'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const ARTICLES = [
  {
    num: '제1조',
    title: '목적',
    body: '이 약관은 이음미디어가 제공하는 인터넷신문 서비스의 이용 조건과 절차, 회사와 이용자의 권리·의무·책임 사항을 규정함을 목적으로 합니다.',
  },
  {
    num: '제2조',
    title: '용어의 정의',
    body: (
      <>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: NAVY }}>시민기자</strong>: 편집국장 승인 후 이음미디어에서 기사를 작성·발행할 수 있는 자원봉사 신분의 회원.</p>
        <p style={{ margin: '0 0 8px 0' }}><strong style={{ color: NAVY }}>독자</strong>: 이음미디어 콘텐츠를 열람·구독하는 일반 회원.</p>
        <p style={{ margin: 0 }}><strong style={{ color: NAVY }}>편집국장</strong>: 이음미디어의 편집 방향과 보도 품질을 책임지고 시민기자 승인 및 기사 발행을 총괄하는 자.</p>
      </>
    ),
  },
  {
    num: '제3조',
    title: '서비스의 제공',
    body: '이음미디어는 회원에게 다음 서비스를 제공합니다. ① 기사 열람, ② 카카오 채널 구독, ③ 승인된 시민기자의 기사 작성·발행, ④ 광고 문의 및 제보, ⑤ 기타 매체 운영에 필요한 부가 서비스.',
  },
  {
    num: '제4조',
    title: '시민기자의 신분과 책임',
    body: '시민기자는 자원봉사·프리랜서 신분이며, 취재원에게 금품·향응을 요구할 수 없습니다. 타 언론사 사칭 및 개인적 영리목적의 사용을 엄격히 금하며, 위반 시 자격정지 및 민·형사상 법적 책임을 질 수 있습니다.',
  },
  {
    num: '제5조',
    title: '저작권',
    body: '시민기자가 작성하여 이음미디어에 발행된 기사의 저작권은 기자와 이음미디어가 공동 소유합니다. 무단 전재 및 재배포는 금지되며, 인용 시 출처를 명시해야 합니다.',
  },
]

export default function Terms() {
  return (
    <div style={{ background: '#fff', fontFamily: SANS, color: '#1a1a1a' }}>

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
        color: '#fff', padding: '88px 32px 72px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, letterSpacing: 4, color: SUB, fontWeight: 700,
            textTransform: 'uppercase', marginBottom: 18,
          }}>
            TERMS OF SERVICE
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: -1, marginBottom: 18, color: GOLD,
          }}>
            📜 이음미디어 이용약관
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, opacity: 0.85, fontWeight: 300, marginBottom: 14 }}>
            이음미디어 서비스 이용 조건 영역
          </p>
          <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 0.5 }}>
            시행일: 2026년 6월 4일
          </div>
        </div>
      </section>

      {/* 본문 */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>
        {ARTICLES.map(a => (
          <section key={a.num} style={{ padding: '40px 0', borderTop: '1px solid #e5e5e5' }}>
            <div style={{
              fontSize: 13, letterSpacing: 2, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              {a.num}
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: NAVY,
              margin: '0 0 14px 0', lineHeight: 1.45,
            }}>
              {a.title}
            </h2>
            <div style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.95 }}>
              {a.body}
            </div>
          </section>
        ))}

        {/* 부칙 */}
        <section style={{ padding: '40px 0 80px', borderTop: '1px solid #e5e5e5' }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 14, lineHeight: 1.5 }}>
            부칙
          </h3>
          <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.9, margin: '0 0 24px 0' }}>
            이 이용약관은 <strong>2026년 6월 4일</strong>부터 시행됩니다.
          </p>
          <div style={{
            background: '#fafafa', border: '1px solid #e5e5e5',
            padding: '20px 24px', fontSize: 14, color: '#3a3a3a', lineHeight: 1.9,
          }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>발행</div>
            <div>발행인: 성창운</div>
            <div>📧 press@eummedia.kr</div>
          </div>
        </section>
      </div>
    </div>
  )
}
