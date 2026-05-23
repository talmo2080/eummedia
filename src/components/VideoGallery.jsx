import { useState } from "react";
import { Link } from "react-router-dom";
import { getYouTubeVideoId } from "../lib/youtube";

// 📺 영상 갤러리 — 큰 플레이어 + 썸네일 줄 (A안)
// videos 0건이면 섹션 자체 숨김 (null 반환), 1건이면 썸네일 줄 자동 숨김
export default function VideoGallery({ videos }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  if (!Array.isArray(videos) || videos.length === 0) return null;

  const active = videos[idx];
  const videoId = getYouTubeVideoId(active.video_url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  // 썸네일은 YouTube 표준 hqdefault 우선, 없으면 article.thumbnail_url fallback
  const thumb = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : active.thumbnail_url;
  const showStrip = videos.length >= 2;

  const onSelect = (i) => {
    setIdx(i);
    setPlaying(false); // 다른 영상 선택 시 ▶로 reset
  };

  return (
    <div>
      {/* 큰 플레이어 (16:9) */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        background: '#000', borderRadius: 8, overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        {playing && embedUrl ? (
          <iframe
            src={embedUrl}
            title={active.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', border: 0,
            }}
          />
        ) : (
          <button type="button"
            onClick={() => embedUrl && setPlaying(true)}
            aria-label="영상 재생"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              padding: 0, border: 0, cursor: embedUrl ? 'pointer' : 'default',
              background: 'transparent',
            }}>
            {thumb && (
              <img src={thumb} alt={active.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, paddingLeft: 6, lineHeight: 1,
              }}>▶</div>
            </div>
            {active.channels?.name && (
              <span style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(255,255,255,0.95)', color: '#1a1a1a',
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 3,
              }}>{active.channels.name}</span>
            )}
          </button>
        )}
      </div>

      {/* 제목 + 기사 전체 보기 */}
      <div style={{ marginTop: 12, marginBottom: 14 }}>
        <h3 style={{
          fontFamily: 'serif', fontSize: 17, fontWeight: 700,
          color: '#1a1a1a', lineHeight: 1.45, margin: '0 0 8px 0',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{active.title}</h3>
        <Link to={"/article/" + active.slug}
          style={{
            display: 'inline-block', fontSize: 13, fontWeight: 700,
            color: '#0d2d52', textDecoration: 'none',
            borderBottom: '1px solid #0d2d52', paddingBottom: 1,
          }}>
          이 기사 전체 보기 →
        </Link>
      </div>

      {/* 썸네일 줄 (2건 이상일 때만) */}
      {showStrip && (
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          paddingBottom: 6,
        }}>
          {videos.map((v, i) => {
            const vid = getYouTubeVideoId(v.video_url);
            const t = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : v.thumbnail_url;
            const isActive = i === idx;
            return (
              <button key={v.slug} type="button"
                onClick={() => onSelect(i)}
                aria-label={v.title}
                style={{
                  flexShrink: 0, width: 132, padding: 0,
                  background: 'transparent', cursor: 'pointer',
                  border: `3px solid ${isActive ? '#c9a84c' : 'transparent'}`,
                  borderRadius: 4, transition: 'border-color 0.15s',
                }}>
                <div style={{
                  position: 'relative', width: '100%', aspectRatio: '16 / 9',
                  overflow: 'hidden', background: '#000',
                }}>
                  {t && (
                    <img src={t} alt={v.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                  {!isActive && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.15)',
                    }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
