import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getYouTubeVideoId } from '../lib/youtube'

// 📺 영상 갤러리 전체 페이지 (/videos)
// - show_in_gallery=true 큐레이션 기사만 노출
// - 최신순, 6개씩 더보기로 추가 로드
// - 카드 클릭 → /article/{slug}
// - 0건이면 빈 상태 안내 (편집국장 큐레이션 대기)

const PAGE_SIZE = 6
const NAVY = '#0d2d52'
const SANS = "'Noto Sans KR', sans-serif"

// 발행일 YYYY-MM-DD 포맷
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  // 페이지 로드 — 첫 6건 + 추가 로드 모두 동일 패턴
  const fetchPage = useCallback(async (offset) => {
    const { data, error: err } = await supabase
      .from('articles')
      .select('slug, title, summary, video_url, thumbnail_url, published_at, channels(name)')
      .eq('status', 'published')
      .eq('show_in_gallery', true)
      .not('video_url', 'is', null)
      .neq('video_url', '')
      .order('published_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
    if (err) throw err
    return data ?? []
  }, [])

  // 초기 로드
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const first = await fetchPage(0)
        if (cancelled) return
        setVideos(first)
        setHasMore(first.length === PAGE_SIZE)
      } catch (e) {
        if (cancelled) return
        console.error('[Videos] fetch error:', e)
        setError(e?.message || '영상을 불러오지 못했습니다')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [fetchPage])

  // 더보기
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const next = await fetchPage(videos.length)
      setVideos(prev => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    } catch (e) {
      console.error('[Videos] load more error:', e)
      alert('추가 영상을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div style={{
      maxWidth: 1140, margin: '0 auto', padding: '40px 20px 80px',
      fontFamily: SANS, color: '#1a1a1a',
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: NAVY, margin: 0,
          letterSpacing: '-0.5px',
        }}>📺 영상 갤러리</h1>
        <div style={{
          marginTop: 10, fontSize: 16, color: '#5a5a5a', lineHeight: 1.7,
        }}>
          편집국장이 직접 선별한 이음미디어의 영상 기사 모음
        </div>
      </div>

      {/* 본문 */}
      {loading ? (
        <div style={{
          padding: '80px 20px', textAlign: 'center',
          fontSize: 15, color: '#9a9a9a',
        }}>
          영상을 불러오는 중입니다…
        </div>
      ) : error ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          background: '#fff4f4', border: '1px solid #f0c0c0', borderRadius: 8,
          color: '#a02020',
        }}>
          {error}
        </div>
      ) : videos.length === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center',
          background: '#f7f8fa', border: '1px solid #e0e0e0', borderRadius: 8,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📺</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            아직 갤러리에 등록된 영상이 없습니다
          </div>
          <div style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
            편집국장이 영상 기사를 선별하면 이 자리에 노출됩니다.<br />
            그동안 <Link to="/" style={{ color: NAVY, fontWeight: 700, textDecoration: 'underline' }}>홈</Link> 또는{' '}
            <Link to="/channel/magazine" style={{ color: NAVY, fontWeight: 700, textDecoration: 'underline' }}>이음매거진</Link>에서 다른 기사를 둘러보세요.
          </div>
        </div>
      ) : (
        <>
          {/* 그리드 — 데스크탑 3열, 태블릿 2열, 모바일 1열 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}>
            {videos.map(v => {
              const videoId = getYouTubeVideoId(v.video_url)
              const thumb = videoId
                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                : v.thumbnail_url
              return (
                <Link key={v.slug} to={`/article/${v.slug}`}
                  style={{
                    display: 'block', textDecoration: 'none', color: 'inherit',
                    border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden',
                    background: '#fff', transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }}>
                  {/* 썸네일 16:9 */}
                  <div style={{
                    position: 'relative', width: '100%', aspectRatio: '16 / 9',
                    background: '#000', overflow: 'hidden',
                  }}>
                    {thumb && (
                      <img src={thumb} alt={v.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                    {/* 재생 아이콘 오버레이 */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.15)',
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.65)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, paddingLeft: 5, lineHeight: 1,
                      }}>▶</div>
                    </div>
                    {/* 채널 라벨 */}
                    {v.channels?.name && (
                      <span style={{
                        position: 'absolute', top: 10, left: 10,
                        background: 'rgba(255,255,255,0.95)', color: NAVY,
                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 3,
                      }}>{v.channels.name}</span>
                    )}
                  </div>
                  {/* 본문 */}
                  <div style={{ padding: 16 }}>
                    <div style={{
                      fontFamily: 'serif', fontSize: 17, fontWeight: 700,
                      color: '#1a1a1a', lineHeight: 1.45, marginBottom: 8,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{v.title}</div>
                    {v.summary && (
                      <div style={{
                        fontSize: 13, color: '#666', lineHeight: 1.55, marginBottom: 10,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{v.summary}</div>
                    )}
                    <div style={{ fontSize: 12, color: '#9a9a9a' }}>
                      {formatDate(v.published_at)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* 더보기 버튼 */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button onClick={handleLoadMore} disabled={loadingMore}
                style={{
                  minWidth: 180, padding: '14px 28px',
                  fontSize: 17, fontWeight: 700,
                  background: loadingMore ? '#f0f0f0' : '#fff',
                  color: loadingMore ? '#888' : NAVY,
                  border: `2px solid ${loadingMore ? '#ccc' : NAVY}`, borderRadius: 8,
                  cursor: loadingMore ? 'wait' : 'pointer',
                  fontFamily: SANS,
                }}>
                {loadingMore ? '⏳ 불러오는 중...' : `더보기 (+${PAGE_SIZE}건)`}
              </button>
            </div>
          )}

          {/* 카운트 표시 */}
          <div style={{
            marginTop: 24, textAlign: 'center',
            fontSize: 13, color: '#9a9a9a',
          }}>
            총 {videos.length}건 표시{hasMore ? ' · 더보기로 추가 로드' : ''}
          </div>
        </>
      )}
    </div>
  )
}
