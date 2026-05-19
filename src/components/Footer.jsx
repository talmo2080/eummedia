import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/about', label: '이음미디어 소개', icon: '📰' },
  { to: '/advertise', label: '광고문의', icon: '📢' },
  { to: '/citizen-reporter', label: '시민기자지원', icon: '✍️' },
  { to: '/report', label: '제보하기', icon: '🚨' },
  { to: '/subscribe', label: '구독신청', icon: '🔔' },
  { to: '/privacy', label: '개인정보처리방침', icon: '🔒' },
]

const GOLD = '#c9a84c'

export default function Footer() {
  return (
    <footer style={{
      marginTop: '80px',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      {/* ━━━━━━━━━━━ 데스크탑 (lg 이상) — 기존 푸터 ━━━━━━━━━━━ */}
      <div className="hidden lg:block" style={{ background: '#0d2d52', color: '#ccc', padding: '56px 0 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* 상단 3열 */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          style={{ marginBottom: '40px' }}
        >

          {/* [A] 로고 영역 (좌측) */}
          <div>
            <img src="/logo.png" alt="이음미디어 로고" style={{
              height: 64, width: 'auto', objectFit: 'contain',
              display: 'block', marginBottom: 16,
            }} />
            <div style={{
              color: GOLD, fontSize: 22, fontWeight: 700,
              fontFamily: "'Noto Serif KR', serif",
              letterSpacing: 1, marginBottom: 4,
            }}>
              이음미디어
            </div>
            <div style={{
              opacity: 0.5, fontSize: 10, letterSpacing: 3, marginBottom: 10,
            }}>
              E-UM MEDIA
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.7, opacity: 0.7, margin: 0,
            }}>
              세상과 당신을 잇는<br />인터넷신문
            </p>
          </div>

          {/* [B] 바로가기 영역 (중앙) */}
          <div>
            <h4 style={{
              color: GOLD, fontSize: 14, fontWeight: 700,
              letterSpacing: 1.5, marginBottom: 18, marginTop: 0,
            }}>
              바로가기
            </h4>
            {QUICK_LINKS.map(item => (
              <div key={item.to} style={{ marginBottom: 12 }}>
                <Link to={item.to}
                  style={{
                    color: '#bbb', fontSize: 13,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#bbb' }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </div>
            ))}
          </div>

          {/* [C] 매체 정보 영역 (우측, 통합) */}
          <div>
            <h4 style={{
              color: GOLD, fontSize: 14, fontWeight: 700,
              letterSpacing: 1.5, marginBottom: 18, marginTop: 0,
            }}>
              매체 정보
            </h4>

            {/* 등록번호 강조 */}
            <div style={{
              fontSize: 13, fontWeight: 600, opacity: 0.95, marginBottom: 12,
            }}>
              등록번호: 서울,아56526
            </div>

            {/* 인물 영역 (3행) */}
            <table style={{
              borderCollapse: 'collapse', marginBottom: 16,
              fontSize: 12.5, opacity: 0.8,
            }}>
              <tbody>
                <tr>
                  <td style={{ width: 60, padding: '3px 0', opacity: 0.7 }}>발행인</td>
                  <td style={{ padding: '3px 0' }}>성창운</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', opacity: 0.7 }}>편집인</td>
                  <td style={{ padding: '3px 0' }}>정세연</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', opacity: 0.7 }}>대표</td>
                  <td style={{ padding: '3px 0' }}>최일례</td>
                </tr>
              </tbody>
            </table>

            {/* 이메일 */}
            <div style={{ fontSize: 12.5, opacity: 0.8, marginBottom: 8 }}>
              📧 press@eummedia.kr
            </div>

            {/* 주소 */}
            <div style={{
              fontSize: 12.5, opacity: 0.8, lineHeight: 1.7, marginBottom: 12,
            }}>
              📍 서울특별시 관악구<br />
              &nbsp;&nbsp;&nbsp;&nbsp;남부순환로 1699 2층
            </div>

            {/* 법인 */}
            <div style={{ fontSize: 11, opacity: 0.55 }}>
              주식회사 봉숭아학당문화혁신학교
            </div>
          </div>
        </div>

        {/* [D] 하단 저작권 영역 */}
        <div style={{
          borderTop: '1px solid #1e4a7a',
          paddingTop: 24,
          fontSize: 12,
          opacity: 0.5,
          textAlign: 'center',
        }}>
          © 2026 이음미디어. All rights reserved.
        </div>
      </div>
      </div>

      {/* ━━━━━━━━━━━ 모바일·태블릿 (lg 미만) — 신문형 푸터 (2색 분할) ━━━━━━━━━━━ */}
      <div className="lg:hidden">

        {/* === 상단 영역: 다크 네이비 === */}
        <div className="bg-[#0d2d52] text-white py-10 px-6 text-center">

          {/* 섹션 1. 독자공간 */}
          <div className="mb-8">
            <h3 className="inline-block bg-white/10 text-white rounded-full px-4 py-1 text-sm font-bold mb-4">
              독자공간
            </h3>
            <nav className="text-sm leading-loose">
              <Link to="/report" className="mx-1.5">기사제보</Link>
              <Link to="/citizen-reporter" className="mx-1.5">시민기자신청</Link>
              <Link to="/advertise" className="mx-1.5">광고문의</Link>
              <br />
              <Link to="/terms" className="mx-1.5">이용약관</Link>
              <Link to="/privacy" className="mx-1.5 font-bold">개인정보처리방침</Link>
              <Link to="/youth" className="mx-1.5">청소년보호정책</Link>
            </nav>
          </div>

          <div className="border-t border-white/20 mx-auto max-w-xs mb-8"></div>

          {/* 섹션 2. 회사소개 */}
          <div className="mb-8">
            <h3 className="inline-block bg-white/10 text-white rounded-full px-4 py-1 text-sm font-bold mb-4">
              회사소개
            </h3>
            <nav className="text-sm leading-loose">
              <Link to="/about" className="mx-1.5">회사소개</Link>
              <Link to="/about#editorial" className="mx-1.5">편집국 소개</Link>
              <Link to="/advertise" className="mx-1.5">광고안내</Link>
            </nav>
          </div>

          <div className="border-t border-white/20 mx-auto max-w-xs mb-8"></div>

          {/* 섹션 3. 구독 신청 CTA */}
          <div>
            <Link
              to="/subscribe"
              className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-md transition-colors"
            >
              📋 구독 신청하기
            </Link>
          </div>
        </div>

        {/* === 하단 영역: 연회색 === */}
        <div className="bg-neutral-50 text-neutral-700 py-10 px-6 text-center">

          {/* 섹션 4. 로고 + 매체명 */}
          <div className="mb-6">
            <div className="inline-block bg-[#0d2d52] rounded-md px-3 py-1.5 mb-3">
              <span className="text-white font-bold text-lg tracking-tight">EM</span>
            </div>
            <h2 className="font-serif font-bold text-xl text-neutral-900">이음미디어</h2>
          </div>

          {/* 섹션 5. 회사 정보 */}
          <div className="text-sm space-y-1 leading-relaxed mb-6 text-neutral-600">
            <p>서울시 관악구 남부순환로 1699, 2층</p>
            <p>제보·광고문의: 02-6956-0339</p>
            <p>인터넷신문 등록일: 2026년 4월 27일</p>
            <p>등록번호: 서울, 아56526</p>
            <p>E-mail: press@eummedia.kr</p>
          </div>

          {/* 섹션 6. 신문법 표기 (절대 순서) */}
          <div className="text-sm space-y-0.5 leading-relaxed mb-6 text-neutral-700">
            <p>발행인: 성창운</p>
            <p>편집인: 정세연</p>
            <p>대표: 최일례</p>
            <p>청소년보호책임자: 정세연</p>
          </div>

          {/* 섹션 7. 저작권 */}
          <div className="text-xs leading-relaxed text-neutral-500">
            <p>Copyright © 2026 eummedia.kr</p>
            <p>All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
