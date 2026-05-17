import { useState } from 'react'

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const GREEN = '#1a6b3c'
const ORANGE = '#c45c0a'
const GOLD = '#c9a84c'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const INITIAL_ARTICLES = [
  {
    id: 1, title: '고양시 일산 파크골프 동호회 창단식 성료',
    channel: '이음로컬', reporter: '김영희', status: 'pending',
    completeness: 13, submittedAt: '2026-05-17 14:30',
    summary: '고양시 일산에서 파크골프 동호회가 정식 창단했습니다. 50명 이상의 회원이 참석한 가운데 활기찬 분위기로 진행됐습니다.',
  },
  {
    id: 2, title: '두피케어 전문가 정세연 원장 인터뷰',
    channel: '이음피플', reporter: '박철수', status: 'published',
    completeness: 15, submittedAt: '2026-05-15 10:00',
    summary: '닥터리부트 두피관리센터 정세연 원장. 27년의 두피전문가 경력과 함께 이음미디어 편집국장으로 활동 중인 정 원장을 만났습니다.',
  },
  {
    id: 3, title: '고양시 청소년 진로교육 프로그램 현장',
    channel: '이음에듀', reporter: '이순자', status: 'rejected',
    completeness: 9, submittedAt: '2026-05-16 16:20',
    summary: '고양시 청소년수련관에서 진행된 진로교육 프로그램. 다양한 직군의 전문가들이 참여해 학생들과 직접 만남의 시간을 가졌습니다.',
  },
]

const INITIAL_USERS = [
  {
    id: 1, name: '홍길동', status: 'pending',
    bio: '고양시 거주 20년 주부입니다. 지역 소식을 전하고 싶어요.',
    appliedAt: '2026-05-15',
    articlesCount: 0, publishedCount: 0, pendingCount: 0, rejectedCount: 0,
    pressNo: null, validFrom: null, validUntil: null, agreed: false,
  },
  {
    id: 2, name: '김영희', status: 'active',
    bio: '전직 교사. 교육과 지역사회에 관심이 많습니다.',
    appliedAt: '2026-02-01',
    articlesCount: 5, publishedCount: 3, pendingCount: 1, rejectedCount: 1,
    pressNo: '26-002', validFrom: '26-02-01', validUntil: '27-01-31', agreed: true,
  },
  {
    id: 3, name: '이순자', status: 'active',
    bio: '요리연구가. 지역 맛집과 문화를 알리고 싶습니다.',
    appliedAt: '2025-06-01',
    articlesCount: 2, publishedCount: 1, pendingCount: 1, rejectedCount: 0,
    pressNo: '26-003', validFrom: '25-06-01', validUntil: '26-05-31', agreed: true,
  },
]

function formatDateShort(d) {
  const yy = String(d.getFullYear()).slice(2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function parseShortDate(s) {
  if (!s) return null
  const parts = s.split('-')
  if (parts.length !== 3) return null
  return new Date(2000 + parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
}

function getExpiryStatus(validUntil) {
  const expiry = parseShortDate(validUntil)
  if (!expiry) return 'none'
  const now = new Date()
  const diffDays = Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'warning'
  return 'valid'
}

const ARTICLE_STATUS_LABELS = {
  pending: { label: '검토대기', color: RED, bg: '#fef0ef' },
  approved: { label: '승인됨', color: BLUE, bg: '#eef3fa' },
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
  { key: 'pending', label: '검토대기 🔴' },
  { key: 'approved', label: '승인됨' },
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

function CardNewsModal({ article, onClose }) {
  if (!article) return null
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', maxWidth: 400, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        borderRadius: 12, padding: 24, boxSizing: 'border-box',
      }}>
        <h2 style={{
          fontFamily: SERIF, fontSize: 22, fontWeight: 700,
          color: NAVY, margin: '0 0 20px 0', textAlign: 'center',
        }}>
          📱 카드뉴스 미리보기
        </h2>

        {/* 카드 1 — 표지 */}
        <div style={{
          background: NAVY, color: '#fff', borderRadius: 12,
          padding: '32px 24px', marginBottom: 14, minHeight: 320,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 18, fontWeight: 700,
            color: GOLD, letterSpacing: 2,
          }}>
            이음미디어
          </div>
          <div style={{
            fontFamily: SERIF, fontSize: 24, fontWeight: 700,
            lineHeight: 1.5, textAlign: 'center',
          }}>
            {article.title}
          </div>
          <div style={{ fontSize: 14, opacity: 0.7, textAlign: 'right' }}>
            {article.channel} · {article.submittedAt?.slice(0, 10)}
          </div>
        </div>

        {/* 카드 2 — 핵심 내용 */}
        <div style={{
          background: '#fff', border: '1px solid #e5e5e5',
          borderRadius: 12, padding: '32px 24px', marginBottom: 14, minHeight: 320,
        }}>
          <div style={{
            display: 'inline-block',
            fontSize: 12, fontWeight: 700, color: NAVY,
            background: '#eef3fa', padding: '4px 12px', borderRadius: 12,
            marginBottom: 20,
          }}>
            {article.channel}
          </div>
          <div style={{
            fontSize: 18, color: '#1a1a1a', lineHeight: 1.85, marginBottom: 24,
          }}>
            {article.summary}
          </div>
          <div style={{
            fontSize: 14, color: '#666', borderTop: '1px solid #e5e5e5',
            paddingTop: 14, textAlign: 'right',
          }}>
            글 · {article.reporter} 시민기자
          </div>
        </div>

        {/* 카드 3 — 마무리 */}
        <div style={{
          background: '#f9f8f6', borderRadius: 12,
          padding: '32px 24px', marginBottom: 20, minHeight: 320,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: SERIF, fontSize: 28, fontWeight: 700,
            color: NAVY, marginBottom: 16,
          }}>
            <span>이</span>
            <span style={{ color: GOLD }}>음</span>
            <span>미디어</span>
          </div>
          <div style={{
            fontSize: 15, color: '#3a3a3a', lineHeight: 1.7, marginBottom: 20,
          }}>
            세상을 잇고, 당신을 잇는<br />인터넷신문
          </div>
          <div style={{
            fontSize: 13, color: '#888', fontWeight: 600, letterSpacing: 1,
          }}>
            eummedia.kr
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => alert('이미지 저장 기능은 추후 업데이트됩니다. 현재는 화면 캡처를 이용해주세요.')}
            style={{
              flex: 1, height: 48, fontSize: 16, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
            💾 이미지로 저장
          </button>
          <button onClick={onClose}
            style={{
              flex: 1, height: 48, fontSize: 16, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
            ✕ 닫기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(1)
  const [articles, setArticles] = useState(INITIAL_ARTICLES)
  const [users, setUsers] = useState(INITIAL_USERS)
  const [articleFilter, setArticleFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvedId, setApprovedId] = useState(null)
  const [approvedUserId, setApprovedUserId] = useState(null)
  const [modalArticle, setModalArticle] = useState(null)

  const switchTab = (n) => {
    setActiveTab(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredArticles = articleFilter === 'all'
    ? articles
    : articles.filter(a => a.status === articleFilter)
  const filteredUsers = userFilter === 'all'
    ? users
    : users.filter(u => u.status === userFilter)

  const approveArticle = (id) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'published' } : a))
    setApprovedId(id)
  }
  const startReject = (id) => { setRejectingId(id); setRejectReason('') }
  const confirmReject = (id) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    setRejectingId(null); setRejectReason('')
  }
  const cancelReject = () => { setRejectingId(null); setRejectReason('') }
  const reReview = (id) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'pending' } : a))
  }
  const approveUser = (id) => {
    const today = new Date()
    const oneYearLater = new Date(today)
    oneYearLater.setFullYear(today.getFullYear() + 1)
    oneYearLater.setDate(today.getDate() - 1)
    const activeCount = users.filter(u => u.pressNo).length
    const nextNo = `26-${String(activeCount + 2).padStart(3, '0')}`
    setUsers(users.map(u => u.id === id ? {
      ...u, status: 'active',
      pressNo: nextNo,
      validFrom: formatDateShort(today),
      validUntil: formatDateShort(oneYearLater),
      agreed: true,
    } : u))
    setApprovedUserId(id)
  }
  const renewUser = (id) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    const expiry = parseShortDate(user.validUntil) || new Date()
    const newExpiry = new Date(expiry)
    newExpiry.setFullYear(expiry.getFullYear() + 1)
    setUsers(users.map(u => u.id === id ? {
      ...u, validUntil: formatDateShort(newExpiry),
    } : u))
    alert('자격이 1년 갱신됐습니다!')
  }
  const rejectUser = (id) => {
    alert('반려됐습니다.')
    setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' } : u))
  }
  const suspendUser = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' } : u))
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
              const sb = ARTICLE_STATUS_LABELS[a.status]
              const showApprovedBanner = approvedId === a.id && a.status === 'published'
              const isRejecting = rejectingId === a.id
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
                    }}>{a.channel}</span>
                    <span style={{
                      background: sb.bg, color: sb.color, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12,
                    }}>{sb.label}</span>
                    <span style={{ color: '#888', marginLeft: 'auto' }}>{a.submittedAt}</span>
                  </div>

                  <div style={{
                    fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                    color: '#1a1a1a', marginBottom: 10, lineHeight: 1.5,
                  }}>
                    {a.title}
                  </div>

                  <div style={{ fontSize: 15, color: '#666', marginBottom: 12 }}>
                    기자: <strong style={{ color: '#1a1a1a' }}>{a.reporter}</strong>
                    {' · '}
                    완성도: <strong style={{
                      color: a.completeness === 15 ? GREEN : (a.completeness >= 12 ? BLUE : ORANGE),
                    }}>{a.completeness}/15</strong>
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
                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => approveArticle(a.id)} style={btnStyle(GREEN)}>✅ 승인·발행</button>
                          <button onClick={() => startReject(a.id)} style={btnStyle(ORANGE)}>❌ 반려</button>
                          <button onClick={() => alert(`미리보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                      {a.status === 'published' && (
                        <>
                          <button onClick={() => setModalArticle(a)} style={btnStyle(NAVY)}>🖼 카드뉴스 만들기</button>
                          <button onClick={() => alert(`기사 보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 기사 보기</button>
                        </>
                      )}
                      {a.status === 'rejected' && (
                        <>
                          <button onClick={() => reReview(a.id)} style={btnStyle(BLUE)}>🔄 재검토</button>
                          <button onClick={() => alert(`미리보기: ${a.title}`)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                      {a.status === 'approved' && (
                        <button onClick={() => approveArticle(a.id)} style={btnStyle(GREEN)}>🚀 발행</button>
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
              const sb = USER_STATUS_LABELS[u.status]
              const showApprovedBanner = approvedUserId === u.id && u.status === 'active'
              const expiryStatus = getExpiryStatus(u.validUntil)
              const expiryColor = expiryStatus === 'expired' ? RED : (expiryStatus === 'warning' ? ORANGE : '#3a3a3a')
              const expiryLabel = expiryStatus === 'expired'
                ? '🔴 자격 만료'
                : (expiryStatus === 'warning' ? '⚠️ 갱신 필요' : '')
              return (
                <div key={u.id} style={card}>
                  {showApprovedBanner && (
                    <div style={{
                      background: '#eef7f2', borderRadius: 8,
                      padding: '14px 18px', marginBottom: 14,
                      fontSize: 16, color: GREEN, fontWeight: 600, lineHeight: 1.7,
                    }}>
                      ✅ 승인됐습니다! 기자증 번호: <strong>이음미디어/No. {u.pressNo}</strong><br />
                      유효기간: {u.validFrom} ~ {u.validUntil}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 10, flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: NAVY,
                    }}>{u.name}</span>
                    <span style={{
                      background: sb.bg, color: sb.color, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12, fontSize: 13,
                    }}>{sb.label}</span>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>
                      신청일: {u.appliedAt}
                    </span>
                  </div>

                  <div style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.7, marginBottom: 12 }}>
                    {u.bio}
                  </div>

                  {/* 기자증 영역 (활동중/정지됨만 표시) */}
                  {u.pressNo && (
                    <div style={{
                      background: '#f7f8fa', borderRadius: 8,
                      padding: '12px 16px', marginBottom: 12,
                      fontSize: 14, lineHeight: 1.85,
                    }}>
                      <div style={{ color: '#666' }}>
                        기자증: <strong style={{ color: NAVY }}>이음미디어/No. {u.pressNo}</strong>
                      </div>
                      <div style={{ color: expiryColor, fontWeight: expiryStatus !== 'valid' ? 700 : 500 }}>
                        유효기간: {u.validFrom} ~ {u.validUntil}
                        {expiryLabel && <span style={{ marginLeft: 8 }}>{expiryLabel}</span>}
                      </div>
                      <div style={{ color: u.agreed ? GREEN : ORANGE, fontWeight: 600 }}>
                        {u.agreed ? '유의사항 동의 ✅' : '미동의 ⚠️'}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: '#3a3a3a', fontWeight: 600,
                    }}>
                      작성 {u.articlesCount}건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: GREEN, fontWeight: 700,
                    }}>
                      발행 {u.publishedCount}건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: ORANGE, fontWeight: 700,
                    }}>
                      검토대기 {u.pendingCount}건
                    </span>
                    <span style={{
                      background: '#f0f0f0', borderRadius: 6, padding: '4px 10px',
                      fontSize: 13, color: RED, fontWeight: 700,
                    }}>
                      반려 {u.rejectedCount}건
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {u.status === 'pending' && (
                      <>
                        <button onClick={() => approveUser(u.id)} style={btnStyle(GREEN)}>✅ 시민기자 승인</button>
                        <button onClick={() => rejectUser(u.id)} style={btnStyle(ORANGE)}>❌ 반려</button>
                      </>
                    )}
                    {u.status === 'active' && (
                      <>
                        <button onClick={() => renewUser(u.id)} style={btnStyle(BLUE)}>🔄 1년 갱신</button>
                        <button onClick={() => suspendUser(u.id)} style={btnStyle(ORANGE)}>🚫 활동 정지</button>
                        <button onClick={() => alert(`${u.name} 기자의 기사 목록으로 이동합니다.`)} style={btnStyle('#666', true)}>📋 기사 보기</button>
                      </>
                    )}
                    {u.status === 'suspended' && (
                      <button onClick={() => approveUser(u.id)} style={btnStyle(BLUE)}>🔄 재활성화</button>
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
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.85, margin: '0 0 16px 0' }}>
                현재는 더미 데이터로 작동합니다.<br />
                Supabase Auth 연동 후 실제 권한 관리가 가능합니다.
              </p>
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.85, margin: 0 }}>
                <strong style={{ color: NAVY }}>실제 구현 시:</strong>
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
