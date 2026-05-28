const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const GOLD = '#c9a84c'
const SUB = '#f0a882'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const PURPOSES = [
  { num: '①', title: '카카오 채널 구독', desc: '새 기사 알림 발송' },
  { num: '②', title: '시민기자 지원', desc: '지원자 심사 및 매체 참여' },
  { num: '③', title: '광고 문의', desc: '광고 상담 및 계약' },
  { num: '④', title: '제보', desc: '제보 처리 및 회신' },
  { num: '⑤', title: '회원가입·로그인', desc: '회원 서비스 제공' },
]

const COLLECTION_ITEMS = [
  ['카카오 구독', '카카오톡 채널 식별자 (카카오 측 자동 처리)'],
  ['시민기자 지원', '이름, 이메일, 연락처, 지원동기, 활동 가능 분야'],
  ['광고 문의', '이름, 이메일, 연락처, 회사명, 문의 내용'],
  ['제보', '이름, 이메일, 제보 내용, 첨부 파일(선택)'],
  ['회원가입', '이름, 이메일, 비밀번호(암호화 저장)'],
]

const RETENTION = [
  ['카카오 구독', '구독 해지 시점까지 (해지 즉시 파기)'],
  ['시민기자 지원', '지원 절차 종료 후 1년 (불합격 시 즉시 파기)'],
  ['광고 문의', '문의 처리 완료 후 3년 (계약 관련 필요 시)'],
  ['제보', '제보 처리 완료 후 3년 (법령에서 정한 기간)'],
  ['회원가입', '회원 탈퇴 시점까지 (탈퇴 즉시 파기)'],
]

const PROCESSORS = [
  ['Vercel', '사이트 호스팅'],
  ['Supabase', '데이터베이스 운영'],
  ['Kakao', '카카오 채널 메시지 발송'],
]

const RIGHTS = [
  '개인정보 열람 요구',
  '개인정보 정정·삭제 요구',
  '개인정보 처리정지 요구',
  '개인정보 동의철회',
]

const OPERATOR_INFO = [
  ['법인명', '주식회사 봉숭아학당문화혁신학교'],
  ['대표자', '성창운'],
  ['소재지', '서울시 관악구 남부순환로 1699 2층'],
  ['신문 등록번호', '서울 아56526'],
  ['이메일', 'press@eummedia.kr'],
  ['전화', '02-6956-0339'],
]

const REMEDY_AGENCIES = [
  ['개인정보 침해신고센터 (KISA)', 'privacy.kisa.or.kr', '118'],
  ['개인정보 분쟁조정위원회', 'www.kopico.go.kr', '1833-6972'],
  ['대검찰청 사이버범죄수사단', 'www.spo.go.kr', '1301'],
  ['경찰청 사이버수사국', 'ecrm.cyber.go.kr', '182'],
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
            이음미디어의 개인정보 처리 기준
          </p>
          <div style={{ fontSize: 13, opacity: 0.7, letterSpacing: 0.5 }}>
            시행일: 2026년 5월 17일
          </div>
        </div>
      </section>

      {/* 본문 */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px' }}>

        {/* 운영주체 / 처리자 정보 박스 */}
        <section style={{ padding: '40px 0 0' }}>
          <div style={{
            background: '#fff', borderLeft: `4px solid ${NAVY}`,
            padding: '24px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: NAVY,
              marginBottom: 14, lineHeight: 1.5,
            }}>
              📋 개인정보 처리자 정보
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, lineHeight: 1.9 }}>
              <tbody>
                {OPERATOR_INFO.map(([k, v], i) => (
                  <tr key={k} style={i < OPERATOR_INFO.length - 1 ? { borderBottom: '1px solid #ebebeb' } : undefined}>
                    <th style={{
                      width: 110, textAlign: 'left', padding: '8px 0',
                      color: '#6b6b6b', fontWeight: 500, verticalAlign: 'top',
                    }}>{k}</th>
                    <td style={{
                      padding: '8px 0',
                      color: k === '법인명' ? NAVY : '#2a2a2a',
                      fontWeight: k === '법인명' ? 700 : 400,
                    }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 섹션 1 */}
        <Section
          title="제1조 개인정보 처리 목적"
          intro="이음미디어는 다음 목적으로 개인정보를 수집·이용합니다."
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
          intro="이음미디어는 정보주체의 동의를 받은 범위 안에서 다음과 같이 개인정보를 보유·이용합니다."
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
          intro="이음미디어는 정보주체의 개인정보를 원칙적으로 외부에 제공하지 않습니다."
        >
          <div style={{ background: '#fff', borderLeft: `4px solid ${BLUE}`, padding: '20px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 14 }}>
              다만 다음의 경우에는 예외로 합니다.
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, lineHeight: 1.9, color: '#3a3a3a' }}>
              <li style={{ marginBottom: 8 }}>• 카카오 (구독 서비스 한정) — 채널 메시지 발송</li>
              <li style={{ marginBottom: 8 }}>• 법령에 따른 경우 — 수사기관·법원 요청</li>
              <li>• 정보주체 동의가 있는 경우 — 동의한 범위 내</li>
            </ul>
          </div>
        </Section>

        {/* 섹션 5 */}
        <Section
          title="제5조 개인정보 처리 위탁"
          intro="이음미디어는 서비스 운영을 위해 다음 업체에 개인정보 처리를 위탁하고 있습니다."
        >
          <InfoTable rows={PROCESSORS} />
          <p style={{ fontSize: 13, color: '#6b6b6b', margin: '16px 0 0' }}>
            수탁업체와는 개인정보 보호법 §26에 따른 위탁 계약을 체결하고 있습니다.
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
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 8 }}>신청 방법</div>
            <div>📧 press@eummedia.kr</div>
            <div>📞 02-6956-0339</div>
          </div>
        </Section>

        {/* 섹션 7 */}
        <Section
          title="제7조 개인정보보호 책임자"
          intro="이음미디어는 개인정보 처리 업무를 총괄하는 책임자를 지정하고 있습니다."
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

        {/* 섹션 8 — 파기 절차·방법 */}
        <Section title="제8조 (개인정보의 파기 절차 및 방법)">
          <p style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.9, marginBottom: 22 }}>
            이음미디어는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다.
          </p>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>① 파기 절차</h3>
            <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.95, margin: 0 }}>
              이용자가 제공한 정보는 목적 달성 후 내부 방침 및 관련 법령에 따라 일정 기간 저장 후 파기됩니다. 개인정보는 법령에 의한 경우를 제외하고 다른 목적으로 이용되지 않습니다.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 8 }}>② 파기 방법</h3>
            <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: 0, fontSize: 14, lineHeight: 1.95, color: '#3a3a3a' }}>
              <li style={{ marginBottom: 6 }}>전자적 파일 형태로 저장된 개인정보: 복구·재생이 불가능한 방법으로 영구 삭제</li>
              <li>종이 문서에 기록·저장된 개인정보: 분쇄기로 분쇄하거나 소각하여 파기</li>
            </ul>
          </div>
        </Section>

        {/* 섹션 9 — 안전성 확보 조치 */}
        <Section
          title="제9조 (개인정보의 안전성 확보 조치)"
          intro="이음미디어는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다."
        >
          <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: 0, fontSize: 14.5, lineHeight: 1.95, color: '#3a3a3a' }}>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: NAVY }}>접근 권한 관리</strong>: 개인정보를 처리하는 시스템에 대한 접근 권한을 업무 수행에 필요한 최소 범위로 부여·변경·말소합니다.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: NAVY }}>접속 기록 보관</strong>: 개인정보처리시스템에 대한 접속 기록을 최소 6개월 이상 보관·관리하며 위·변조 방지 조치를 합니다.
            </li>
            <li style={{ marginBottom: 10 }}>
              <strong style={{ color: NAVY }}>개인정보 암호화</strong>: 비밀번호 등 중요 개인정보는 암호화하여 저장·전송합니다.
            </li>
            <li>
              <strong style={{ color: NAVY }}>보안 프로그램 운용</strong>: Supabase(DB), Vercel(서버) 등 인프라 보안 정책을 준수하며 외부 침입 차단 조치를 운용합니다.
            </li>
          </ul>
        </Section>

        {/* 섹션 10 — 권익침해 구제방법 */}
        <Section
          title="제10조 (권익침해 구제방법)"
          intro="정보주체는 개인정보 침해로 인한 구제를 받기 위하여 아래 기관에 분쟁 해결이나 상담을 신청할 수 있습니다."
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontSize: 14, lineHeight: 1.7, background: '#fff', border: '1px solid #e5e5e5',
            }}>
              <thead style={{ background: '#fafafa' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb', borderRight: '1px solid #ebebeb' }}>기관</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb', borderRight: '1px solid #ebebeb' }}>홈페이지</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>전화</th>
                </tr>
              </thead>
              <tbody>
                {REMEDY_AGENCIES.map(([name, site, tel], i) => (
                  <tr key={name} style={i < REMEDY_AGENCIES.length - 1 ? { borderBottom: '1px solid #ebebeb' } : undefined}>
                    <td style={{ padding: '12px 16px', color: '#2a2a2a', borderRight: '1px solid #ebebeb' }}>{name}</td>
                    <td style={{ padding: '12px 16px', color: '#3a3a3a', borderRight: '1px solid #ebebeb' }}>{site}</td>
                    <td style={{ padding: '12px 16px', color: '#3a3a3a' }}>{tel}</td>
                  </tr>
                ))}
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
            개정이 있을 경우 사이트에 공지하며, 최소 7일의 사전 공지 기간을 둡니다.
          </p>
        </section>
      </div>
    </div>
  )
}
