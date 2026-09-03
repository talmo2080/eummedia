// Node 유닛 테스트 — `node --test src/lib/tts-transform.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanInline, bodyToSpeechParagraphs, articleToSpeech, articleToSpeechText, speechIndexToBodyIndex } from './tts-transform.js';

test('cleanInline: 소제목 기호 제거', () => {
  assert.equal(cleanInline('■ 운영 개요'), '운영 개요');
  assert.equal(cleanInline('▶ 다음 단계'), '다음 단계');
  assert.equal(cleanInline('◆ 참여 안내'), '참여 안내');
});

test('cleanInline: 가운뎃점 + 콜론 정리', () => {
  assert.equal(cleanInline('· 참가 인원: 10명'), '참가 인원 10명');
  assert.equal(cleanInline('일시: 2026-09-03'), '일시 2026-09-03');
  assert.equal(cleanInline('장소·시간·비용'), '장소 시간 비용');
});

test('cleanInline: 영문 병기 제거 (한글 옆 괄호가 영문만)', () => {
  assert.equal(cleanInline('틸팅(Tilting)'), '틸팅');
  assert.equal(cleanInline('빅데이터(Big Data) 시대'), '빅데이터 시대');
  // 한글 병기(순한글 안 괄호가 한글이면 유지)
  assert.equal(cleanInline('빅데이터(대용량 자료) 시대'), '빅데이터(대용량 자료) 시대');
});

test('cleanInline: URL/이메일/해시태그 제거', () => {
  assert.equal(cleanInline('자세히는 https://example.com 를 참조'), '자세히는 를 참조');
  assert.equal(cleanInline('문의 press@eummedia.kr 로'), '문의 로');
  assert.equal(cleanInline('행사 후기 #웃음특강 #봉리단길'), '행사 후기');
});

test('cleanInline: 이모지 제거', () => {
  assert.equal(cleanInline('환영합니다 🎉🎊'), '환영합니다');
  assert.equal(cleanInline('👍 좋아요'), '좋아요');
});

test('cleanInline: 마크업(굵게/기울임) 제거', () => {
  // 문단 시작 **text** 는 소제목으로 판단 (규칙1) → 마침표 붙음
  assert.equal(cleanInline('**중요한** 발표'), '중요한. 발표');
  assert.equal(cleanInline('***정말*** 중요'), '정말. 중요');
  // 인라인 강조 (문단 시작 아님) → 마크업만 제거
  assert.equal(cleanInline('그는 *조용히* 말했다'), '그는 조용히 말했다');
  assert.equal(cleanInline('앞 텍스트 **강조** 뒷 텍스트'), '앞 텍스트 강조 뒷 텍스트');
});

test('cleanInline: [이미지:URL|캡션|alt] → 낭독에서 완전 제거', () => {
  // 지시서: 사진 캡션은 낭독에서 뺄 것 (화면낭독기 사용자는 alt로 별도 접근)
  assert.equal(
    cleanInline('본문 [이미지:https://x/a.jpg|사진=봉숭아 제공|웃음특강 참가자 10명] 이어짐'),
    '본문 이어짐'
  );
});

test('cleanInline: [링크:URL|텍스트] → 텍스트만', () => {
  assert.equal(
    cleanInline('신청은 [링크:https://example.com|여기]에서'),
    '신청은 여기에서'
  );
});

test('bodyToSpeechParagraphs: [quote] → "인용." 접두', () => {
  const body = '앞 문단.\n\n[quote]사람은 웃어야 산다[/quote]\n\n뒷 문단.';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(paras.length, 3);
  assert.equal(paras[0], '앞 문단.');
  assert.equal(paras[1], '인용. 사람은 웃어야 산다.');
  assert.equal(paras[2], '뒷 문단.');
});

test('bodyToSpeechParagraphs: [box] 목록 → "정리." 접두', () => {
  const body = '[box]\n· 참가 인원: 10명\n· 일시: 2026-09-03\n· 장소: 봉리단길[/box]';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(paras.length, 1);
  assert.equal(paras[0], '정리. 참가 인원 10명. 일시 2026-09-03. 장소 봉리단길.');
});

test('bodyToSpeechParagraphs: [info] → "안내." 접두', () => {
  const body = '[info]문의: press@eummedia.kr[/info]';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(paras[0].startsWith('안내.'), true);
});

test('bodyToSpeechParagraphs: 구분선 --- 제거', () => {
  const body = '문단 A.\n\n---\n\n문단 B.';
  const paras = bodyToSpeechParagraphs(body);
  assert.deepEqual(paras, ['문단 A.', '문단 B.']);
});

test('articleToSpeech: 제목/부제/본문 순', () => {
  const paras = articleToSpeech({
    title: '오행자 웃음치료사, 청년 대상 무료 특강',
    subtitle: '고3부터 30대까지 10명이 참여했다',
    body: '■ 운영 개요\n\n행사는 봉리단길에서 열렸다.\n\n· 참가 인원: 10명',
  });
  assert.deepEqual(paras, [
    '오행자 웃음치료사, 청년 대상 무료 특강.',
    '고3부터 30대까지 10명이 참여했다.',
    '운영 개요',
    '행사는 봉리단길에서 열렸다.',
    '참가 인원 10명',
  ]);
});

test('articleToSpeechText: 문단 사이 빈 줄 구분', () => {
  const text = articleToSpeechText({
    title: '제목',
    body: '문단1.\n\n문단2.',
  });
  assert.equal(text, '제목.\n\n문단1.\n\n문단2.');
});

// ─── 지시서 【1】 조정 5건 (2차) ────────────────────────────────

test('규칙1: 문단 시작 **소제목** 뒤에 마침표', () => {
  // "**웃음 세 가지 실습** 진행은…" → "웃음 세 가지 실습. 진행은…"
  assert.equal(
    cleanInline('**웃음 세 가지 실습** 진행은 오행자 교수가 맡았다'),
    '웃음 세 가지 실습. 진행은 오행자 교수가 맡았다'
  );
  // ***…*** 도 동일
  assert.equal(
    cleanInline('***실패도 배움이 될 수 있다*** 홍보승 강사는 자신의 경험을 나눴다'),
    '실패도 배움이 될 수 있다. 홍보승 강사는 자신의 경험을 나눴다'
  );
  // 인라인 강조는 마침표 없이 (문단 시작 아님)
  assert.equal(cleanInline('그는 **매우 중요한** 발표를 했다'), '그는 매우 중요한 발표를 했다');
});

test('규칙2: 표 형태 [info] — 각 줄 마침표 유지', () => {
  const body = '[info]\n운영: 대둔산삭도\n위치: 완주군\n요금: 왕복 16,500원[/info]';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(paras[0], '안내. 운영 대둔산삭도. 위치 완주군. 요금 왕복 16,500원.');
});

test('규칙3: 목차성 [info] — "…은/는 다음과 같습니다."', () => {
  const body = '[info]**■ 이 기사에서 확인할 수 있는 것**\n\n· 대둔산은 어떤 산인가\n· 케이블카는 얼마나 걸리나\n· 구름다리는 어떤 다리인가\n· 정상까지 얼마나 걸리나[/info]';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(
    paras[0],
    '이 기사에서 확인할 수 있는 것은 다음과 같습니다. 대둔산은 어떤 산인가. 케이블카는 얼마나 걸리나. 구름다리는 어떤 다리인가. 정상까지 얼마나 걸리나.'
  );
});

test('규칙3-b: 받침 없는 명사 → "는 다음과 같습니다."', () => {
  const body = '[info]행사 개요\n\n· 항목1\n· 항목2\n· 항목3[/info]';
  const paras = bodyToSpeechParagraphs(body);
  assert.equal(paras[0], '행사 개요는 다음과 같습니다. 항목1. 항목2. 항목3.');
});

test('규칙4: 【 】 제거 + 마침표', () => {
  assert.equal(cleanInline('【 봄 】'), '봄.');
  assert.equal(cleanInline('【 이용 요금 】 대인 왕복 16,500원'), '이용 요금. 대인 왕복 16,500원');
  // 안 문장이 !/?로 끝나면 그 부호를 마침표로 대체 (이중 부호 회피)
  assert.equal(cleanInline('【 그리고 대둔산이 가을이 절정인 이유! 】'), '그리고 대둔산이 가을이 절정인 이유.');
});

test('규칙5: ※ → "참고."', () => {
  assert.equal(cleanInline('※ 요금은 변동될 수 있습니다'), '참고. 요금은 변동될 수 있습니다');
  assert.equal(
    cleanInline('※ 두 구름다리 모두 일방통행이며 하산 시에는 통행이 금지된다'),
    '참고. 두 구름다리 모두 일방통행이며 하산 시에는 통행이 금지된다'
  );
});

test('cleanInline: 빈 입력', () => {
  assert.equal(cleanInline(''), '');
  assert.equal(cleanInline(null), '');
  assert.equal(cleanInline(undefined), '');
});

test('bodyToSpeechParagraphs: 빈 입력', () => {
  assert.deepEqual(bodyToSpeechParagraphs(''), []);
  assert.deepEqual(bodyToSpeechParagraphs(null), []);
});

// ─── 하이라이트용 매핑 (2차) ────────────────────────────

test('speechIndexToBodyIndex: title+subtitle 있으면 오프셋 +2', () => {
  const art = { title: '제목', subtitle: '부제' };
  assert.equal(speechIndexToBodyIndex(art, 0), null); // title 자리
  assert.equal(speechIndexToBodyIndex(art, 1), null); // subtitle 자리 (음수 → null 아님, 0-2=-1)
  // 위: 실제로 0-2=-2, 1-2=-1 모두 음수 → null
  assert.equal(speechIndexToBodyIndex(art, 2), 0);   // 첫 본문 문단
  assert.equal(speechIndexToBodyIndex(art, 5), 3);
});

test('speechIndexToBodyIndex: subtitle 없으면 오프셋 +1', () => {
  const art = { title: '제목', subtitle: '' };
  assert.equal(speechIndexToBodyIndex(art, 0), null);
  assert.equal(speechIndexToBodyIndex(art, 1), 0);
  assert.equal(speechIndexToBodyIndex(art, 3), 2);
});

test('bodyToSpeechParagraphs: HTML과 동일 splitter (\\n+ 하나 이상)', () => {
  // 원본이 \n 하나로 구분돼도 HTML은 분리하므로 낭독도 분리
  const body = '문단A.\n문단B.\n\n문단C.';
  const paras = bodyToSpeechParagraphs(body);
  assert.deepEqual(paras, ['문단A.', '문단B.', '문단C.']);
});

test('bodyToSpeechParagraphs: [이미지:] 단독 문단은 제외', () => {
  const body = '앞 문단.\n\n[이미지:https://x/a.jpg|캡션|alt]\n\n뒷 문단.';
  const paras = bodyToSpeechParagraphs(body);
  assert.deepEqual(paras, ['앞 문단.', '뒷 문단.']);
});
