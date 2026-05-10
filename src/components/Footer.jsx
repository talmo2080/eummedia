import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: '#0d2d52',
      color: '#ccc',
      padding: '48px 0 24px',
      marginTop: '80px',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* 상단 3열 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '40px',
          marginBottom: '40px'
        }}>

          {/* 로고 + 슬로건 */}
          <div>
            <div style={{
              color: '#c9a84c',
              fontSize: '22px',
              fontWeight: '700',
              fontFamily: "'Noto Serif KR', serif",
              marginBottom: '10px'
            }}>
              이음미디어
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#aaa' }}>
              세상과 당신을 잇는<br />주간인터넷신문
            </p>
          </div>

          {/* 바로가기 */}
          <div>
            <h4 style={{ color: '#c9a84c', fontSize: '14px', marginBottom: '14px' }}>바로가기</h4>
            {[
              { to: '/about', label: '이음미디어 소개' },
              { to: '/advertise', label: '광고문의' },
              { to: '/citizen-reporter', label: '시민기자지원' },
              { to: '/report', label: '제보하기' },
              { to: '/subscribe', label: '구독신청' },
            ].map(item => (
              <div key={item.to} style={{ marginBottom: '8px' }}>
                <Link to={item.to} style={{ color: '#bbb', fontSize: '13px', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          {/* 연락처 */}
          <div>
            <h4 style={{ color: '#c9a84c', fontSize: '14px', marginBottom: '14px' }}>연락처</h4>
            <p style={{ fontSize: '13px', lineHeight: '2', color: '#aaa' }}>
              이메일: press@eummedia.kr<br />
              서울특별시 관악구<br />
              남부순환로 1699 2층
            </p>
          </div>
        </div>

        {/* 하단 법적 정보 */}
        <div style={{
          borderTop: '1px solid #1e4a7a',
          paddingTop: '20px',
          fontSize: '14px',
          color: '#888',
          lineHeight: '2'
        }}>
          <p>등록번호: 서울,아56526 | 이음미디어</p>
          <p>발행인 성창운 | 편집인 정세연 | 대표 최일례</p>
          <p>주소: 서울특별시 관악구 남부순환로 1699 2층</p>
          <p style={{ marginTop: '8px' }}>
            © 2026 이음미디어. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
