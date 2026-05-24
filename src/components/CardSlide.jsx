// 카드뉴스 1장 렌더 — C안 (4:5 1080×1350)
// 5장 한 벌: 표지(cover) / 본문(main) ×3 / 엔딩(ending)
//
// props:
//   slide: { order, type, title, text, image_url }
//   articleThumbnail: 표지·엔딩 배경 fallback (slide.image_url 비어있을 때)
//   channelName: 표지·본문 chip에 노출 (옵셔널)
//   onArticleClick: 엔딩 "전체 기사 보기 →" 클릭 핸들러 (옵셔널)
//     · 넘기면 골드 박스가 button으로 활성 (클릭 시 호출)
//     · 안 넘기면 기존처럼 div(데코)로만 렌더

const NAVY = '#0d2d52';
const NAVY_DEEP = '#08203c';
const GOLD = '#c9a84c';
const GOLD_SOFT = '#d8bd6e';
const IVORY = '#f6f1e4';
const SERIF = "'Nanum Myeongjo', serif";
const SANS = "'Noto Sans KR', sans-serif";

const TOTAL = 5;

export default function CardSlide({ slide, articleThumbnail, channelName, onArticleClick }) {
  if (!slide) return null;
  const { order, type, title = '', text = '', image_url } = slide;

  // 표지·엔딩의 배경 사진: slide.image_url 우선, 없으면 article 대표 이미지
  const bgImage = image_url || articleThumbnail || '';

  // 본문(main) 큰 숫자: 01~03 (order 2,3,4 → 1,2,3)
  const bigNum = String(order - 1).padStart(2, '0');

  const base = {
    position: 'relative', width: '100%', aspectRatio: '1080 / 1350',
    borderRadius: 18, overflow: 'hidden', background: '#000',
    boxShadow: '0 16px 40px rgba(13,45,82,.3)',
    fontFamily: SANS,
  };

  // ───────── 표지 (B안: 사진/글 분리 — 사진 위 글씨 0) ─────────
  // 구조:
  //   ┌────────────┐
  //   │  사진 또렷   │ 위 65% — filter/opacity 없음, 글씨 없음
  //   │ ░끝만 페이드░│ 사진 영역 아래 1/4만 짧은 네이비 페이드 (이음새)
  //   ├────────────┤
  //   │ 채널칩       │
  //   │ 제목         │ 아래 35% — 네이비(#0d2d52) 단색 띠
  //   │ 골드 라인    │     모든 글씨는 이 띠 안
  //   └────────────┘
  // fluid typography 그대로: containerType inline-size + clamp(min, Xcqi, max)
  if (type === 'cover') {
    return (
      <div style={{ ...base, background: NAVY, containerType: 'inline-size' }}>
        {/* ① 사진 영역 (위 65%) — 또렷, 글씨 일절 없음 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '65%', overflow: 'hidden',
          background: NAVY_DEEP, // bgImage 없을 때 placeholder
        }}>
          {bgImage && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
          )}
          {/* 사진 끝부분만 짧은 페이드 (이음새, 사진 안 가림) */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '28%',
            background: 'linear-gradient(180deg, transparent, rgba(13,45,82,.85))',
          }} />
        </div>

        {/* ② 글 영역 (아래 35%) — 네이비 단색 띠, 모든 글씨 여기 */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: '35%', background: NAVY, zIndex: 2,
          padding: 'clamp(10px, 6.67cqi, 32px) clamp(10px, 7.92cqi, 38px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxSizing: 'border-box',
        }}>
          {channelName && (
            <span style={{
              alignSelf: 'flex-start',
              fontSize: 'clamp(8.5px, 2.5cqi, 12px)',
              fontWeight: 700,
              letterSpacing: 'clamp(0.3px, 0.21cqi, 1px)',
              color: NAVY, background: GOLD,
              padding: 'clamp(2px, 1.04cqi, 5px) clamp(6px, 2.92cqi, 14px)',
              borderRadius: 'clamp(2px, 0.83cqi, 4px)',
              marginBottom: 'clamp(6px, 2.5cqi, 12px)',
            }}>{channelName}</span>
          )}
          <div style={{
            fontFamily: SERIF, fontWeight: 800, color: '#fff',
            fontSize: 'clamp(11px, 7.5cqi, 36px)',
            lineHeight: 1.32,
            whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
          }}>{title}</div>
          <div style={{
            width: 'clamp(20px, 10.42cqi, 50px)',
            height: 'clamp(2px, 0.83cqi, 4px)',
            background: GOLD,
            margin: 'clamp(6px, 3.13cqi, 15px) 0 clamp(4px, 2.08cqi, 10px)',
          }} />
          {text && (
            <div style={{
              color: GOLD_SOFT,
              fontSize: 'clamp(8.5px, 2.71cqi, 13px)',
              letterSpacing: 'clamp(0.15px, 0.1cqi, 0.5px)',
              whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
            }}>{text}</div>
          )}
        </div>
      </div>
    );
  }

  // ───────── 엔딩 ─────────
  if (type === 'ending') {
    return (
      <div style={{
        ...base,
        background: `linear-gradient(165deg, ${NAVY}, ${NAVY_DEEP})`,
      }}>
        {bgImage && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'grayscale(1) brightness(.3)', opacity: .25,
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          padding: '44px 38px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>📖</div>
          <div style={{
            fontFamily: SERIF, fontWeight: 700, color: '#fff',
            fontSize: 26, lineHeight: 1.5,
            whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
          }}>{text || '더 깊은 이야기가\n기다리고 있습니다'}</div>
          {onArticleClick ? (
            <button type="button" onClick={onArticleClick}
              style={{
                display: 'inline-block', background: GOLD, color: NAVY,
                fontWeight: 900, fontSize: 16,
                padding: '15px 32px', borderRadius: 7,
                margin: '24px 0 22px',
                border: 0, cursor: 'pointer', fontFamily: 'inherit',
              }}>전체 기사 보기 →</button>
          ) : (
            <div style={{
              display: 'inline-block', background: GOLD, color: NAVY,
              fontWeight: 900, fontSize: 16,
              padding: '15px 32px', borderRadius: 7,
              margin: '24px 0 22px',
            }}>전체 기사 보기 →</div>
          )}
          <div style={{
            fontFamily: SERIF, fontWeight: 800,
            color: '#fff', fontSize: 19, letterSpacing: 1,
          }}>
            이음<span style={{ color: GOLD }}>미디어</span>
          </div>
          <div style={{ color: GOLD_SOFT, fontSize: 12.5, marginTop: 6 }}>
            세상과 당신을 잇는 인터넷신문
          </div>
        </div>
      </div>
    );
  }

  // ───────── 본문 (main) ─────────
  return (
    <div style={{
      ...base,
      background: `linear-gradient(155deg, #fff 58%, ${IVORY} 58%)`,
    }}>
      {channelName && (
        <span style={{
          position: 'absolute', top: 34, left: 38, zIndex: 3,
          fontSize: 12, fontWeight: 700, letterSpacing: 1,
          color: '#fff', background: NAVY,
          padding: '5px 14px', borderRadius: 4,
        }}>{channelName}</span>
      )}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        padding: '44px 38px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: SERIF, fontWeight: 800,
          fontSize: 104, lineHeight: .85, color: GOLD, marginBottom: 14,
        }}>
          {bigNum}
          <small style={{ fontSize: 30, color: '#ccd1d9', fontWeight: 700 }}>
            {' / '}{String(TOTAL).padStart(2, '0')}
          </small>
        </div>
        {title && (
          <div style={{
            fontFamily: SERIF, fontWeight: 800,
            color: NAVY, fontSize: 35, lineHeight: 1.32, marginBottom: 18,
            whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
          }}>{title}</div>
        )}
        {text && (
          <div style={{
            color: '#555', fontSize: 16, lineHeight: 1.8,
            borderTop: '1.5px solid #e1e1e1', paddingTop: 16,
            whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
          }}>{text}</div>
        )}
      </div>
    </div>
  );
}
