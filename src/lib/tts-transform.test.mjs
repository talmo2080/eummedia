// Node 유닛 테스트 — `node --test src/lib/tts-transform.test.mjs`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanInline, bodyToSpeechParagraphs, articleToSpeech, articleToSpeechText } from './tts-transform.js';

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
  assert.equal(cleanInline('**중요한** 발표'), '중요한 발표');
  assert.equal(cleanInline('***정말*** 중요'), '정말 중요');
  assert.equal(cleanInline('그는 *조용히* 말했다'), '그는 조용히 말했다');
});

test('cleanInline: [이미지:URL|캡션|alt] → alt 우선', () => {
  assert.equal(
    cleanInline('본문 [이미지:https://x/a.jpg|사진=봉숭아 제공|웃음특강 참가자 10명이 함께 웃는 모습] 이어짐'),
    '본문 사진. 웃음특강 참가자 10명이 함께 웃는 모습. 이어짐'
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

test('cleanInline: 빈 입력', () => {
  assert.equal(cleanInline(''), '');
  assert.equal(cleanInline(null), '');
  assert.equal(cleanInline(undefined), '');
});

test('bodyToSpeechParagraphs: 빈 입력', () => {
  assert.deepEqual(bodyToSpeechParagraphs(''), []);
  assert.deepEqual(bodyToSpeechParagraphs(null), []);
});
