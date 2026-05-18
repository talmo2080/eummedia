import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const GREEN = '#1a6b3c'
const ORANGE = '#c45c0a'
const GOLD = '#c9a84c'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${da} ${h}:${mi}`
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

function dbDateToShort(s) {
  if (!s) return ''
  return s.length >= 10 ? s.slice(2, 10) : s
}

function getExpiryStatus(validUntil) {
  if (!validUntil) return 'none'
  const expiry = new Date(validUntil)
  if (isNaN(expiry.getTime())) return 'none'
  const now = new Date()
  const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'warning'
  return 'valid'
}

function getUserStatus(u) {
  if (u.role === 'reader') return 'pending'
  return u.is_active ? 'active' : 'suspended'
}

const ARTICLE_STATUS_LABELS = {
  submitted: { label: '검토대기', color: RED, bg: '#fef0ef' },
  rejected: { label: '반려됨', color: ORANGE, bg: '#fff8f0' },
  published: { label: '발행됨', color: GREEN, bg: '#eef7f2' },
}

const USER_STATUS_LABELS = {
  pending: { label: '승인대기', color: RED, bg: '#fef0ef' },
  active: { label: '활동중', color: GREEN, bg: '#eef7f2' },
  suspended: { label: '정지됨', color: '#888', bg: '#f0f0f0' },
}

const CHANNEL_STATS = [
  { name: '이음매거진', count: 12 },
  { name: '이음피플', count: 9 },
  { name: '이음로컬', count: 7 },
  { name: '이음에듀', count: 6 },
  { name: '이음트렌드', count: 4 },
  { name: '이음보이스', count: 2 },
  { name: '이음뷰', count: 1 },
]

const TABS = [
  { num: 1, icon: '📰', label: '기사 관리' },
  { num: 2, icon: '👥', label: '시민기자 관리' },
  { num: 3, icon: '📊', label: '통계' },
  { num: 4, icon: '⚙️', label: '설정' },
]

const ARTICLE_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'submitted', label: '검토대기 🔴' },
  { key: 'rejected', label: '반려됨' },
  { key: 'published', label: '발행됨' },
]

const USER_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '승인대기 🔴' },
  { key: 'active', label: '활동중' },
  { key: 'suspended', label: '정지됨' },
]

const card = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '20px',
  marginBottom: 16,
}

function btnStyle(color, outline = false) {
  return {
    padding: '12px 18px', fontSize: 15, fontWeight: 700,
    fontFamily: SANS,
    background: outline ? '#fff' : color,
    color: outline ? color : '#fff',
    border: outline ? `1px solid ${color}` : 'none',
    borderRadius: 8,
    cursor: 'pointer', transition: 'all 0.15s',
  }
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      padding: '24px 20px', textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 14, color: '#666', marginBottom: 8, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{
        fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: color,
      }}>
        {value}
      </div>
    </div>
  )
}

function SquareCards({ article, dateShort }) {
  const size = 340
  return (
    <>
      {/* 카드 1 — 표지 */}
      <div style={{ position: 'relative', width: size, height: size, borderRadius: 12, overflow: 'hidden' }}>
        <img src={article.thumb} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 12, background: 'linear-gradient(rgba(13,45,82,0.7), transparent)' }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>이음미디어</div>
          <div style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>{article.channel}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
          <div style={{ color: '#fff', fontSize: 17, fontWeight: 700, lineHeight: 1.4, marginBottom: 6 }}>{article.title}</div>
          <div style={{ color: '#fff', fontSize: 12 }}>{dateShort}</div>
        </div>
      </div>

      {/* 카드 2 — 핵심 내용 */}
      <div style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #e5e5e5', padding: 16, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ background: NAVY, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 10 }}>{article.channel}</div>
          <div style={{ color: NAVY, fontSize: 14, fontWeight: 700 }}>이음미디어</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: NAVY, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>📌 핵심 요약</div>
          <div style={{ fontSize: 15, color: '#333', lineHeight: 1.8 }}>{article.summary}</div>
          <div style={{ borderTop: '1px solid #e0e0e0', margin: '12px 0' }} />
          <div style={{ fontSize: 13, color: '#666' }}>글 · {article.reporter} 시민기자</div>
        </div>
        <div style={{ textAlign: 'center', color: NAVY, fontSize: 14, fontWeight: 700, marginTop: 8 }}>
          eummedia.kr 에서 전문 보기 👆
        </div>
      </div>

      {/* 카드 3 — 마무리 */}
      <div style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(135deg, #0d2d52 0%, #1c4f8a 100%)', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>이음미디어</div>
          <div style={{ color: '#fff', fontSize: 11, letterSpacing: '0.2em', marginTop: 4 }}>E·UM MEDIA</div>
        </div>
        <div style={{ textAlign: 'center', lineHeight: 1.7 }}>
          <div style={{ color: '#fff', fontSize: 13 }}>세상을 잇고, 당신을 잇는</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>인터넷신문 이음미디어</div>
          <div style={{ color: '#f0a882', fontSize: 15, fontWeight: 700, marginTop: 4 }}>eummedia.kr</div>
        </div>
        <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ color: '#fff', fontSize: 11 }}>#이음미디어 #인터넷신문 #고양시</div>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginTop: 4 }}>팔로우 & 구독하기 ❤️</div>
        </div>
      </div>
    </>
  )
}

function StoryCards({ article }) {
  const w = 202, h = 360
  return (
    <>
      {/* 카드 1 — 표지 세로형 */}
      <div style={{ position: 'relative', width: w, height: h, borderRadius: 12, overflow: 'hidden' }}>
        <img src={article.thumb} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 0%, rgba(13,45,82,0.2) 35%, rgba(13,45,82,0.92) 100%)' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, color: '#fff', fontSize: 13, fontWeight: 700 }}>이음미디어</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 14px 14px' }}>
          <div style={{ color: '#fff', fontSize: 19, fontWeight: 700, lineHeight: 1.4, marginBottom: 8 }}>{article.title}</div>
          <div style={{ display: 'inline-block', border: '1px solid #fff', color: '#fff', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>{article.channel}</div>
          <div style={{ color: '#fff', fontSize: 13, marginTop: 6 }}>{article.reporter} 시민기자</div>
          <div style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>자세히 보기 → eummedia.kr</div>
          <div style={{ color: '#fff', fontSize: 11 }}>👆 프로필 링크</div>
        </div>
      </div>

      {/* 카드 2 — 핵심 내용 세로형 */}
      <div style={{ width: w, height: h, borderRadius: 12, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: NAVY, fontSize: 14, fontWeight: 700 }}>이음미디어</div>
          <div style={{ background: NAVY, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10 }}>{article.channel}</div>
        </div>
        <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: NAVY, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>📌 핵심 요약</div>
          <div style={{ fontSize: 15, color: '#333', lineHeight: 2.0 }}>{article.summary}</div>
          <div style={{ borderTop: '1px solid #e0e0e0', margin: '10px 0' }} />
          <div style={{ fontSize: 13, color: '#666' }}>{article.reporter} 시민기자</div>
        </div>
        <div style={{ background: NAVY, padding: 10, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 12 }}>더 자세한 내용은</div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 2 }}>👆 프로필 링크 클릭</div>
          <div style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>eummedia.kr</div>
        </div>
      </div>

      {/* 카드 3 — 마무리 세로형 */}
      <div style={{ width: w, height: h, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(180deg, #f9f8f6 0%, #eef3fa 55%, #0d2d52 100%)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flexBasis: '35%', textAlign: 'center', paddingTop: 24, boxSizing: 'border-box' }}>
          <div style={{ color: NAVY, fontSize: 24, fontWeight: 700 }}>이음미디어</div>
          <div style={{ color: '#1c4f8a', fontSize: 10, letterSpacing: '0.2em', marginTop: 4 }}>E·UM MEDIA</div>
        </div>
        <div style={{ flexBasis: '30%', textAlign: 'center', lineHeight: 1.7 }}>
          <div style={{ color: NAVY, fontSize: 14 }}>세상을 잇고, 당신을 잇는</div>
          <div style={{ color: NAVY, fontSize: 17, fontWeight: 700 }}>인터넷신문 이음미디어</div>
          <div style={{ color: '#1c4f8a', fontSize: 14 }}>eummedia.kr</div>
        </div>
        <div style={{ flexBasis: '35%', background: NAVY, padding: 14, textAlign: 'center', boxSizing: 'border-box' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>팔로우 & 구독하기 ❤️</div>
          <div style={{ color: '#fff', fontSize: 11, marginTop: 6 }}>#이음미디어 #인터넷신문 #고양시</div>
          <div style={{ color: '#fff', fontSize: 10, marginTop: 4, opacity: 0.8 }}>매주 토요일 카카오 채널 발송</div>
        </div>
      </div>
    </>
  )
}

function CardNewsModal({ article, onClose }) {
  const [tab, setTab] = useState('square')
  if (!article) return null

  const isSquare = tab === 'square'
  const dateShort = article.submittedAt?.slice(0, 10)

  const tabBtnStyle = (active) => ({
    flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 700,
    fontFamily: SANS, cursor: 'pointer', lineHeight: 1.35,
    background: active ? NAVY : '#f0f0f0',
    color: active ? '#fff' : '#888',
    border: 'none', borderRadius: 8,
  })

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', maxWidth: 460, width: '100%',
        maxHeight: '85vh', overflowY: 'auto',
        borderRadius: 12, padding: 24, boxSizing: 'border-box',
        position: 'relative',
      }}>
        <button onClick={onClose} aria-label="닫기" style={{
          position: 'absolute', top: 10, right: 10,
          width: 36, height: 36, border: 'none', background: 'transparent',
          fontSize: 22, cursor: 'pointer', color: '#666', lineHeight: 1,
        }}>✕</button>

        <h2 style={{
          fontFamily: SERIF, fontSize: 20, fontWeight: 700,
          color: NAVY, margin: '0 0 16px 0', textAlign: 'center',
        }}>
          📱 카드뉴스 & 스토리/릴스 만들기
        </h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setTab('square')} style={tabBtnStyle(isSquare)}>📱 카드뉴스 1:1<br/>(이음미디어용)</button>
          <button onClick={() => setTab('story')} style={tabBtnStyle(!isSquare)}>📖 스토리/릴스 9:16<br/>(인스타·숏폼용)</button>
        </div>

        <div style={{ fontSize: 14, color: '#888', marginBottom: 12, textAlign: 'center' }}>
          {isSquare ? '이음미디어 기사 하단 + 인스타 피드용' : '인스타 스토리 + 릴스 + 유튜브쇼츠 + 틱톡용'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          {isSquare
            ? <SquareCards article={article} dateShort={dateShort} />
            : <StoryCards article={article} />}
        </div>

        <button onClick={() => alert(isSquare
          ? '이음미디어 카드뉴스(1:1) 저장 기능은 추후 업데이트됩니다.\n현재는 화면 캡처를 이용해주세요.'
          : '인스타 스토리/릴스용(9:16) 저장 기능은 추후 업데이트됩니다.\n현재는 화면 캡처를 이용해주세요.'
        )} style={{
          width: '100%', height: 48, fontSize: 16, fontWeight: 700,
          background: isSquare ? NAVY : RED, color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: SANS,
        }}>
          {isSquare ? '💾 카드뉴스 저장 (1:1)' : '💾 스토리/릴스용 저장 (9:16)'}
        </button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(1)
  const [articles, setArticles] = useState([])
  const [users, setUsers] = useState([])
  const [articleFilter, setArticleFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvedId, setApprovedId] = useState(null)
  const [approvedUserId, setApprovedUserId] = useState(null)
  const [modalArticle, setModalArticle] = useState(null)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, channels(name)')
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
      if (error) { console.error('articles fetch:', error); return }
      setArticles(data || [])
    })()
    ;(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) { console.error('users fetch:', error); return }
      setUsers(data || [])
    })()
  }, [])

  const switchTab = (n) => {
    setActiveTab(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredArticles = articleFilter === 'all'
    ? articles
    : articles.filter(a => a.status === articleFilter)
  const filteredUsers = userFilter === 'all'
    ? users
    : users.filter(u => getUserStatus(u) === userFilter)

  const approveArticle = async (id) => {
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('articles')
      .update({ status: 'published', published_at: nowIso })
      .eq('id', id)
    if (error) { alert(`승인 실패: ${error.message}`); return }
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'published', published_at: nowIso } : a))
    setApprovedId(id)
  }
  const startReject = (id) => { setRejectingId(id); setRejectReason('') }
  const confirmReject = async (id) => {
    const reason = rejectReason.trim() || null
    const { error } = await supabase
      .from('articles')
      .update({ status: 'rejected', reject_reason: reason })
      .eq('id', id)
    if (error) { alert(`반려 실패: ${error.message}`); return }
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'rejected', reject_reason: reason } : a))
    setRejectingId(null); setRejectReason('')
  }
  const cancelReject = () => { setRejectingId(null); setRejectReason('') }
  const reReview = async (id) => {
    const { error } = await supabase
      .from('articles')
      .update({ status: 'submitted', reject_reason: null })
      .eq('id', id)
    if (error) { alert(`재검토 실패: ${error.message}`); return }
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'submitted', reject_reason: null } : a))
  }
  const approveUser = async (id) => {
    const today = new Date()
    const oneYearLater = new Date(today)
    oneYearLater.setFullYear(today.getFullYear() + 1)
    oneYearLater.setDate(today.getDate() - 1)
    const yy = String(today.getFullYear()).slice(2)
    const activeCount = users.filter(u => u.press_no).length
    const nextNo = `${yy}-${String(activeCount + 1).padStart(3, '0')}`
    const validFromIso = isoDate(today)
    const validUntilIso = isoDate(oneYearLater)

    const { error } = await supabase
      .from('users')
      .update({
        role: 'writer',
        is_active: true,
        press_no: nextNo,
        valid_from: validFromIso,
        valid_until: validUntilIso,
      })
      .eq('id', id)
    if (error) { alert(`승인 실패: ${error.message}`); return }

    setUsers(users.map(u => u.id === id ? {
      ...u, role: 'writer', is_active: true,
      press_no: nextNo,
      valid_from: validFromIso,
      valid_until: validUntilIso,
    } : u))
    setApprovedUserId(id)
  }
  const renewUser = async (id) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    const expiry = user.valid_until ? new Date(user.valid_until) : new Date()
    const newExpiry = new Date(expiry)
    newExpiry.setFullYear(expiry.getFullYear() + 1)
    const newIso = isoDate(newExpiry)

    const { error } = await supabase
      .from('users')
      .update({ valid_until: newIso })
      .eq('id', id)
    if (error) { alert(`갱신 실패: ${error.message}`); return }

    setUsers(users.map(u => u.id === id ? { ...u, valid_until: newIso } : u))
    alert('자격이 1년 갱신됐습니다!')
  }
  const rejectUser = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
    if (error) { alert(`반려 실패: ${error.message}`); return }
    setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u))
    alert('반려됐습니다.')
  }
  const suspendUser = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
    if (error) { alert(`정지 실패: ${error.message}`); return }
    setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u))
  }
  const reactivateUser = async (id) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id)
    if (error) { alert(`재활성화 실패: ${error.message}`); return }
    setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u))
  }

  const maxChannelCount = Math.max(...CHANNEL_STATS.map(c => c.count))

  return (
    <div style={{ background: '#f9f8f6', fontFamily: SANS, minHeight: '100vh' }}>
      {/* 탭 영역 (sticky) */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = activeTab === t.num
            return (
              <button key={t.num} type="button" onClick={() => switchTab(t.num)}
                style={{
                  flex: 1, height: 56, fontSize: 18, fontWeight: 700,
                  fontFamily: SANS,
                  background: active ? NAVY : '#f0f0f0',
                  color: active ? '#fff' : '#888',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ━━ 탭 1: 기사 관리 ━━ */}
        {activeTab === 1 && (
          <div>
            <h1 style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 700,
              color: NAVY, margin: '0 0 20px 0', lineHeight: 1.4,
            }}>
              📰 기사 관리
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {ARTICLE_FILTERS.map(f => {
                const sel = articleFilter === f.key
                return (
                  <button key={f.key} type="button" onClick={() => setArticleFilter(f.key)}
                    style={{
                      padding: '10px 16px', fontSize: 15, fontWeight: 600,
                      fontFamily: SANS,
                      background: sel ? NAVY : '#fff',
                      color: sel ? '#fff' : '#3a3a3a',
                      border: `1px solid ${sel ? NAVY : '#d0d0d0'}`,
                      borderRadius: 24,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {f.label}
                  </button>
                )
              })}
            </div>

            {filteredArticles.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: '#888', fontSize: 18, padding: 40 }}>
                해당 상태의 기사가 없습니다.
              </div>
            )}
            {filteredArticles.map(a => {
              const sb = ARTICLE_STATUS_LABELS[a.status] || { label: a.status, color: '#888', bg: '#f0f0f0' }
              const showApprovedBanner = approvedId === a.id && a.status === 'published'
              const isRejecting = rejectingId === a.id
              const completeness = a.status === 'draft' ? 0 : 15
              return (
                <div key={a.id} style={card}>
                  {showApprovedBanner && (
                    <div style={{
                      background: '#eef7f2', borderRadius: 8,
                      padding: '12px 16px', marginBottom: 14,
                      fontSize: 16, color: GREEN, fontWeight: 600,
                    }}>
                      ✅ 발행됐습니다! 이제 카드뉴스를 만들어보세요.
                    </div>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 13, marginBottom: 10, flexWrap: 'wrap',
                  }}>
                    <span style={{
                      background: '#eef3fa', color: NAVY, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12,
                    }}>{a.channels?.name || '-'}</span>
                    <span style={{
                      background: sb.bg, color: sb.color, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12,
                    }}>{sb.label}</span>
                    <span style={{ color: '#888', marginLeft: 'auto' }}>{formatDateTime(a.created_at)}</span>
                  </div>

                  <div style={{
                    fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                    color: '#1a1a1a', marginBottom: 10, lineHeight: 1.5,
                  }}>
                    {a.title}
                  </div>

                  <div style={{ fontSize: 15, color: '#666', marginBottom: 12 }}>
                    기자: <strong style={{ color: '#1a1a1a' }}>{a.author_name || '-'}</strong>
                    {' · '}
                    완성도: <strong style={{
                      color: completeness === 15 ? GREEN : (completeness >= 12 ? BLUE : ORANGE),
                    }}>{completeness}/15</strong>
                  </div>

                  <div style={{
                    fontSize: 15, color: '#3a3a3a', lineHeight: 1.7,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {a.summary}
                  </div>

                  {isRejecting && (
                    <div style={{
                      background: '#fff8f0', borderLeft: `4px solid ${ORANGE}`,
                      borderRadius: 8, padding: 16, marginBottom: 16,
                    }}>
                      <textarea style={{
                        width: '100%', height: 100, padding: 12,
                        border: '1px solid #d0d0d0', borderRadius: 8,
                        fontSize: 18, fontFamily: SANS, resize: 'none',
                        boxSizing: 'border-box', lineHeight: 1.6,
                      }}
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="시민기자에게 전달할 수정 요청 내용을 입력하세요" />
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button onClick={() => confirmReject(a.id)}
                          style={{
                            padding: '10px 20px', fontSize: 15, fontWeight: 700,
                            background: ORANGE, color: '#fff', border: 'none', borderRadius: 8,
                            cursor: 'pointer', fontFamily: SANS,
                          }}>
                          반려 확인
                        </button>
                        <button onClick={cancelReject}
                          style={{
                            padding: '10px 20px', fontSize: 15, fontWeight: 600,
                            background: '#fff', color: '#666', border: '1px solid #d0d0d0', borderRadius: 8,
                            cursor: 'pointer', fontFamily: SANS,
                          }}>
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {!isRejecting && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {a.status === 'submitted' && (
                        <>
                          <button onClick={() => approveArticle(a.id)} style={btnStyle(GREEN)}>✅ 승인·발행</button>
                          <button onClick={() => startReject(a.id)} style={btnStyle(ORANGE)}>❌ 반려</button>
                          <button onClick={() => alert(`미리보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                      {a.status === 'published' && (
                        <>
                          <button onClick={() => setModalArticle({
                            ...a,
                            thumb: a.thumbnail_url,
                            channel: a.channels?.name || '',
                            reporter: a.author_name || '',
                            submittedAt: formatDateTime(a.created_at),
                          })} style={btnStyle(NAVY)}>🖼 카드뉴스 만들기</button>
                          <button onClick={() => alert(`기사 보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 기사 보기</button>
                        </>
                      )}
                      {a.status === 'rejected' && (
                        <>
                          <button onClick={() => reReview(a.id)} style={btnStyle(BLUE)}>🔄 재검토</button>
                          <button onClick={() => alert(`미리보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ━━ 탭 2: 시민기자 관리 ━━ */}
        {activeTab === 2 && (
          <div>
            <h1 style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 700,
              color: NAVY, margin: '0 0 20px 0', lineHeight: 1.4,
            }}>
              👥 시민기자 관리
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {USER_FILTERS.map(f => {
                const sel = userFilter === f.key
                return (
                  <button key={f.key} type="button" onClick={() => setUserFilter(f.key)}
                    style={{
                      padding: '10px 16px', fontSize: 15, fontWeight: 600,
                      fontFamily: SANS,
                      background: sel ? NAVY : '#fff',
                      color: sel ? '#fff' : '#3a3a3a',
                      border: `1px solid ${sel ? NAVY : '#d0d0d0'}`,
                      borderRadius: 24,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {f.label}
                  </button>
                )
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: '#888', fontSize: 18, padding: 40 }}>
                해당 상태의 시민기자가 없습니다.
              </div>
            )}
            {filteredUsers.map(u => {
              const ustatus = getUserStatus(u)
              const sb = USER_STATUS_LABELS[ustatus] || { label: ustatus, color: '#888', bg: '#f0f0f0' }
              const showApprovedBanner = approvedUserId === u.id && ustatus === 'active'
              const expiryStatus = getExpiryStatus(u.valid_until)
              const expiryColor = expiryStatus === 'expired' ? RED : (expiryStatus === 'warning' ? ORANGE : '#3a3a3a')
              const expiryLabel = expiryStatus === 'expired'
                ? '🔴 자격 만료'
                : (expiryStatus === 'warning' ? '⚠️ 갱신 필요' : '')
              const agreed = !!u.press_no
              return (
                <div key={u.id} style={card}>
                  {showApprovedBanner && (
                    <div style={{
                      background: '#eef7f2', borderRadius: 8,
                      padding: '14px 18px', marginBottom: 14,
                      fontSize: 16, color: GREEN, fontWeight: 600, lineHeight: 1.7,
                    }}>
                      ✅ 승인됐습니다! 기자증 번호: <strong>이음미디어/No. {u.press_no}</strong><br />
                      유효기간: {dbDateToShort(u.valid_from)} ~ {dbDateToShort(u.valid_until)}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 10, flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: NAVY,
                    }}>{u.nickname || '(이름 없음)'}</span>
                    <span style={{
                      background: sb.bg, color: sb.color, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12, fontSize: 13,
                    }}>{sb.label}</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>
                      신청일: {dbDateToShort(u.created_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.7, marginBottom: 12 }}>
                    {u.bio}
                  </div>

                  {/* 기자증 영역 (활동중/정지됨만 표시) */}
                  {u.press_no && (
                    <div style={{
                      background: '#f7f8fa', borderRadius: 8,
                      padding: '12px 16px', marginBottom: 12,
                      fontSize: 14, lineHeight: 1.85,
                    }}>
                      <div style={{ color: '#666' }}>
                        기자증: <strong style={{ color: NAVY }}>이음미디어/No. {u.press_no}</strong>
                      </div>
                      <div style={{ color: expiryColor, fontWeight: expiryStatus !== 'valid' ? 700 : 500 }}>
                        유효기간: {dbDateToShort(u.valid_from)} ~ {dbDateToShort(u.valid_until)}
                        {expiryLabel && <span style={{ marginLeft: 8 }}>{expiryLabel}</span>}
                      </div>
                      <div style={{ color: agreed ? GREEN : ORANGE, fontWeight: 600 }}>
                        {agreed ? '유의사항 동의 ✅' : '미동의 ⚠️'}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: '#3a3a3a', fontWeight: 600,
                    }}>
                      작성 0건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: GREEN, fontWeight: 700,
                    }}>
                      발행 0건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: ORANGE, fontWeight: 700,
                    }}>
                      검토대기 0건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: RED, fontWeight: 700,
                    }}>
                      반려 0건
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ustatus === 'pending' && (
                      <>
                        <button onClick={() => approveUser(u.id)} style={btnStyle(GREEN)}>✅ 시민기자 승인</button>
                        <button onClick={() => rejectUser(u.id)} style={btnStyle(ORANGE)}>❌ 반려</button>
                      </>
                    )}
                    {ustatus === 'active' && (
                      <>
                        <button onClick={() => renewUser(u.id)} style={btnStyle(BLUE)}>🔄 1년 갱신</button>
                        <button onClick={() => suspendUser(u.id)} style={btnStyle(ORANGE)}>🚫 활동 정지</button>
                        <button onClick={() => alert(`${u.nickname} 기자의 기사 목록으로 이동합니다.`)} style={btnStyle('#666', true)}>📋 기사 보기</button>
                      </>
                    )}
                    {ustatus === 'suspended' && (
                      <button onClick={() => reactivateUser(u.id)} style={btnStyle(BLUE)}>🔄 재활성화</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ━━ 탭 3: 통계 ━━ */}
        {activeTab === 3 && (
          <div>
            <h1 style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 700,
              color: NAVY, margin: '0 0 24px 0', lineHeight: 1.4,
            }}>
              📊 통계
            </h1>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16, marginBottom: 24,
            }}>
              <StatCard label="총 기사 수" value="41건" color={NAVY} />
              <StatCard label="이번 달 발행" value="8건" color={GREEN} />
              <StatCard label="시민기자 수" value="12명" color={BLUE} />
              <StatCard label="구독자 수" value="준비중" color="#888" />
            </div>

            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                color: NAVY, margin: '0 0 18px 0',
              }}>
                채널별 기사 수
              </h2>
              {CHANNEL_STATS.map(c => (
                <div key={c.name} style={{ marginBottom: 12 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 15, marginBottom: 4,
                  }}>
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{c.name}</span>
                    <span style={{ color: '#666', fontWeight: 600 }}>{c.count}건</span>
                  </div>
                  <div style={{ background: '#e5e5e5', height: 16, borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(c.count / maxChannelCount) * 100}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${NAVY}, ${BLUE})`,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: NAVY, color: '#fff',
              borderRadius: 12, padding: '32px 24px',
              textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 8 }}>창간 D-day</div>
              <div style={{
                fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: GOLD,
              }}>
                🎉 창간까지 D-18 (2026년 6월 4일)
              </div>
            </div>
          </div>
        )}

        {/* ━━ 탭 4: 설정 ━━ */}
        {activeTab === 4 && (
          <div>
            <h1 style={{
              fontFamily: SERIF, fontSize: 24, fontWeight: 700,
              color: NAVY, margin: '0 0 24px 0', lineHeight: 1.4,
            }}>
              ⚙️ 설정
            </h1>

            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                color: NAVY, margin: '0 0 18px 0',
              }}>
                매체 정보
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, lineHeight: 1.9 }}>
                <tbody>
                  {[
                    ['매체명', '이음미디어'],
                    ['발행인', '성창운'],
                    ['편집국장', '정세연'],
                    ['연락처', '010-7368-0368'],
                    ['이메일', 'press@eummedia.kr'],
                    ['도메인', 'eummedia.kr'],
                    ['채널 수', '7개'],
                    ['창간 예정일', '2026년 6월 4일'],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #ebebeb' }}>
                      <th style={{
                        width: 140, textAlign: 'left', padding: '12px 14px',
                        color: '#666', fontWeight: 600, verticalAlign: 'top',
                      }}>{k}</th>
                      <td style={{ padding: '12px 14px', color: '#1a1a1a' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              background: '#fff8f0',
              borderLeft: `4px solid ${ORANGE}`,
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 700,
                color: NAVY, margin: '0 0 14px 0', lineHeight: 1.4,
              }}>
                🔐 시민기자 권한 시스템 안내
              </h3>
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.85, margin: 0 }}>
                <strong style={{ color: NAVY }}>권한 시스템 흐름:</strong>
              </p>
              <ul style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.85, margin: '8px 0 16px 0', paddingLeft: 24 }}>
                <li>회원가입 → 편집국장 승인 → 시민기자 권한 부여</li>
                <li>미승인 회원은 /write 페이지 접근 불가</li>
                <li>편집국장만 AdminDashboard 접근 가능</li>
              </ul>
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.85, margin: 0, paddingTop: 14, borderTop: '1px solid #f0d0a8' }}>
                시민기자 자격은 승인일로부터 1년이며,<br />매년 편집국장 재승인 후 갱신됩니다.
              </p>
            </div>

            {/* 시민기자 유의사항 박스 */}
            <div style={{
              background: '#fff8f0',
              borderLeft: `4px solid ${ORANGE}`,
              borderRadius: 12,
              padding: '24px 28px',
              marginTop: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 700,
                color: NAVY, margin: '0 0 16px 0', lineHeight: 1.4,
              }}>
                📋 시민기자 유의사항
              </h3>
              <ol style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.95, margin: 0, paddingLeft: 24 }}>
                <li style={{ marginBottom: 10 }}>
                  본 신분증은 취재 및 활동 목적에 한하여 기간 내에서만 유효합니다.
                </li>
                <li style={{ marginBottom: 10 }}>
                  본 기자는 자원봉사/프리랜서 신분으로, 취재원에게 금품 및 향응을 절대 요구하지 않습니다.
                </li>
                <li style={{ marginBottom: 10 }}>
                  타 언론사 사칭 및 개인적 영리목적의 사용을 엄격히 금합니다. (위반 시 자격정지 및 민·형사상 법적 책임)
                </li>
                <li>
                  본 증은 활동종료(위촉해지) 시 관리팀에 즉시 반납해야 합니다.
                </li>
              </ol>
            </div>
          </div>
        )}

      </div>

      <CardNewsModal article={modalArticle} onClose={() => setModalArticle(null)} />
    </div>
  )
}
