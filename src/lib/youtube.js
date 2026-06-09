// YouTube URL 패턴 — watch?v=, embed/, shorts/, live/, youtu.be/
// 도메인 변형: youtube.com / www.youtube.com / m.youtube.com 모두 지원
// 쿼리·타임스탬프(?t=, &si=) 등 부가 파라미터는 11자 ID 뒤로 흘려보냄
const YT_RE = /(?:(?:m\.|www\.)?youtube\.com\/(?:watch\?(?:[^&]*&)*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

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
