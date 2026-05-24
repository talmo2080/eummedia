import { useState } from "react";
import CardSlide from "./CardSlide";

// 카드뉴스 갤러리 — 표지 카드 그리드 (모바일 2 / PC 3 + 더보기)
// 영상 갤러리 패턴을 카드뉴스에 이식. 카드 클릭 → 부모의 onOpen(item) 호출.
//
// props:
//   items: cardnews row 배열 (각 row는 slides + articles JOIN 포함)
//     · row.slides: 카드뉴스 5장 배열
//     · row.articles?.{ slug, thumbnail_url, channels:{name} }
//   onOpen(item): 카드 클릭 시 콜백 (부모에서 슬라이드쇼 모달 띄움)
//
// 0건이면 null. 1~MOBILE_INITIAL은 모두 표시, 그 이상이면 더보기 활성.
const MOBILE_INITIAL = 2;
const PC_INITIAL = 3;
const MAX_ITEMS = 9;

export default function CardNewsGallery({ items, onOpen }) {
  const [showAll, setShowAll] = useState(false);
  if (!Array.isArray(items) || items.length === 0) return null;

  const list = items.slice(0, MAX_ITEMS);

  // 모바일 더보기: items.length > MOBILE_INITIAL 일 때 표시
  // PC   더보기: items.length > PC_INITIAL 일 때 표시
  const hasMobileMore = !showAll && list.length > MOBILE_INITIAL;
  const hasPcMore = !showAll && list.length > PC_INITIAL;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
        {list.map((item, i) => {
          // 노출 조건 (Tailwind v4):
          //  · i < MOBILE_INITIAL: 항상 보임
          //  · i === MOBILE_INITIAL (=2): 모바일 숨김 / PC 보임
          //  · i >= PC_INITIAL (>=3): showAll 전에는 둘 다 숨김
          let hideClass = '';
          if (!showAll) {
            if (i >= PC_INITIAL) hideClass = 'hidden';
            else if (i >= MOBILE_INITIAL) hideClass = 'hidden lg:block';
          }
          const article = item.articles;
          const firstSlide = Array.isArray(item.slides) ? item.slides[0] : null;
          if (!firstSlide) return null;
          return (
            <div key={item.id || i} className={hideClass}>
              <button type="button"
                onClick={() => onOpen?.(item)}
                aria-label={`카드뉴스 5장 보기 — ${article?.title || ''}`}
                style={{
                  background: 'transparent', border: 0, padding: 0,
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  width: '100%', display: 'block',
                }}>
                <CardSlide
                  slide={firstSlide}
                  articleThumbnail={article?.thumbnail_url}
                  channelName={article?.channels?.name}
                />
              </button>
            </div>
          );
        })}
      </div>

      {(hasMobileMore || hasPcMore) && (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          {hasMobileMore && (
            <button type="button" onClick={() => setShowAll(true)}
              className="lg:hidden"
              style={{
                padding: '12px 28px', background: '#fff', color: '#0d2d52',
                border: '1.5px solid #0d2d52', borderRadius: 6,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>
              카드뉴스 더보기 ({list.length - MOBILE_INITIAL}) →
            </button>
          )}
          {hasPcMore && (
            <button type="button" onClick={() => setShowAll(true)}
              className="hidden lg:inline-block"
              style={{
                padding: '12px 28px', background: '#fff', color: '#0d2d52',
                border: '1.5px solid #0d2d52', borderRadius: 6,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Noto Sans KR',sans-serif",
              }}>
              카드뉴스 더보기 ({list.length - PC_INITIAL}) →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
