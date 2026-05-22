// YouTube URL → embed URL 변환 헬퍼
// 지원: watch?v=, youtu.be/, embed/, shorts/ (+ m.youtube, 쿼리·타임스탬프 변형)
// 실패 시 null 반환 — 호출 측은 null이면 영상 영역 생략
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const re = /(?:youtube\.com\/watch\?(?:[^&]*&)*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = url.match(re);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
