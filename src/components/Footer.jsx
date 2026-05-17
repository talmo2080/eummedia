import { Link } from 'react-router-dom'

const QUICK_LINKS = [
  { to: '/about', label: '이음미디어 소개', icon: '📰' },
  { to: '/advertise', label: '광고문의', icon: '📢' },
  { to: '/citizen-reporter', label: '시민기자지원', icon: '✍️' },
  { to: '/report', label: '제보하기', icon: '🚨' },
  { to: '/subscribe', label: '구독신청', icon: '🔔' },
]

const GOLD = '#c9a84c'

export default function Footer() {
  return (
    <footer style={{
      background: '#0d2d52',
      color: '#ccc',
      padding: '56px 0 24px',
      marginTop: '80px',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* 상단 3열 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>

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
    </footer>
  )
}
