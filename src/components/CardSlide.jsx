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

  // ───────── 표지 (A안: 사진 또렷 + 아래 58% 그라데이션) ─────────
  // fluid typography: containerType inline-size + clamp(min, Xcqi, max)
  //   · 기준 컨테이너 480px = "정상" 사이즈 (모달 표지)
  //   · 1cqi = 1% of container inline size
  //   · max는 480px 기준값 그대로, min은 91px 갤러리 카드에서도 읽히는 값
  if (type === 'cover') {
    return (
      <div style={{ ...base, background: NAVY, containerType: 'inline-size' }}>
        {bgImage && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        )}
        {/* 아래쪽 58% 높이만 그라데이션 (위 투명 → 아래 짙은 네이비) */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          height: '58%',
          background: 'linear-gradient(180deg, transparent, rgba(8,32,60,.93))',
        }} />
        {/* 흰 반투명 큰 따옴표 deco — 밝은 사진 위에서도 보이게 */}
        <div style={{
          position: 'absolute',
          top: 'clamp(8px, 6.25cqi, 30px)',
          right: 'clamp(10px, 7.08cqi, 34px)',
          zIndex: 3,
          fontFamily: SERIF,
          fontSize: 'clamp(28px, 17.5cqi, 84px)',
          color: 'rgba(255,255,255,.6)',
          lineHeight: .7,
        }}>&ldquo;</div>
        {/* 본문 */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          padding: 'clamp(12px, 9.17cqi, 44px) clamp(10px, 7.92cqi, 38px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
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
              marginBottom: 'clamp(6px, 3.75cqi, 18px)',
            }}>{channelName}</span>
          )}
          <div style={{
            fontFamily: SERIF, fontWeight: 800, color: '#fff',
            fontSize: 'clamp(11px, 7.92cqi, 38px)',
            lineHeight: 1.34,
            whiteSpace: 'pre-wrap', wordBreak: 'keep-all',
          }}>{title}</div>
          <div style={{
            width: 'clamp(20px, 10.42cqi, 50px)',
            height: 'clamp(2px, 0.83cqi, 4px)',
            background: GOLD,
            margin: 'clamp(8px, 4.17cqi, 20px) 0 clamp(6px, 2.92cqi, 14px)',
          }} />
          {text && (
            <div style={{
              color: GOLD_SOFT,
              fontSize: 'clamp(8.5px, 2.92cqi, 14px)',
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
