// ─────────────────────────────────────────────────────────────
// 낭독용 텍스트 변환 (Web Speech API 입력용)
//
// 목적: 눈이 피로한 독자·이동 중 독자를 위한 '기사 듣기' 기능의 낭독문 생성.
//       화면낭독기(스크린리더) 사용자는 별도 대상 아님 (본문 그대로 읽힘).
//
// 규칙 (지시서 【1】):
//   읽음:  제목 → 부제 → 소제목 → 본문 문단
//   제거:  [box]/[info]/[quote] 대괄호 자체, 사진 캡션, 태그, URL, 이메일,
//          해시태그, 구분선, 이모지
//   변환:  · "■ 운영 개요"        → "운영 개요"           (기호 제거)
//          · "· 참가 인원: 10명"  → "참가 인원 10명"      (가운뎃점·콜론 정리)
//          · [quote] 안             → "인용." 접두 후 읽기
//          · [box]  안 목록         → "정리." 접두 후 읽기
//          · [info] 안              → "안내." 접두 후 읽기 (지시서엔 없으나 [box]와 동종)
//          · 영문 병기 "(Tilting)"  → 괄호 안 스킵 (한글 옆 괄호 안이 영문만)
//          · 숫자+단위               → 그대로 (한국어 TTS가 대체로 잘 읽음)
//
// 문단 배열로 반환 → 재생부는 문단 단위로 순차 재생 (안드로이드 크롬
// 긴 텍스트 중단 회피, 지시서 【4】).
// ─────────────────────────────────────────────────────────────

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const URL_RE   = /https?:\/\/\S+/g;
const HASHTAG_RE = /(^|\s)#[^\s#]+/g;
// 이모지 계열 (기본 유니코드 블록 위주). 한글·문장부호는 건드리지 않음.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

// 인라인 마크업·태그 정리 (한 문단 안 처리).
// 순서 중요: 이미지/링크는 텍스트만 남기고, 그 뒤에 URL·이메일·이모지 제거.
export function cleanInline(text) {
  if (!text) return '';
  let s = String(text);

  // 커스텀 태그 [이미지:URL|캡션|alt] → 낭독에서 완전 제거 (지시서: 사진 캡션 뺄 것).
  // 화면낭독기 사용자는 alt로 별도 접근하므로 낭독문에는 넣지 않음.
  s = s.replace(/\[이미지:[^\]]+\]/g, ' ');

  // [링크:URL|텍스트] → 텍스트만 (URL 낭독 회피)
  s = s.replace(/\[링크:[^\]|]+(?:\|([^\]]*))?\]/g, (_, label) => (label || '').trim());

  // 굵게/기울임 마크업 제거 (텍스트만 남김)
  s = s.replace(/\*\*\*([^*]+?)\*\*\*/g, '$1');
  s = s.replace(/\*\*([^*]+?)\*\*/g, '$1');
  s = s.replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '$1');

  // 남아있는 대괄호 태그 자체 제거 (예: [정보], [box], 미처리 태그)
  s = s.replace(/\[[^\]]*\]/g, ' ');

  // 이메일·URL·해시태그 제거
  s = s.replace(EMAIL_RE, ' ');
  s = s.replace(URL_RE, ' ');
  s = s.replace(HASHTAG_RE, ' ');

  // 이모지 제거
  s = s.replace(EMOJI_RE, '');

  // 문단 앞 소제목 기호 (■, ▶, ◆, ●, ★, ☆, ▷) 제거
  s = s.replace(/^\s*[■▶◆●★☆▷▸►·・‣]+\s*/g, '');

  // 가운뎃점 + 콜론 정리: "· 참가 인원: 10명" → "참가 인원 10명"
  //   · 문장 중간의 " · " → " " (구분자)
  //   · "라벨: 값"        → "라벨 값"  (콜론 뒤 값이 있을 때만)
  s = s.replace(/\s*·\s*/g, ' ');
  s = s.replace(/\s*・\s*/g, ' ');
  s = s.replace(/([^\s]):\s*/g, '$1 ');

  // 한글 뒤 괄호 안이 영문/숫자만인 병기 제거 (Tilting 등)
  //   예) "틸팅(Tilting)" → "틸팅"
  //   한글은 유니코드 범위 가-힣 (완성형)
  s = s.replace(/([가-힣])\s*\(\s*[A-Za-z0-9\s.'-]+\)/g, '$1');

  // 구분선/구두점 정리 (다중 공백·불필요 문장부호 정리)
  s = s.replace(/^---+$/gm, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

// 박스 태그 하나를 낭독 문단으로 변환.
// 접두: quote='인용.', box='정리.', info='안내.'
function boxToSpeech(kind, inner) {
  const prefixMap = { quote: '인용.', box: '정리.', info: '안내.' };
  const prefix = prefixMap[kind] || '';
  // 박스 내부는 \n으로 목록/여러 줄인 경우가 많음 → 한 문단으로 합치되 마침표로 끊음
  const lines = String(inner)
    .split(/\n+/)
    .map(l => cleanInline(l))
    .filter(Boolean);
  if (!lines.length) return '';
  // 각 줄을 마침표로 마무리 (이미 있으면 그대로)
  const body = lines.map(l => (/[.!?]$/.test(l) ? l : l + '.')).join(' ');
  return prefix ? `${prefix} ${body}` : body;
}

// 본문 → 낭독용 문단 배열
// 반환: 각 원소는 하나의 문단 (한 번의 utterance로 재생 가능한 길이).
export function bodyToSpeechParagraphs(body) {
  if (!body) return [];
  let text = String(body);

  // 1) 박스 태그를 먼저 문장으로 치환 (블록 단위)
  text = text.replace(/\[(quote|box|info)\]([\s\S]*?)\[\/\1\]/g, (_, kind, inner) => {
    const speech = boxToSpeech(kind, inner);
    return speech ? `\n\n${speech}\n\n` : '\n\n';
  });

  // 2) 구분선 제거 (--- 단독 줄)
  text = text.replace(/^---+$/gm, '');

  // 3) 문단 분리 (빈 줄 기준)
  const rawParas = text.split(/\n{2,}/);

  // 4) 각 문단 인라인 정리 → 빈 것 제외
  const paras = [];
  for (const raw of rawParas) {
    const cleaned = cleanInline(raw);
    if (cleaned) paras.push(cleaned);
  }
  return paras;
}

// 기사 전체(제목·부제·본문) → 낭독 문단 배열
// paragraphs: [ {kind:'title'|'subtitle'|'body', text} ... ]  형태로 반환하지 않고
// 단순 문자열 배열로만 (kind는 재생부에서 하이라이트에 쓰지 않을 예정).
export function articleToSpeech({ title, subtitle, body }) {
  const out = [];
  const t = cleanInline(title || '');
  if (t) out.push(t.replace(/[.!?]$/, '') + '.');
  const s = cleanInline(subtitle || '');
  if (s) out.push(s.replace(/[.!?]$/, '') + '.');
  const bodyParas = bodyToSpeechParagraphs(body || '');
  for (const p of bodyParas) out.push(p);
  return out;
}

// 편의: 낭독 문단 배열을 하나의 문자열로 이어붙임 (사전 확인용)
export function articleToSpeechText(article) {
  return articleToSpeech(article).join('\n\n');
}
