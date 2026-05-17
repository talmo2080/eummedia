const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const GOLD = '#c9a84c'
const SUB = '#f0a882'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const PURPOSES = [
  { num: '①', title: '카카오 채널 구독', desc: '새 기사 알림 발송' },
  { num: '②', title: '시민기자 지원', desc: '지원자 영역 심사 + 매체 영역 참여' },
  { num: '③', title: '광고 문의', desc: '광고 영역 상담 + 광고 영역 계약' },
  { num: '④', title: '제보', desc: '제보 영역 처리 + 회신' },
  { num: '⑤', title: '회원가입·로그인', desc: '회원 서비스 영역 제공' },
]

const COLLECTION_ITEMS = [
  ['카카오 구독', '카카오톡 채널 식별자 (카카오 측 자동 처리)'],
  ['시민기자 지원', '이름, 이메일, 연락처, 지원동기, 활동 가능 영역'],
  ['광고 문의', '이름, 이메일, 연락처, 회사명, 문의 내용'],
  ['제보', '이름, 이메일, 제보 내용, 첨부 파일(선택)'],
  ['회원가입', '이름, 이메일, 비밀번호(암호화 저장)'],
]

const RETENTION = [
  ['카카오 구독', '구독 해지 시점까지 (해지 즉시 파기)'],
  ['시민기자 지원', '지원 영역 종료 후 1년 (불합격 시 즉시 파기)'],
  ['광고 문의', '문의 처리 완료 후 3년 (계약 영역 필요 시)'],
  ['제보', '제보 처리 완료 후 3년 (법령 정해진 기간)'],
  ['회원가입', '회원 탈퇴 시점까지 (탈퇴 즉시 파기)'],
]

const PROCESSORS = [
  ['Vercel', '사이트 호스팅'],
  ['Supabase', '데이터베이스 영역'],
  ['Kakao', '카카오 채널 메시지 발송 영역'],
]

const RIGHTS = [
  '개인정보 열람 요구',
  '개인정보 정정·삭제 요구',
  '개인정보 처리정지 요구',
  '개인정보 동의철회',
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
        <p style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.9, marginBottom: 20 }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

function InfoTable({ rows }) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse',
      fontSize: 14, lineHeight: 1.8, background: '#fff', border: '1px solid #e5e5e5',
    }}>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} style={{ borderBottom: '1px solid #ebebeb' }}>
            <th style={{
              width: 200, textAlign: 'left', padding: '14px 20px',
              background: '#fafafa', color: NAVY, fontWeight: 700,
              borderRight: '1px solid #ebebeb', verticalAlign: 'top',
            }}>{k}</th>
            <td style={{ padding: '14px 20px', color: '#2a2a2a' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Privacy() {
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
            PRIVACY POLICY
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 36, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: -1, marginBottom: 18, color: GOLD,
          }}>
            🔒 개인정보처리방침
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.9, opacity: 0.85, fontWeight: 300, marginBottom: 14 }}>
            이음미디어의 개인정보 처리 영역 정수
          </p>
          <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 0.5 }}>
            시행일: 2026년 5월 17일
          </div>
        </div>
      </section>

      {/* 본문 */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>

        {/* 섹션 1 */}
        <Section
          title="제1조 개인정보 처리 목적"
          intro="이음미디어는 다음 영역에서 개인정보를 수집·이용합니다."
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 15, lineHeight: 2, color: '#3a3a3a' }}>
            {PURPOSES.map(p => (
              <li key={p.num} style={{ marginBottom: 10 }}>
                <strong style={{ color: NAVY, marginRight: 10 }}>{p.num}</strong>
                <strong style={{ color: NAVY }}>{p.title}</strong>: {p.desc}
              </li>
            ))}
          </ul>
        </Section>

        {/* 섹션 2 */}
        <Section title="제2조 수집 항목">
          <InfoTable rows={COLLECTION_ITEMS} />
        </Section>

        {/* 섹션 3 */}
        <Section
          title="제3조 보유·이용 기간"
          intro="이음미디어는 정보주체의 동의를 받은 영역 범위 안에서 다음과 같이 개인정보를 보유·이용합니다."
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14.5, lineHeight: 2, color: '#3a3a3a' }}>
            {RETENTION.map(([area, period]) => (
              <li key={area} style={{ marginBottom: 10 }}>
                <strong style={{ color: NAVY, marginRight: 8 }}>{area}:</strong>
                {period}
              </li>
            ))}
          </ul>
        </Section>

        {/* 섹션 4 */}
        <Section
          title="제4조 제3자 제공"
          intro="이음미디어는 정보주체의 개인정보를 원칙적으로 외부 영역에 제공하지 않습니다."
        >
          <div style={{ background: '#fff', borderLeft: `4px solid ${BLUE}`, padding: '20px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 14 }}>
              다만 다음 영역은 예외 영역입니다.
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, lineHeight: 1.9, color: '#3a3a3a' }}>
              <li style={{ marginBottom: 8 }}>• 카카오 (구독 영역 한정) — 채널 메시지 발송 영역</li>
              <li style={{ marginBottom: 8 }}>• 법령 영역 — 수사기관·법원 요청 영역</li>
              <li>• 정보주체 동의 영역 — 동의 영역 범위 영역</li>
            </ul>
          </div>
        </Section>

        {/* 섹션 5 */}
        <Section
          title="제5조 개인정보 처리 위탁"
          intro="이음미디어는 서비스 영역을 위해 다음 영역에 개인정보 처리를 위탁하고 있습니다."
        >
          <InfoTable rows={PROCESSORS} />
          <p style={{ fontSize: 13, color: '#6b6b6b', margin: '16px 0 0' }}>
            수탁업체 영역 = 개인정보 보호법 §26 영역 정합 위탁 계약 영역.
          </p>
        </Section>

        {/* 섹션 6 */}
        <Section
          title="제6조 정보주체 권리"
          intro="정보주체는 언제든지 다음 권리를 행사할 수 있습니다."
        >
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', fontSize: 14.5, lineHeight: 2, color: '#3a3a3a' }}>
            {RIGHTS.map(r => (
              <li key={r} style={{ marginBottom: 6 }}>
                <strong style={{ color: NAVY, marginRight: 10 }}>•</strong>{r}
              </li>
            ))}
          </ul>
          <div style={{ background: '#fafafa', border: '1px solid #e5e5e5', padding: '20px 24px', fontSize: 14, color: '#3a3a3a', lineHeight: 1.9 }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>신청 영역</div>
            <div>📧 press@eummedia.kr</div>
            <div>📞 02-6956-0339</div>
          </div>
        </Section>

        {/* 섹션 7 */}
        <Section
          title="제7조 개인정보보호 책임자"
          intro="이음미디어는 개인정보 처리 영역을 총괄하는 책임자를 지정하고 있습니다."
        >
          <div style={{ background: '#fff', borderLeft: `4px solid ${SUB}`, padding: '28px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, lineHeight: 1.9 }}>
              <tbody>
                <tr>
                  <th style={{ width: 80, textAlign: 'left', padding: '6px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>이름</th>
                  <td style={{ padding: '6px 0', color: NAVY, fontWeight: 700 }}>정세연</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>직책</th>
                  <td style={{ padding: '6px 0' }}>편집국장 / 개인정보보호 책임자</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>이메일</th>
                  <td style={{ padding: '6px 0' }}>press@eummedia.kr</td>
                </tr>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top' }}>전화</th>
                  <td style={{ padding: '6px 0' }}>02-6956-0339</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* 부칙 */}
        <section style={{ padding: '40px 0 80px', borderTop: '1px solid #e5e5e5' }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 14, lineHeight: 1.5 }}>
            부칙
          </h3>
          <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.9, margin: 0 }}>
            이 개인정보처리방침은 <strong>2026년 5월 17일</strong>부터 시행됩니다.<br />
            개정 시점 영역 시 사이트 영역 공지 영역 + 최소 7일 영역.
          </p>
        </section>
      </div>
    </div>
  )
}
