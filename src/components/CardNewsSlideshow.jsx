import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CardSlide from "./CardSlide";

// 카드뉴스 슬라이드쇼 모달 — 5장 (C안 CardSlide 사용)
// 키보드: ESC 닫기, ← → 슬라이드 이동. 오버레이/X 버튼으로 닫기.
//
// props:
//   cardnews: { slides: [...], articles?: { slug, thumbnail_url, channels:{name} }, ... }
//   onClose: 닫기 콜백
//   articleThumbnail: 표지/엔딩 배경 fallback (옵셔널, cardnews.articles 없을 때)
//   channelName: 표지 chip (옵셔널)
//
// 호출 측 (ArticleDetail 등)에서 articleThumbnail/channelName을 명시적으로 넘기면
// cardnews에 articles JOIN 없어도 OK.
export default function CardNewsSlideshow({ cardnews, onClose, articleThumbnail, channelName }) {
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
  const articleSlug = article?.slug;
  const thumb = articleThumbnail ?? article?.thumbnail_url;
  const chName = channelName ?? article?.channels?.name;
  const isFirst = idx === 0;
  const isLast = idx === total - 1;

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

        {/* 기사 전문 보기 — articleSlug 있을 때만
            (ArticleDetail에서 호출 시엔 cardnews.articles JOIN 안 하므로 자동 숨김) */}
        {articleSlug && (
          <Link to={"/article/" + articleSlug} onClick={onClose}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginTop: 20, padding: '14px 28px',
              background: '#c9a84c', color: '#1a1a1a',
              fontFamily: "'Noto Sans KR',sans-serif",
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              borderRadius: 8,
            }}>
            📰 기사 전문 보기
          </Link>
        )}
      </div>
    </div>
  );
}
