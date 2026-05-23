// YouTube URL 패턴 — watch?v=, youtu.be/, embed/, shorts/ (+ m.youtube, 쿼리·타임스탬프 변형)
const YT_RE = /(?:youtube\.com\/watch\?(?:[^&]*&)*v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/;

// URL → 11자 VIDEO_ID. 실패 시 null
export function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(YT_RE);
  return m ? m[1] : null;
}

// URL → embed URL. 실패 시 null (호출 측은 null이면 영상 영역 생략)
export function getYouTubeEmbedUrl(url) {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
