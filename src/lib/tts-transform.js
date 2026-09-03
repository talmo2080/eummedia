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

// 한글 받침 유무 판정 (은/는 조사 선택용)
function hasBatchim(str) {
  if (!str) return false;
  const c = str.charCodeAt(str.length - 1);
  if (c < 0xAC00 || c > 0xD7A3) return false;
  return (c - 0xAC00) % 28 !== 0;
}

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

  // 소제목-본문 분리 (지시서 【1】-1):
  //   문단 시작이 **소제목** 형태이면 마침표를 붙여 TTS가 쉬게 함.
  //   예: "**웃음 세 가지 실습** 진행은…" → "웃음 세 가지 실습. 진행은…"
  //   ***…*** (bold-italic)도 동일. 문단 시작 (^)에서만.
  s = s.replace(/^\s*\*\*\*([^*\n]+?)\*\*\*\s+/, (_, t) => t.trim().replace(/[.!?]$/, '') + '. ');
  s = s.replace(/^\s*\*\*([^*\n]+?)\*\*\s+/, (_, t) => t.trim().replace(/[.!?]$/, '') + '. ');

  // 굵게/기울임 마크업 제거 (인라인 강조 — 텍스트만 남김)
  s = s.replace(/\*\*\*([^*]+?)\*\*\*/g, '$1');
  s = s.replace(/\*\*([^*]+?)\*\*/g, '$1');
  s = s.replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '$1');

  // 【 】 장식 대괄호 → 안의 글자 + 마침표 (지시서 【1】-4)
  //   예: "【 봄 】" → "봄." / "【 이용 요금 】" → "이용 요금."
  s = s.replace(/【\s*([^】\n]+?)\s*】/g, (_, inner) => inner.trim().replace(/[.!?]$/, '') + '.');

  // ※ → "참고." (지시서 【1】-5)
  //   예: "※ 요금은 변동될 수 있습니다" → "참고. 요금은 변동될 수 있습니다."
  s = s.replace(/^\s*※\s*/gm, '참고. ');
  s = s.replace(/\s※\s*/g, ' 참고. ');

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
//   · [quote] → "인용." 접두
//   · [box]   → "정리." 접두 (요약/정리 성격)
//   · [info]  → 두 갈래로 분기:
//       (a) 목차형: 첫 줄에 콜론 없음 + 항목 3개 이상 → "…은/는 다음과 같습니다." 형태
//                   (지시서 【1】-3: 듣는 독자에게 목차는 유용, 여는 말만 자연스럽게)
//       (b) 표 형태: 그 외 → "안내." 접두 + 각 항목 마침표 강화
//                   (지시서 【1】-2: 요금·일정 등 정보는 빼지 말고 끊어 읽기)
function boxToSpeech(kind, inner) {
  const lines = String(inner)
    .split(/\n+/)
    .map(l => cleanInline(l))
    .filter(Boolean);
  if (!lines.length) return '';

  const withPeriod = l => (/[.!?]$/.test(l) ? l : l + '.');

  if (kind === 'quote') {
    return `인용. ${lines.map(withPeriod).join(' ')}`;
  }
  if (kind === 'box') {
    return `정리. ${lines.map(withPeriod).join(' ')}`;
  }
  if (kind === 'info') {
    // 목차형 감지: 첫 줄에 콜론 없음 + 이후 항목 3개 이상 (표 형태와 구분)
    const firstHasColon = /:/.test(lines[0]);
    if (!firstHasColon && lines.length >= 4) {
      const heading = lines[0].replace(/[.!?]$/, '');
      const marker = hasBatchim(heading) ? '은' : '는';
      const rest = lines.slice(1).map(withPeriod).join(' ');
      return `${heading}${marker} 다음과 같습니다. ${rest}`;
    }
    return `안내. ${lines.map(withPeriod).join(' ')}`;
  }
  return lines.map(withPeriod).join(' ');
}

// 본문 → 낭독용 문단 배열
// HTML 렌더 파이프라인과 동일한 방식으로 분할해야 문단 하이라이트가 정확히 매핑됨.
//   · ArticleDetail.jsx: preserveBlockTags + '\n+' split (blocks 있거나 '\n' 있을 때)
//   · 없으면 splitIntoParagraphs (마침표 split)
// 여기서도 동일하게 처리하여 body_para[i] ↔ HTML paragraph[i] 1:1 매핑을 보장.
export function bodyToSpeechParagraphs(body) {
  if (!body) return [];
  const src = String(body);

  // 1) 박스 태그 sentinel 보호 (분할이 박스 내부를 쪼개는 것 방지)
  const SENTINEL_PRE = '__EUM_TTS_BLOCK_';
  const SENTINEL_SUF = '__';
  const blocks = [];
  let text = src.replace(/\[(quote|box|info)\]([\s\S]*?)\[\/\1\]/g, (full) => {
    blocks.push(full);
    return `${SENTINEL_PRE}${blocks.length - 1}${SENTINEL_SUF}`;
  });

  // 2) 이미지 self-closing 도 보호 (분할이 캡션 내부를 쪼갤 수 있음)
  text = text.replace(/\[이미지:[^\]]+\]/g, (full) => {
    blocks.push(full);
    return `${SENTINEL_PRE}${blocks.length - 1}${SENTINEL_SUF}`;
  });

  // 3) 문단 분리 — HTML과 동일 규칙
  //    blocks 있거나 '\n' 있으면 \n+ split, 아니면 원문 자체를 한 문단으로.
  //    (HTML은 이 경우 splitIntoParagraphs로 마침표 분할하지만, 낭독에선
  //     한 문단으로 통째 처리해도 TTS가 문장 단위로 알아서 쉼)
  const rawParas = (blocks.length > 0 || text.includes('\n'))
    ? text.split(/\n+/).map(p => p.trim()).filter(Boolean)
    : (text.trim() ? [text.trim()] : []);

  // 4) 각 문단: sentinel 복원 → 박스면 boxToSpeech, 아니면 cleanInline
  const paras = [];
  const restoreBlocks = (s) => s.replace(
    new RegExp(`${SENTINEL_PRE}(\\d+)${SENTINEL_SUF}`, 'g'),
    (_, i) => blocks[Number(i)] || ''
  );
  for (const raw of rawParas) {
    const restored = restoreBlocks(raw);
    // 문단 전체가 박스 태그 하나로 이루어져 있으면 boxToSpeech 처리
    const m = restored.match(/^\[(quote|box|info)\]([\s\S]*?)\[\/\1\]$/);
    if (m) {
      const speech = boxToSpeech(m[1], m[2]);
      if (speech) paras.push(speech);
      continue;
    }
    // 문단 전체가 [이미지:] 하나면 낭독에서 제외 (사진 캡션 뺄 것)
    if (/^\[이미지:[^\]]+\]$/.test(restored)) continue;
    // 구분선 --- 는 제외
    if (/^---+$/.test(restored)) continue;
    const cleaned = cleanInline(restored);
    if (cleaned) paras.push(cleaned);
  }
  return paras;
}

// 기사 전체(제목·부제·본문) → 낭독 문단 배열
// 반환 형식: 단순 문자열 배열
//   [0] title, [1] subtitle, [2..N] body 문단 (HTML 문단과 1:1 매칭 시도)
// 문단 하이라이트에서 쓸 매핑: 낭독 idx = i (i≥2) → HTML body index = i - offset
// offset = title 있으면 +1, subtitle 있으면 +1 (getSpeechToHtmlIndex 참고).
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

// 낭독 idx → HTML body 문단 idx 매핑 헬퍼
// title/subtitle 유무를 알아야 오프셋 계산 가능.
export function speechIndexToBodyIndex({ title, subtitle }, speechIdx) {
  let offset = 0;
  if (cleanInline(title || '')) offset += 1;
  if (cleanInline(subtitle || '')) offset += 1;
  const bodyIdx = speechIdx - offset;
  return bodyIdx >= 0 ? bodyIdx : null;
}

// 편의: 낭독 문단 배열을 하나의 문자열로 이어붙임 (사전 확인용)
export function articleToSpeechText(article) {
  return articleToSpeech(article).join('\n\n');
}
