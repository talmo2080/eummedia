import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function FindPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      setError('재설정 메일 발송에 실패했습니다. 이메일을 다시 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <main style={s.main}>
        <div style={s.card}>
          {sent ? (
            <>
              <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>📧</div>
              <h1 style={s.title}>재설정 메일 발송 완료</h1>
              <p style={s.subtitle}>
                <strong>{email}</strong>로 비밀번호 재설정 링크를 보냈습니다.<br />
                메일함을 확인해주세요.
              </p>
              <Link to="/login" style={s.btnLink}>로그인으로 돌아가기</Link>
            </>
          ) : (
            <>
              <h1 style={s.title}>비밀번호 찾기</h1>
              <p style={s.subtitle}>가입한 이메일을 입력하시면 재설정 링크를 보내드립니다.</p>

              {error && <div style={s.error}>{error}</div>}

              <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.field}>
                  <label style={s.label}>이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="가입 이메일 입력"
                    style={s.input}
                    required
                  />
                </div>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                  {loading ? '발송 중...' : '재설정 메일 보내기'}
                </button>
              </form>

              <div style={s.links}>
                <Link to="/login" style={s.link}>로그인</Link>
                <span style={s.dot}>·</span>
                <Link to="/register" style={s.link}>회원가입</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f5f7fa', fontFamily: "'Noto Sans KR',sans-serif", display: 'flex', flexDirection: 'column' },
  main: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { fontFamily: "'Noto Serif KR',serif", fontSize: '1.6rem', fontWeight: 700, color: '#0d2d52', margin: '0 0 8px', textAlign: 'center' },
  subtitle: { color: '#666', fontSize: '0.95rem', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.7 },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#444' },
  input: { border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: '0.95rem', outline: 'none', fontFamily: "'Noto Sans KR',sans-serif" },
  submitBtn: { background: '#0d2d52', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", marginTop: 4 },
  btnLink: { display: 'block', textAlign: 'center', background: '#0d2d52', color: '#fff', borderRadius: 10, padding: '13px', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', fontFamily: "'Noto Sans KR',sans-serif", marginTop: 12 },
  links: { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, alignItems: 'center' },
  link: { color: '#4a6fa5', fontSize: '0.85rem', textDecoration: 'none' },
  dot: { color: '#ccc' },
}
