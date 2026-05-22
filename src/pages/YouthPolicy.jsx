const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const GOLD = '#c9a84c'
const SUB = '#f0a882'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const BASIC_POLICIES = [
  '청소년이 안심하고 콘텐츠를 이용할 수 있는 환경을 조성합니다.',
  '청소년에게 유해한 정보가 게시되지 않도록 상시 점검합니다.',
  '청소년 유해정보로 인한 피해가 발생하지 않도록 예방에 힘씁니다.',
  '청소년 관련 불만 및 침해사항을 신속히 처리합니다.',
]

const PROTECTION_PLANS = [
  '청소년 유해매체물에 대한 모니터링을 정기적으로 실시합니다.',
  '유해정보 발견 시 즉시 삭제 및 접근 제한 조치를 취합니다.',
  '시민기자 및 콘텐츠 작성자에게 청소년보호 관련 교육을 실시합니다.',
  '청소년에게 부적절한 광고가 노출되지 않도록 관리합니다.',
]

const BLOCK_MEASURES = [
  '본 매체는 청소년 유해정보가 게시될 경우 지체 없이 해당 정보를 차단·삭제합니다.',
  '청소년 유해정보를 반복 게시하는 이용자에 대해서는 이용을 제한할 수 있습니다.',
  '청소년 보호와 관련된 법령이 개정될 경우 본 정책에 반영합니다.',
]

const EXTERNAL_AGENCIES = [
  ['방송통신심의위원회', '국번없이 1377'],
  ['청소년 사이버상담센터', '1388'],
]

function Section({ title, intro, children }) {
  return (
    <section style={{ padding: '48px 0', borderTop: '1px solid #e5e5e5' }}>
      <h2 style={{
        fontFamily: SERIF, fontSize: 24, fontWeight: 700, color: NAVY,
        marginBottom: 18, lineHeight: 1.45,
      }}>
        {title}
      </h2>
      {intro && (
        <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.95, marginBottom: 20 }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

function NumberedList({ items }) {
  return (
    <ol style={{
      listStyle: 'none', padding: 0, margin: 0,
      fontSize: 16, lineHeight: 2, color: '#3a3a3a', counterReset: 'item',
    }}>
      {items.map((text, idx) => (
        <li key={idx} style={{ marginBottom: 10, paddingLeft: 28, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 0, top: 0,
            color: NAVY, fontWeight: 700,
          }}>
            {idx + 1}.
          </span>
          {text}
        </li>
      ))}
    </ol>
  )
}

export default function YouthPolicy() {
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
            YOUTH PROTECTION POLICY
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: -1, marginBottom: 18, color: GOLD,
          }}>
            🔒 청소년보호정책
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, opacity: 0.85, fontWeight: 300, marginBottom: 14 }}>
            청소년이 유해정보로부터 보호받을 수 있도록
          </p>
          <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 0.5 }}>
            시행일: 2026년 6월 8일
          </div>
        </div>
      </section>

      {/* 본문 */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>

        {/* 머리말 */}
        <section style={{ padding: '48px 0 8px' }}>
          <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.95, margin: 0 }}>
            이음미디어(이하 &apos;본 매체&apos;)는 「청소년 보호법」 및 관련 법령에 따라
            청소년이 유해한 정보로부터 보호받을 수 있도록 다음과 같이
            청소년보호정책을 수립·시행합니다.
          </p>
        </section>

        {/* 제1조 */}
        <Section
          title="제1조 (목적)"
          intro="본 정책은 청소년이 건전한 인격체로 성장할 수 있도록 본 매체가 청소년 유해정보로부터 청소년을 보호하기 위한 기준과 절차를 정함을 목적으로 합니다."
        />

        {/* 제2조 */}
        <Section
          title="제2조 (청소년 유해정보에 대한 기본방침)"
          intro="본 매체는 다음 사항을 기본방침으로 합니다."
        >
          <NumberedList items={BASIC_POLICIES} />
        </Section>

        {/* 제3조 */}
        <Section
          title="제3조 (청소년 유해정보로부터의 보호계획)"
          intro="본 매체는 청소년을 유해정보로부터 보호하기 위해 다음과 같이 노력합니다."
        >
          <NumberedList items={PROTECTION_PLANS} />
        </Section>

        {/* 제4조 */}
        <Section title="제4조 (유해정보 차단 및 관리 조치)">
          <NumberedList items={BLOCK_MEASURES} />
        </Section>

        {/* 제5조 */}
        <Section
          title="제5조 (청소년보호책임자의 지정)"
          intro="본 매체는 청소년보호 업무를 담당하는 청소년보호책임자를 다음과 같이 지정합니다."
        >
          <div style={{
            background: '#fff', borderLeft: `4px solid ${SUB}`,
            padding: '28px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, lineHeight: 1.95 }}>
              <tbody>
                <tr>
                  <th style={{ width: 120, textAlign: 'left', padding: '8px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>청소년보호책임자</th>
                  <td style={{ padding: '8px 0', color: NAVY, fontWeight: 700 }}>정세연</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>소속/직위</th>
                  <td style={{ padding: '8px 0' }}>이음미디어 편집인</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>연락처</th>
                  <td style={{ padding: '8px 0' }}>02-6956-0339</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>이메일</th>
                  <td style={{ padding: '8px 0' }}>press@eummedia.kr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 제6조 */}
        <Section
          title="제6조 (청소년 침해사고의 신고 및 상담)"
          intro="청소년 유해정보로 인한 피해 또는 불만이 있을 경우 아래로 연락하시면 신속히 처리해 드립니다."
        >
          <div style={{
            background: '#fafafa', border: '1px solid #e5e5e5',
            padding: '24px 28px', fontSize: 16, color: '#3a3a3a', lineHeight: 1.95,
            marginBottom: 24,
          }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 10 }}>
              이음미디어 청소년보호책임자
            </div>
            <div>📞 02-6956-0339</div>
            <div>📧 press@eummedia.kr</div>
          </div>

          <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.95, marginBottom: 16 }}>
            외부 기관 상담은 다음을 이용하실 수 있습니다.
          </p>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 15, lineHeight: 1.8, background: '#fff', border: '1px solid #e5e5e5',
          }}>
            <tbody>
              {EXTERNAL_AGENCIES.map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid #ebebeb' }}>
                  <th style={{
                    width: 240, textAlign: 'left', padding: '14px 20px',
                    background: '#fafafa', color: NAVY, fontWeight: 700,
                    borderRight: '1px solid #ebebeb', verticalAlign: 'top',
                  }}>{k}</th>
                  <td style={{ padding: '14px 20px', color: '#2a2a2a' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* 제7조 */}
        <Section title="제7조 (정책의 시행 및 변경)">
          <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.95, margin: 0 }}>
            본 청소년보호정책은 <strong>2026년 6월 8일</strong>부터 시행합니다.<br />
            정책 변경 시 본 페이지를 통해 공지합니다.
          </p>
        </Section>

        {/* 부칙 */}
        <section style={{ padding: '40px 0 80px', borderTop: '1px solid #e5e5e5' }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 14, lineHeight: 1.5 }}>
            부칙
          </h3>
          <p style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.95, margin: 0 }}>
            이 청소년보호정책은 <strong>2026년 6월 8일</strong>부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  )
}
