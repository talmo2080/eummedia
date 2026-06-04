import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { getYouTubeEmbedUrl } from '../lib/youtube'
import CardSlide from '../components/CardSlide'
import { downloadCsv } from '../lib/csv'

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const GREEN = '#1a6b3c'
const ORANGE = '#c45c0a'
const GOLD = '#c9a84c'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"
const PAGE_SIZE = 15

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

// getUserStatus 제거 — 새 시민기자 관리 탭은 writer_applications.status + users.is_active 직접 사용

const ARTICLE_STATUS_LABELS = {
  submitted: { label: '검토대기', color: RED, bg: '#fef0ef' },
  rejected: { label: '반려됨', color: ORANGE, bg: '#fff8f0' },
  published: { label: '발행됨', color: GREEN, bg: '#eef7f2' },
}

// USER_STATUS_LABELS 제거 — 새 카드는 inline badge로 대체

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
  { num: 5, icon: '🧑‍🤝‍🧑', label: '회원 관리' },
  { num: 3, icon: '📊', label: '통계' },
  { num: 4, icon: '⚙️', label: '설정' },
]

// 회원 관리 탭 — role 필터
const STANDARD_ROLES = ['reader', 'writer', 'admin']
const MEMBER_FILTERS = [
  { key: 'all',    label: '전체' },
  { key: 'reader', label: '독자' },
  { key: 'writer', label: '시민기자' },
  { key: 'admin',  label: '관리자' },
  { key: 'other',  label: '기타' },  // publisher 등 표준 enum 외
]

function memberRoleLabel(role) {
  return ({
    reader: '독자',
    writer: '시민기자',
    admin: '관리자',
    publisher: '발행인',
  })[role] || role || '—'
}

function formatMemberDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

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
  { key: 'rejected', label: '반려됨' },
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

// ━━━━━━━━━━━ PreviewModal — 검토대기 기사 전문 미리보기 ━━━━━━━━━━━
function PreviewModal({ article, onClose }) {
  useEffect(() => {
    if (!article) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [article, onClose])

  if (!article) return null

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1100, padding: '40px 20px', overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', maxWidth: 800, width: '100%',
          borderRadius: 12, padding: '32px 28px', boxSizing: 'border-box',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="닫기"
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 40, height: 40, border: 'none', background: 'transparent',
            fontSize: 24, cursor: 'pointer', color: '#666', lineHeight: 1,
          }}
        >✕</button>

        {/* 미리보기 표시 + 채널 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{
            background: '#fffbeb', color: '#92400e',
            border: '1px solid #f59e0b',
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12,
          }}>👁 미리보기</span>
          {article.channels?.name && (
            <span style={{
              background: '#eef3fa', color: NAVY, fontWeight: 700,
              fontSize: 13, padding: '4px 12px', borderRadius: 12,
            }}>{article.channels.name}</span>
          )}
        </div>

        {/* 제목 */}
        <h1 style={{
          fontFamily: SERIF, fontSize: 28, fontWeight: 700,
          color: '#0d2d52', lineHeight: 1.4,
          margin: '0 0 14px 0', paddingRight: 40,
        }}>
          {article.title}
        </h1>

        {/* 요약 */}
        {article.summary && (
          <div style={{
            fontFamily: SERIF, fontSize: 16, color: '#5a5a5a',
            lineHeight: 1.7, fontStyle: 'italic',
            borderLeft: '3px solid #1c4f8a', paddingLeft: 14,
            marginBottom: 18,
          }}>
            {article.summary}
          </div>
        )}

        {/* 기자 + 작성일 */}
        <div style={{
          fontSize: 14, color: '#666',
          paddingBottom: 14, marginBottom: 18,
          borderBottom: '1px solid #e5e5e5',
        }}>
          기자 <strong style={{ color: '#1a1a1a' }}>{article.author_name || '-'}</strong>
          {' · '}
          작성일 {formatDateTime(article.created_at)}
          {article.citizen_complete > 0 && (
            <span style={{ marginLeft: 10, color: '#888' }}>· 시민기자 체크 {article.citizen_complete}/14</span>
          )}
        </div>

        {/* 대표 이미지 */}
        {article.thumbnail_url && (
          <div style={{ marginBottom: 20 }}>
            <img
              src={article.thumbnail_url}
              alt={article.image_alt || article.title}
              style={{
                width: '100%', maxHeight: 400, objectFit: 'cover',
                borderRadius: 4, display: 'block',
              }}
            />
            {article.image_alt && (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
                {article.image_alt}
              </div>
            )}
          </div>
        )}

        {/* 본문 */}
        <div style={{
          fontSize: 16, lineHeight: 1.9, color: '#222',
          marginBottom: 24, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {article.content || '(본문 없음)'}
        </div>

        {/* 🎬 기사 영상 — video_url + 유효한 YouTube일 때만 (ArticleDetail과 동일) */}
        {(() => {
          const embedUrl = getYouTubeEmbedUrl(article.video_url);
          if (!embedUrl) return null;
          return (
            <div style={{ margin: '0 0 24px 0' }}>
              <div style={{
                fontSize: 13, fontWeight: 700, color: NAVY,
                letterSpacing: 1, marginBottom: 10,
              }}>
                🎬 기사 영상
              </div>
              <div style={{
                position: 'relative', width: '100%', paddingBottom: '56.25%',
                background: '#000', borderRadius: 8, overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}>
                <iframe
                  src={embedUrl}
                  title={article.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%', border: 0,
                  }}
                />
              </div>
            </div>
          );
        })()}

        {/* 태그 */}
        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            paddingTop: 16, borderTop: '1px solid #e5e5e5',
          }}>
            {article.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 12, color: '#1c4f8a',
                border: '1px solid #1c4f8a', padding: '4px 10px',
                borderRadius: 4,
              }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ━━━━━━━━━━━ CardNewsModal — 5장 데이터 기반 (commit 48) ━━━━━━━━━━━
// 구조: 표지1 + 핵심3 + 마무리1
// AI 자동 요약 (Vercel /api/cardnews-ai → Claude sonnet-4-5)
// Supabase: cardnews 테이블 upsert + cardnews-images Storage 업로드

const EMPTY_SLIDES = [
  { order: 1, type: 'cover',  title: '', text: '', image_url: '' },
  { order: 2, type: 'main',   title: '', text: '', image_url: '' },
  { order: 3, type: 'main',   title: '', text: '', image_url: '' },
  { order: 4, type: 'main',   title: '', text: '', image_url: '' },
  { order: 5, type: 'ending', title: '', text: '', image_url: '' },
];

const SLIDE_TAB_LABEL = (order) => order === 1 ? '표지' : order === 5 ? '마무리' : `핵심${order-1}`;

// 카드뉴스 비율: 4:5 단일 (1080×1350 권장)
const CARDNEWS_TYPE = '4:5';

function CardNewsModal({ article, onClose, onDelete, onSaved }) {
  const [slides, setSlides] = useState(EMPTY_SLIDES);
  const [activeSlide, setActiveSlide] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 모달 열릴 때 기존 cardnews fetch (재편집 지원)
  useEffect(() => {
    if (!article?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('cardnews')
        .select('slides')
        .eq('article_id', article.id)
        .eq('type', CARDNEWS_TYPE)
        .maybeSingle();
      if (cancelled) return;
      if (error) { console.error('cardnews fetch:', error); return; }
      if (data?.slides && Array.isArray(data.slides) && data.slides.length === 5) {
        setSlides(data.slides);
      } else {
        setSlides(EMPTY_SLIDES);
      }
    })();
    return () => { cancelled = true; };
  }, [article?.id]);

  if (!article) return null;

  // AI 자동 생성
  const handleAIGenerate = async () => {
    if (!article?.content && !article?.summary) {
      alert('기사 내용이 없습니다.');
      return;
    }
    setIsGenerating(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000); // 15초 timeout
    try {
      const res = await fetch('/api/cardnews-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content || article.summary,
        }),
        signal: controller.signal,
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert(`AI 요약 생성 실패 (응답 JSON 아님, status=${res.status}):\n${text.slice(0, 500)}`);
        return;
      }
      if (data.slides) {
        setSlides(prev => prev.map(s => {
          const ai = data.slides.find(a => a.order === s.order);
          return ai ? { ...s, title: ai.title || '', text: ai.text || '' } : s;
        }));
      } else {
        const msg = data.error || '알 수 없는 오류';
        const detail = data.detail ? `\n\n[detail]\n${data.detail}` : '';
        alert(`AI 요약 생성 실패 (status=${res.status}): ${msg}${detail}`);
      }
    } catch (err) {
      console.error('AI generate error:', err);
      if (err.name === 'AbortError') {
        alert('AI 요약 생성 시간 초과 (15초). 다시 시도해주세요.');
      } else {
        alert(`AI 요약 생성 중 오류: ${err.message || err.name || '알 수 없는 오류'}`);
      }
    } finally {
      clearTimeout(timer);
      setIsGenerating(false);
    }
  };

  // Supabase 저장 (upsert)
  const handleSave = async () => {
    if (!article?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('cardnews')
        .upsert({
          article_id: article.id,
          title: slides[0].title || article.title,
          type: CARDNEWS_TYPE,
          slides: slides,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'article_id,type' });
      if (error) throw error;
      alert('카드뉴스가 저장되었습니다! 기사 페이지에 반영됩니다.');
      // 저장 성공 → 부모에 알림 (cardnewsSet 갱신용)
      if (typeof onSaved === 'function') onSaved(article.id);
    } catch (err) {
      console.error('save error:', err);
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Storage 이미지 업로드
  const handleImageUpload = async (file, slideOrder) => {
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${article.id}_4-5_slide${slideOrder}_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('cardnews-images')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('cardnews-images')
        .getPublicUrl(fileName);

      setSlides(prev => prev.map(s =>
        s.order === slideOrder ? { ...s, image_url: urlData.publicUrl } : s
      ));
    } catch (err) {
      console.error('upload error:', err);
      alert(`이미지 업로드 실패: ${err.message}`);
    }
  };

  const current = slides.find(s => s.order === activeSlide) || slides[0];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', maxWidth: 520, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
        borderRadius: 12, padding: 20, boxSizing: 'border-box',
        position: 'relative',
      }}>
        <button onClick={onClose} aria-label="닫기" style={{
          position: 'absolute', top: 10, right: 10,
          width: 36, height: 36, border: 'none', background: 'transparent',
          fontSize: 22, cursor: 'pointer', color: '#666', lineHeight: 1,
        }}>✕</button>

        <h2 style={{
          fontFamily: SERIF, fontSize: 20, fontWeight: 700,
          color: NAVY, margin: '0 0 8px 0', textAlign: 'center',
        }}>
          📱 카드뉴스 만들기 (5장)
        </h2>

        {/* 비율 안내 */}
        <div style={{
          background: '#f5f9ff', border: `1px solid ${BLUE}`, borderRadius: 6,
          padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#333',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          💡 권장 사이즈 <strong>4:5 (1080×1350)</strong> · 5장 (표지 + 핵심3 + 마무리)
        </div>

        {/* AI 자동 생성 버튼 */}
        <button
          onClick={handleAIGenerate}
          disabled={isGenerating}
          className="w-full py-3 mb-4 bg-violet-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <><span className="animate-spin">⏳</span> AI 요약 생성 중...</>
          ) : (
            <><span>🤖</span> AI 카드뉴스 초안 생성</>
          )}
        </button>

        {/* 슬라이드 탭 (5장) */}
        <div className="flex gap-1 mb-3">
          {slides.map(s => (
            <button
              key={s.order}
              onClick={() => setActiveSlide(s.order)}
              className={`flex-1 py-2 text-xs font-bold rounded ${
                activeSlide === s.order
                  ? 'bg-[#0d2d52] text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {SLIDE_TAB_LABEL(s.order)}
            </button>
          ))}
        </div>

        {/* 현재 슬라이드 편집 */}
        <div className="space-y-3 mb-2">
          {/* C안 실시간 미리보기 — 입력값 즉시 반영 */}
          <CardSlide
            slide={current}
            articleThumbnail={article.thumbnail_url}
            channelName={article.channels?.name}
          />

          {/* 이미지 업로드 (표지·엔딩에만 배경으로 사용됨) */}
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-3 text-center mt-3">
            <div className="text-xs text-neutral-500 mb-2 leading-relaxed">
              {current.type === 'main'
                ? '본문은 글이 주인공입니다 — 이미지 업로드 무관'
                : '슬라이드 전용 이미지 (선택) — 비워두면 기사 대표이미지 사용'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], current.order)}
              className="text-xs w-full"
            />
          </div>

          {/* 제목 (마무리 제외) */}
          {current.type !== 'ending' && (
            <input
              value={current.title}
              onChange={e => setSlides(prev => prev.map(p =>
                p.order === current.order ? { ...p, title: e.target.value } : p
              ))}
              placeholder={current.type === 'cover' ? '표지 제목 (15자 이내)' : '핵심 제목 (10자 이내)'}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm"
              maxLength={current.type === 'cover' ? 15 : 10}
            />
          )}

          {/* 내용 (표지 제외) */}
          {current.type !== 'cover' && (
            <textarea
              value={current.text}
              onChange={e => setSlides(prev => prev.map(p =>
                p.order === current.order ? { ...p, text: e.target.value } : p
              ))}
              placeholder={current.type === 'ending' ? '마무리 메시지 (30자 이내)' : '핵심 내용 (40자 이내)'}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm h-20 resize-none"
              maxLength={current.type === 'ending' ? 30 : 40}
            />
          )}

          <div className="text-right text-xs text-neutral-500">
            {current.type === 'cover' && `${current.title.length}/15`}
            {current.type === 'main' && `제목 ${current.title.length}/10 · 내용 ${current.text.length}/40`}
            {current.type === 'ending' && `${current.text.length}/30`}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 mt-4 bg-[#0d2d52] text-white font-bold rounded-lg disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '💾 저장하고 기사에 반영'}
        </button>

        {/* 삭제 버튼 — onDelete prop 받았을 때만 (편집 중 폐기 가능) */}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full py-2.5 mt-2 bg-white text-red-600 border border-red-600 font-bold rounded-lg hover:bg-red-50"
          >
            🗑 카드뉴스 삭제
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const canAct = profile?.role === 'admin'   // 발행/반려/승인/정지/카드뉴스 등 모든 액션
  const [activeTab, setActiveTab] = useState(1)
  const [articles, setArticles] = useState([])
  const [users, setUsers] = useState([])
  const [articleFilter, setArticleFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [memberFilter, setMemberFilter] = useState('all')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approvedId, setApprovedId] = useState(null)
  const [approvedUserId, setApprovedUserId] = useState(null)
  const [modalArticle, setModalArticle] = useState(null)
  const [previewArticle, setPreviewArticle] = useState(null)
  const [visibleArticleCount, setVisibleArticleCount] = useState(PAGE_SIZE)
  const [applications, setApplications] = useState([])    // writer_applications + users LEFT JOIN
  const [appRejectingId, setAppRejectingId] = useState(null)
  const [appRejectReason, setAppRejectReason] = useState('')
  // 카드뉴스 보유 article.id 집합 — "🗑 카드뉴스 삭제" 버튼 노출 판단용
  const [cardnewsSet, setCardnewsSet] = useState(() => new Set())

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
    ;(async () => {
      const { data, error } = await supabase
        .from('writer_applications')
        .select('*, users!writer_applications_user_id_fkey(id, email, nickname, role, is_active, press_no, valid_from, valid_until)')
        .order('applied_at', { ascending: false })
      if (error) { console.error('applications fetch:', error); return }
      setApplications(data || [])
    })()
    // 카드뉴스 보유 article.id 집합 fetch — "🗑 삭제" 버튼 노출 판단
    ;(async () => {
      const { data, error } = await supabase.from('cardnews').select('article_id')
      if (error) { console.error('cardnews set fetch:', error); return }
      setCardnewsSet(new Set((data || []).map(r => r.article_id)))
    })()
  }, [])

  const switchTab = (n) => {
    setActiveTab(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredArticles = articleFilter === 'all'
    ? articles
    : articles.filter(a => a.status === articleFilter)
  // filteredUsers 제거 — 새 시민기자 관리 탭은 entries (writer_applications + legacy) 사용

  // 회원 관리 탭 — 필터 + CSV 내보내기
  const filteredMembers = memberFilter === 'all'
    ? users
    : memberFilter === 'other'
      ? users.filter(u => !STANDARD_ROLES.includes(u.role))
      : users.filter(u => u.role === memberFilter)

  const downloadMembersCsv = () => {
    const headers = [
      { key: 'nickname', label: '닉네임' },
      { key: 'email',    label: '이메일' },
      { key: 'role',     label: '권한' },
      { key: 'joined',   label: '가입일' },
      { key: 'active',   label: '활성여부' },
    ]
    const rows = filteredMembers.map(u => ({
      nickname: u.nickname,
      email:    u.email,
      role:     memberRoleLabel(u.role),
      joined:   formatMemberDate(u.created_at),
      active:   u.is_active ? '활성' : '비활성',
    }))
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    downloadCsv(rows, headers, `eummedia_members_${today}.csv`)
  }

  // 필터 변경 시 페이지네이션 초기화 (render 중 state 조정 — React 19 권장 패턴)
  const [prevArticleFilter, setPrevArticleFilter] = useState(articleFilter)
  if (articleFilter !== prevArticleFilter) {
    setPrevArticleFilter(articleFilter)
    setVisibleArticleCount(PAGE_SIZE)
  }

  const visibleArticles = filteredArticles.slice(0, visibleArticleCount)
  const hasMoreArticles = filteredArticles.length > visibleArticleCount
  const remainingArticles = filteredArticles.length - visibleArticleCount

  // 발행 시 Vercel 재배포 트리거 — 서버 함수가 access token으로 admin/publisher 검증 후 Deploy Hook 호출
  // 실패해도 발행은 성공 처리 (콘솔 경고만, 사용자 동선 안 끊김)
  const triggerDeploy = async (source) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { console.warn('[deploy hook] no session, skip'); return }
      const r = await fetch('/api/trigger-deploy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!r.ok) console.warn(`[deploy hook] ${source} non-200:`, r.status)
    } catch (err) {
      console.warn(`[deploy hook] ${source} error:`, err?.message || err)
    }
  }

  const approveArticle = async (id) => {
    const nowIso = new Date().toISOString()
    const { error } = await supabase
      .from('articles')
      .update({ status: 'published', published_at: nowIso })
      .eq('id', id)
    if (error) { alert(`승인 실패: ${error.message}`); return }
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'published', published_at: nowIso } : a))
    setApprovedId(id)
    // 발행 성공 후 Vercel 재배포 트리거 (prerender 갱신 → 검색·AI 노출)
    // 실패해도 발행 자체는 성공 — 사용자 동선 안 끊김 (콘솔 경고만)
    triggerDeploy('approveArticle')
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
  // approveUser 제거 — 기존 users 기반 승인은 새 approveApplication으로 대체

  // ━━ writer_applications 기반 새 승인/반려 ━━
  const approveApplication = async (app) => {
    if (!app.user_id) { alert('연결된 계정 없음'); return }
    const today = new Date()
    const oneYearLater = new Date(today)
    oneYearLater.setFullYear(today.getFullYear() + 1)
    oneYearLater.setDate(today.getDate() - 1)
    const yy = String(today.getFullYear()).slice(2)
    const activeCount = users.filter(u => u.press_no).length
    const nextNo = `${yy}-${String(activeCount + 1).padStart(3, '0')}`
    const validFromIso = isoDate(today)
    const validUntilIso = isoDate(oneYearLater)
    const nowIso = new Date().toISOString()

    // 1) users 업데이트 (role/press_no 등)
    const { error: e1 } = await supabase.from('users').update({
      role: 'writer',
      is_active: true,
      press_no: nextNo,
      valid_from: validFromIso,
      valid_until: validUntilIso,
    }).eq('id', app.user_id)
    if (e1) { alert(`승인 실패 (users): ${e1.message}`); return }

    // 2) writer_applications 업데이트
    const { error: e2 } = await supabase.from('writer_applications').update({
      status: 'approved',
      processed_at: nowIso,
      processed_by: profile?.id || null,
    }).eq('id', app.id)
    if (e2) { alert(`승인 실패 (application): ${e2.message}`); return }

    // 3) 로컬 state 동기화
    setUsers(users.map(u => u.id === app.user_id ? {
      ...u, role: 'writer', is_active: true,
      press_no: nextNo, valid_from: validFromIso, valid_until: validUntilIso,
    } : u))
    setApplications(applications.map(a => a.id === app.id ? {
      ...a, status: 'approved', processed_at: nowIso, processed_by: profile?.id || null,
      users: { ...a.users, role: 'writer', is_active: true,
        press_no: nextNo, valid_from: validFromIso, valid_until: validUntilIso },
    } : a))
    setApprovedUserId(app.user_id)
  }

  const startAppReject = (id) => { setAppRejectingId(id); setAppRejectReason('') }
  const cancelAppReject = () => { setAppRejectingId(null); setAppRejectReason('') }
  const confirmAppReject = async (app) => {
    const reason = appRejectReason.trim() || null
    if (!reason) { alert('반려 사유를 입력해주세요.'); return }
    const nowIso = new Date().toISOString()

    const { error } = await supabase.from('writer_applications').update({
      status: 'rejected',
      reject_reason: reason,
      processed_at: nowIso,
      processed_by: profile?.id || null,
    }).eq('id', app.id)
    if (error) { alert(`반려 실패: ${error.message}`); return }

    setApplications(applications.map(a => a.id === app.id ? {
      ...a, status: 'rejected', reject_reason: reason,
      processed_at: nowIso, processed_by: profile?.id || null,
    } : a))
    setAppRejectingId(null); setAppRejectReason('')
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
  // rejectUser 제거 — 새 confirmAppReject(writer_applications 기반)로 대체

  // ━━ 카드뉴스 삭제 — DB row + Storage 파일 모두 정리 ━━
  // afterDelete: 호출 후 추가 작업 (모달 닫기 등)
  const deleteCardnews = async (article, afterDelete) => {
    if (!article?.id) return
    const ok = window.confirm(
      '이 기사의 카드뉴스를 삭제합니다.\n\n' +
      '슬라이드와 이미지가 모두 삭제되며 복구할 수 없습니다.\n\n' +
      '계속하시겠습니까?'
    )
    if (!ok) return

    try {
      // ① Storage 이미지 정리 — 파일명 prefix가 article.id
      const { data: files, error: listErr } = await supabase
        .storage.from('cardnews-images')
        .list('', { limit: 1000 })
      if (listErr) console.warn('Storage list 실패:', listErr.message)
      const targets = (files || [])
        .filter(f => f.name.startsWith(article.id))
        .map(f => f.name)
      if (targets.length > 0) {
        const { error: rmErr } = await supabase
          .storage.from('cardnews-images')
          .remove(targets)
        if (rmErr) console.warn('Storage remove 실패:', rmErr.message)
      }

      // ② DB row 삭제
      const { error: delErr } = await supabase
        .from('cardnews').delete().eq('article_id', article.id)
      if (delErr) {
        alert(`카드뉴스 삭제 실패: ${delErr.message}`)
        console.error('cardnews delete error:', delErr)
        return
      }

      // ③ state 갱신 — 해당 article.id를 cardnewsSet에서 제거
      setCardnewsSet(prev => {
        const next = new Set(prev)
        next.delete(article.id)
        return next
      })

      alert(`카드뉴스가 삭제되었습니다.\n(Storage 파일 ${targets.length}개도 정리됨)`)
      if (typeof afterDelete === 'function') afterDelete()
    } catch (err) {
      alert(`카드뉴스 삭제 실패: ${err.message}`)
      console.error('deleteCardnews error:', err)
    }
  }

  // 발행 기사 삭제 — 2단계 confirm + cardnews/comments 선삭제 + thumbnail Storage 정리
  const deleteArticle = async (article) => {
    if (!window.confirm(`이 기사를 삭제하시겠습니까?\n\n[${article.title}]`)) return
    if (!window.confirm('삭제된 기사는 복구할 수 없습니다.\n계속하시겠습니까?')) return
    try {
      // ① FK 의존성 선삭제 (cardnews + comments) — cascade 미설정 대비
      await supabase.from('cardnews').delete().eq('article_id', article.id)
      await supabase.from('comments').delete().eq('article_id', article.id)

      // ② articles row 삭제
      const { error: delErr } = await supabase
        .from('articles').delete().eq('id', article.id)
      if (delErr) {
        alert(`기사 삭제 실패: ${delErr.message}`)
        console.error('deleteArticle error:', delErr)
        return
      }

      // ③ thumbnail Storage 파일 정리 (Supabase Storage URL일 때만)
      let storagePath = null
      if (article.thumbnail_url) {
        const m = article.thumbnail_url.match(/\/storage\/v1\/object\/public\/article-images\/(.+)$/)
        if (m) storagePath = m[1]
      }
      if (storagePath) {
        const { error: stErr } = await supabase.storage
          .from('article-images').remove([storagePath])
        if (stErr) console.warn('Storage 파일 삭제 실패 (무시):', stErr.message)
      }

      // ④ state 갱신 — articles 목록에서 제거
      setArticles(prev => prev.filter(a => a.id !== article.id))
      // cardnewsSet에서도 제거
      setCardnewsSet(prev => {
        const next = new Set(prev)
        next.delete(article.id)
        return next
      })

      alert(`기사가 삭제되었습니다.${storagePath ? '\n(Storage 파일도 함께 정리)' : ''}`)
    } catch (err) {
      alert(`기사 삭제 중 오류: ${err.message}`)
      console.error('deleteArticle error:', err)
    }
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
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'space-between', gap: 12,
              margin: '0 0 20px 0',
            }}>
              <h1 style={{
                fontFamily: SERIF, fontSize: 24, fontWeight: 700,
                color: NAVY, margin: 0, lineHeight: 1.4,
              }}>
                📰 기사 관리
              </h1>
              <Link to="/write" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: NAVY, color: '#fff',
                border: `2px solid ${GOLD}`,
                padding: '12px 22px', borderRadius: 8,
                fontSize: 15, fontWeight: 700,
                textDecoration: 'none', fontFamily: SANS,
                boxShadow: '0 2px 8px rgba(13,45,82,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,45,82,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,45,82,0.18)' }}>
                <span>✏️</span><span>새 기사 쓰기</span>
              </Link>
            </div>

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
            {visibleArticles.map(a => {
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
                        {canAct && (
                          <button onClick={() => confirmReject(a.id)}
                            style={{
                              padding: '10px 20px', fontSize: 15, fontWeight: 700,
                              background: ORANGE, color: '#fff', border: 'none', borderRadius: 8,
                              cursor: 'pointer', fontFamily: SANS,
                            }}>
                            반려 확인
                          </button>
                        )}
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
                          {canAct && <button onClick={() => approveArticle(a.id)} style={btnStyle(GREEN)}>✅ 승인·발행</button>}
                          {canAct && <button onClick={() => startReject(a.id)} style={btnStyle(ORANGE)}>❌ 반려</button>}
                          <button onClick={() => setPreviewArticle(a)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                      {a.status === 'published' && (
                        <>
                          {canAct && (
                            <button onClick={() => setModalArticle({
                              ...a,
                              thumb: a.thumbnail_url,
                              channel: a.channels?.name || '',
                              reporter: a.author_name || '',
                              submittedAt: formatDateTime(a.created_at),
                            })} style={btnStyle(NAVY)}>
                              {cardnewsSet.has(a.id) ? '🖼 카드뉴스 편집' : '🖼 카드뉴스 만들기'}
                            </button>
                          )}
                          {canAct && cardnewsSet.has(a.id) && (
                            <button onClick={() => deleteCardnews(a)} style={btnStyle(RED, true)}>
                              🗑 카드뉴스 삭제
                            </button>
                          )}
                          {canAct && (
                            <Link to={`/write?id=${a.id}`} style={{ ...btnStyle(BLUE), textDecoration: 'none', display: 'inline-block' }}>
                              ✏️ 편집
                            </Link>
                          )}
                          {canAct && (
                            <button onClick={() => deleteArticle(a)} style={btnStyle(RED, true)}>
                              🗑 삭제
                            </button>
                          )}
                          <a href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer"
                             style={{ ...btnStyle('#666', true), textDecoration: 'none', display: 'inline-block' }}>
                            👁 기사 보기
                          </a>
                        </>
                      )}
                      {a.status === 'rejected' && (
                        <>
                          {canAct && <button onClick={() => reReview(a.id)} style={btnStyle(BLUE)}>🔄 재검토</button>}
                          <button onClick={() => setPreviewArticle(a)} style={btnStyle('#666', true)}>👁 미리보기</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {hasMoreArticles && (
              <button
                type="button"
                onClick={() => setVisibleArticleCount(c => c + PAGE_SIZE)}
                style={{
                  width: '100%', padding: '12px 16px', marginTop: 12,
                  background: '#fff', color: NAVY,
                  border: `1px solid ${NAVY}`, borderRadius: 8,
                  fontFamily: SANS, fontSize: 16, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⬇ 더보기 ({remainingArticles})
              </button>
            )}
          </div>
        )}

        {/* ━━ 탭 2: 시민기자 관리 (writer_applications 중심 + legacy writer 옵션 iii) ━━ */}
        {activeTab === 2 && (() => {
          // 통합 entries: applications + (신청서 없는 legacy writer)
          // publisher/admin은 시민기자 관리 대상 아님 → 제외
          const appUserIds = new Set(applications.map(a => a.user_id).filter(Boolean))
          const legacyWriters = users.filter(u => u.role === 'writer' && !appUserIds.has(u.id))
          const entries = [
            ...applications.map(app => ({ kind: 'app', app, user: app.users || null })),
            ...legacyWriters.map(u => ({ kind: 'legacy', app: null, user: u })),
          ]
          const filteredEntries = entries.filter(e => {
            if (userFilter === 'all') return true
            if (userFilter === 'pending') return e.kind === 'app' && e.app.status === 'pending'
            if (userFilter === 'active') {
              if (e.kind === 'legacy') return e.user?.is_active
              return e.app.status === 'approved' && e.user?.is_active
            }
            if (userFilter === 'rejected') return e.kind === 'app' && e.app.status === 'rejected'
            return true
          })
          // 정렬: pending이 위 → applied_at 내림차순
          filteredEntries.sort((a, b) => {
            const sa = a.kind === 'app' && a.app.status === 'pending' ? 0 : 1
            const sb = b.kind === 'app' && b.app.status === 'pending' ? 0 : 1
            if (sa !== sb) return sa - sb
            const ta = a.kind === 'app' ? new Date(a.app.applied_at).getTime() : new Date(a.user?.created_at || 0).getTime()
            const tb = b.kind === 'app' ? new Date(b.app.applied_at).getTime() : new Date(b.user?.created_at || 0).getTime()
            return tb - ta
          })

          return (
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

            {filteredEntries.length === 0 && (
              <div style={{ ...card, textAlign: 'center', color: '#888', fontSize: 18, padding: 40 }}>
                해당 상태의 시민기자/신청자가 없습니다.
              </div>
            )}

            {filteredEntries.map((e) => {
              const app = e.app
              const u = e.user
              const isApp = e.kind === 'app'
              const status = isApp ? app.status : 'approved'  // legacy = 활동중
              const isRejecting = isApp && appRejectingId === app.id
              const expiryStatus = u ? getExpiryStatus(u.valid_until) : 'valid'
              const expiryColor = expiryStatus === 'expired' ? RED : (expiryStatus === 'warning' ? ORANGE : '#3a3a3a')
              const expiryLabel = expiryStatus === 'expired' ? '🔴 자격 만료' : (expiryStatus === 'warning' ? '⚠️ 갱신 필요' : '')

              // 상태 배지
              const badge = status === 'pending' ? { label: '🔴 승인대기', color: RED, bg: '#fef0ef' }
                          : status === 'rejected' ? { label: '❌ 반려됨', color: ORANGE, bg: '#fff8f0' }
                          : (u?.is_active === false ? { label: '🚫 정지됨', color: '#888', bg: '#f0f0f0' }
                                                     : { label: '✅ 활동중', color: GREEN, bg: '#eef7f2' })

              const showApprovedBanner = isApp && approvedUserId === app.user_id && status === 'approved' && u?.is_active

              const key = isApp ? `app-${app.id}` : `legacy-${u.id}`
              return (
                <div key={key} style={card}>
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

                  {/* 이름 + 상태 + 신청일 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: NAVY }}>
                      {isApp ? (app.name || u?.nickname || '(이름 없음)') : (u.nickname || '(이름 없음)')}
                    </span>
                    <span style={{
                      background: badge.bg, color: badge.color, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 12, fontSize: 13,
                    }}>{badge.label}</span>
                    {!isApp && (
                      <span style={{ background: '#f0f0f0', color: '#666', padding: '3px 8px', borderRadius: 8, fontSize: 11 }}>
                        신청서 없음 (legacy)
                      </span>
                    )}
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 'auto' }}>
                      {isApp
                        ? `신청일: ${dbDateToShort(app.applied_at)}`
                        : `가입일: ${dbDateToShort(u.created_at)}`}
                    </span>
                  </div>

                  {/* 신청서 정보 (writer_applications row 있을 때만) */}
                  {isApp && (
                    <div style={{ background: '#f7f8fa', borderRadius: 8, padding: '14px 16px', marginBottom: 12, fontSize: 14, lineHeight: 1.8, color: '#333' }}>
                      <div><strong style={{ color: NAVY }}>📞 전화</strong> {app.phone || '(미입력)'}</div>
                      <div><strong style={{ color: NAVY }}>📍 지역</strong> {app.region || '(미입력)'}</div>
                      <div><strong style={{ color: NAVY }}>🎓 봉숭아학당</strong> {app.qualify || '(미입력)'}</div>
                      {u?.email && <div><strong style={{ color: NAVY }}>📧 이메일</strong> {u.email}</div>}
                      <div style={{ marginTop: 8 }}>
                        <strong style={{ color: NAVY }}>✍️ 지원 동기</strong>
                        <div style={{ whiteSpace: 'pre-wrap', marginTop: 4, padding: '8px 10px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6 }}>
                          {app.motive || '(미입력)'}
                        </div>
                      </div>
                      {app.experience && (
                        <div style={{ marginTop: 8 }}>
                          <strong style={{ color: NAVY }}>💼 경험</strong>
                          <div style={{ whiteSpace: 'pre-wrap', marginTop: 4, padding: '8px 10px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6 }}>
                            {app.experience}
                          </div>
                        </div>
                      )}
                      {app.status === 'rejected' && app.reject_reason && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: '#fff8f0', border: '1px solid #fdba74', borderRadius: 6, color: '#9a3412' }}>
                          <strong>반려 사유:</strong> {app.reject_reason}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 기자증 (press_no 있을 때) */}
                  {u?.press_no && (
                    <div style={{ background: '#f7f8fa', borderRadius: 8, padding: '12px 16px', marginBottom: 12, fontSize: 14, lineHeight: 1.85 }}>
                      <div style={{ color: '#666' }}>
                        기자증: <strong style={{ color: NAVY }}>이음미디어/No. {u.press_no}</strong>
                      </div>
                      <div style={{ color: expiryColor, fontWeight: expiryStatus !== 'valid' ? 700 : 500 }}>
                        유효기간: {dbDateToShort(u.valid_from)} ~ {dbDateToShort(u.valid_until)}
                        {expiryLabel && <span style={{ marginLeft: 8 }}>{expiryLabel}</span>}
                      </div>
                    </div>
                  )}

                  {/* 반려 사유 입력 모달 (응급) */}
                  {isRejecting && (
                    <div style={{ background: '#fff8f0', border: `1px solid ${ORANGE}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>반려 사유를 입력해주세요</div>
                      <textarea
                        style={{ width: '100%', height: 90, padding: 10, border: '1px solid #d0d0d0', borderRadius: 6, fontSize: 14, fontFamily: SANS, resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                        value={appRejectReason}
                        onChange={ev => setAppRejectReason(ev.target.value)}
                        placeholder="신청자에게 전달할 반려 사유를 입력하세요" />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {canAct && (
                          <button onClick={() => confirmAppReject(app)}
                            style={{ padding: '8px 16px', fontSize: 14, fontWeight: 700, background: ORANGE, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: SANS }}>
                            반려 확인
                          </button>
                        )}
                        <button onClick={cancelAppReject}
                          style={{ padding: '8px 16px', fontSize: 14, fontWeight: 600, background: '#fff', color: '#666', border: '1px solid #d0d0d0', borderRadius: 6, cursor: 'pointer', fontFamily: SANS }}>
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  {!isRejecting && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {isApp && status === 'pending' && canAct && (
                        <>
                          <button onClick={() => approveApplication(app)} style={btnStyle(GREEN)}>✅ 시민기자 승인</button>
                          <button onClick={() => startAppReject(app.id)} style={btnStyle(ORANGE)}>❌ 반려</button>
                        </>
                      )}
                      {status === 'approved' && u?.is_active && (
                        <>
                          {canAct && <button onClick={() => renewUser(u.id)} style={btnStyle(BLUE)}>🔄 1년 갱신</button>}
                          {canAct && <button onClick={() => suspendUser(u.id)} style={btnStyle(ORANGE)}>🚫 활동 정지</button>}
                          <button onClick={() => alert(`${u.nickname} 기자의 기사 목록으로 이동합니다.`)} style={btnStyle('#666', true)}>📋 기사 보기</button>
                        </>
                      )}
                      {status === 'approved' && u && !u.is_active && canAct && (
                        <button onClick={() => reactivateUser(u.id)} style={btnStyle(BLUE)}>🔄 재활성화</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )
        })()}

        {/* ━━ 탭 5: 회원 관리 ━━ */}
        {activeTab === 5 && (
          <div>
            {/* 헤더 + CSV 버튼 */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center',
              justifyContent: 'space-between', gap: 12, margin: '0 0 12px 0',
            }}>
              <h1 style={{
                fontFamily: SERIF, fontSize: 24, fontWeight: 700,
                color: NAVY, margin: 0, lineHeight: 1.4,
              }}>
                🧑‍🤝‍🧑 회원 관리
                <span style={{ fontSize: 16, fontWeight: 500, color: '#888', marginLeft: 8 }}>
                  · 전체 {users.length}명
                </span>
              </h1>
              <button type="button" onClick={downloadMembersCsv} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: NAVY, color: '#fff',
                border: `2px solid ${GOLD}`,
                padding: '12px 22px', borderRadius: 8,
                fontSize: 15, fontWeight: 700, fontFamily: SANS,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,45,82,0.18)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(13,45,82,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(13,45,82,0.18)' }}>
                <span>📥</span><span>CSV 내보내기</span>
              </button>
            </div>

            {/* 개인정보 안내 */}
            <div style={{
              background: '#fff8e1', borderLeft: `4px solid ${ORANGE}`,
              padding: '12px 16px', fontSize: 13, color: '#7d5a00',
              lineHeight: 1.6, marginBottom: 18, borderRadius: 4,
            }}>
              🔒 회원 개인정보입니다. 다운로드 파일은 안전하게 관리하고 사용 후 삭제하세요.
            </div>

            {/* role 필터 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {MEMBER_FILTERS.map(f => {
                const count = f.key === 'all'
                  ? users.length
                  : f.key === 'other'
                    ? users.filter(u => !STANDARD_ROLES.includes(u.role)).length
                    : users.filter(u => u.role === f.key).length
                const sel = memberFilter === f.key
                return (
                  <button key={f.key} type="button" onClick={() => setMemberFilter(f.key)}
                    style={{
                      padding: '10px 16px', fontSize: 14, fontWeight: 600,
                      fontFamily: SANS,
                      background: sel ? NAVY : '#fff',
                      color: sel ? '#fff' : '#3a3a3a',
                      border: `1px solid ${sel ? NAVY : '#d0d0d0'}`,
                      borderRadius: 24, cursor: 'pointer',
                    }}>
                    {f.label} {count}
                  </button>
                )
              })}
            </div>

            {/* 목록 */}
            {filteredMembers.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', color: '#888', fontSize: 16, padding: 40 }}>
                해당 필터의 회원이 없습니다.
              </div>
            ) : (
              <div style={{
                overflowX: 'auto', background: '#fff',
                border: '1px solid #e5e5e5', borderRadius: 8,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 600 }}>
                  <thead style={{ background: '#fafafa' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>닉네임</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>이메일</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>권한</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>가입일</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: NAVY, fontWeight: 700, borderBottom: '1px solid #ebebeb' }}>활성</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(u => {
                      const badgeColor = u.role === 'admin' ? ORANGE
                        : u.role === 'writer' ? BLUE
                        : u.role === 'publisher' ? GREEN
                        : u.role === 'reader' ? '#555'
                        : RED
                      const badgeBg = u.role === 'admin' ? '#fdf3e0'
                        : u.role === 'writer' ? '#e8f4ff'
                        : u.role === 'publisher' ? '#eef7f2'
                        : u.role === 'reader' ? '#f0f0f0'
                        : '#fef0ef'
                      return (
                        <tr key={u.id} style={{ borderTop: '1px solid #ebebeb' }}>
                          <td style={{ padding: '12px 16px', color: '#2a2a2a' }}>{u.nickname || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#3a3a3a' }}>{u.email || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block', padding: '4px 10px', borderRadius: 12,
                              fontSize: 12, fontWeight: 700,
                              background: badgeBg, color: badgeColor,
                            }}>{memberRoleLabel(u.role)}</span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#3a3a3a' }}>{formatMemberDate(u.created_at)}</td>
                          <td style={{ padding: '12px 16px', color: u.is_active ? GREEN : RED, fontWeight: 700 }}>
                            {u.is_active ? '✅' : '⛔'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
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

      <CardNewsModal
        article={modalArticle}
        onClose={() => setModalArticle(null)}
        onDelete={canAct && cardnewsSet.has(modalArticle?.id)
          ? () => deleteCardnews(modalArticle, () => setModalArticle(null))
          : undefined}
        onSaved={(id) => setCardnewsSet(prev => {
          const next = new Set(prev)
          next.add(id)
          return next
        })}
      />
      <PreviewModal article={previewArticle} onClose={() => setPreviewArticle(null)} />
    </div>
  )
}
