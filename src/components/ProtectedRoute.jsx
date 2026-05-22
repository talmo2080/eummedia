import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', fontSize: '18px' }}>
      로딩 중...
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  // admin / publisher 는 모든 requiredRole 통과
  // writer 는 requiredRole === 'writer' 만 통과
  // reader 는 차단
  const role = profile?.role
  const passes =
    !requiredRole ||
    role === requiredRole ||
    role === 'admin' ||
    (role === 'publisher' && (requiredRole === 'admin' || requiredRole === 'writer'))

  if (!passes) {
    return (
      <div style={{
        maxWidth: '500px', margin: '80px auto', textAlign: 'center',
        padding: '40px', background: 'white', borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '22px', color: '#0d2d52', marginBottom: '12px', fontFamily: "'Noto Serif KR', serif" }}>
          접근 권한이 없습니다
        </h2>
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '24px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {role === 'reader'
            ? '편집국장 승인 후 기사를 작성할 수 있습니다.\n승인은 카카오톡으로 안내드립니다.'
            : '이 페이지는 편집국장·발행인만 접근할 수 있습니다.'}
        </p>
        <a href="/" style={{
          display: 'inline-block', padding: '14px 32px',
          background: '#0d2d52', color: 'white',
          borderRadius: '8px', fontSize: '18px', textDecoration: 'none',
          fontWeight: 700,
        }}>홈으로 가기</a>
      </div>
    )
  }

  return children
}
