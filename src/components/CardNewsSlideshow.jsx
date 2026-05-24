import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardSlide from "./CardSlide";

// 카드뉴스 슬라이드쇼 모달 — 5장 (C안 CardSlide 사용)
// 키보드: ESC 닫기, ← → 슬라이드 이동. 오버레이/X 버튼으로 닫기.
//
// props:
//   cardnews: { slides: [...], articles?: { slug, thumbnail_url, channels:{name} }, ... }
//   onClose: 닫기 콜백
//   articleThumbnail: 표지/엔딩 배경 fallback (옵셔널, cardnews.articles 없을 때)
//   channelName: 표지 chip (옵셔널)
//   articleSlug: 엔딩 슬라이드 "전체 기사 보기 →" 클릭 시 이동할 slug (옵셔널)
//     · 우선순위: prop articleSlug > cardnews.articles.slug
//     · 있으면 엔딩 버튼 활성, 없으면 데코 div
//
// 호출 측 (ArticleDetail 등)에서 articleThumbnail/channelName/articleSlug를 명시적으로
// 넘기면 cardnews에 articles JOIN 없어도 OK.
export default function CardNewsSlideshow({ cardnews, onClose, articleThumbnail, channelName, articleSlug }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const total = cardnews?.slides?.length ?? 0;

  useEffect(() => {
    if (!cardnews) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setIdx(i => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIdx(i => Math.min(total - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [cardnews, total, onClose]);

  if (!cardnews) return null;
  const slide = cardnews.slides?.[idx];
  if (!slide) return null;

  const article = cardnews.articles;
  const linkSlug = articleSlug ?? article?.slug;
  const thumb = articleThumbnail ?? article?.thumbnail_url;
  const chName = channelName ?? article?.channels?.name;
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

  // 엔딩 슬라이드 "전체 기사 보기 →" 클릭 핸들러 (slug 있을 때만)
  const onArticleClick = linkSlug
    ? () => { onClose(); navigate(`/article/${linkSlug}`); }
    : undefined;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1200, padding: 20, boxSizing: 'border-box',
      }}>
      {/* X 닫기 */}
      <button onClick={onClose} aria-label="닫기"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1,
          zIndex: 10,
        }}>✕</button>

      <div onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
        {/* 카운터 */}
        <div style={{
          color: '#fff', fontSize: 13, opacity: 0.8, marginBottom: 10,
          letterSpacing: 1, fontFamily: "'Noto Sans KR',sans-serif",
        }}>
          {idx + 1} / {total}
        </div>

        {/* 슬라이드 본체 — C안 CardSlide (type별 분기 자동) */}
        <div style={{ width: '100%' }}>
          <CardSlide
            slide={slide}
            articleThumbnail={thumb}
            channelName={chName}
            onArticleClick={slide.type === 'ending' ? onArticleClick : undefined}
          />
        </div>

        {/* 좌우 화살표 + 진행 인디케이터 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, marginTop: 16,
        }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={isFirst} aria-label="이전"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: isFirst ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              color: isFirst ? 'rgba(255,255,255,0.3)' : '#0d2d52',
              border: 'none', fontSize: 20, fontWeight: 900,
              cursor: isFirst ? 'not-allowed' : 'pointer', lineHeight: 1,
            }}>‹</button>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} style={{
                width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
                background: i === idx ? '#c9a84c' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }} />
            ))}
          </div>
          <button onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
            disabled={isLast} aria-label="다음"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: isLast ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
              color: isLast ? 'rgba(255,255,255,0.3)' : '#0d2d52',
              border: 'none', fontSize: 20, fontWeight: 900,
              cursor: isLast ? 'not-allowed' : 'pointer', lineHeight: 1,
            }}>›</button>
        </div>

        {/* 기사 전문 보기는 이제 엔딩 슬라이드(C안) 내부 "전체 기사 보기 →"
            버튼이 담당. 모달 외부 별도 Link는 중복 제거됨. */}
      </div>
    </div>
  );
}
