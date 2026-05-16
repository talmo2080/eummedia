-- =========================================================================
-- Migration: 편집국장의 픽 7건 (is_featured=true)
-- 작성: 2026-05-16 (세연님 27년 두피업 안목 + 매체 본질 감각으로 직권 선정)
-- 실행: Supabase 대시보드 SQL Editor 직접 실행 (5/14 단계 1 마이그레이션 패턴)
-- 설계안: docs/design-proposals/2026-05-13-channel-list-feature.md
-- =========================================================================

BEGIN;

UPDATE articles SET is_featured = true WHERE slug IN (
  '169453918', -- 이음매거진:  발행인의 첫번째 편지 "당신의 꿈과 성공을 잇는 튼튼한 다리"
  '170217788', -- 이음피플:    [기획특집] 600번의 월요일 — 성창운 총장의 '이음' 철학
  '170617811', -- 이음로컬:    [성공을잇다] '셔틀콕 여제' 안세영 — 르피랩 메이신 기적
  '169884329', -- 이음에듀:    [칼럼] 본성에서 관계로 — AI 시대에 다시 묻는 '인성과 이음'
  '169785031', -- 이음뷰:      [웃음!행복을잇다] 천안 대자연 풍천장어 — 벙글이의 인생다방
  '170066695', -- 이음트렌드:  [이음매거진 특별기획] 넷플릭스 vs 대한민국 문화강국
  '170602291'  -- 이음보이스:  [세상을잇다] 이제 프롬프트는 AI가 쓴다 — 클로드 프롬프트 마스터
);

COMMIT;

-- =========================================================================
-- 사후 검증 SQL (실행 후 별도 Run — 3개 쿼리)
-- =========================================================================

-- [검증 1] is_featured=true 행 수 (기대: 7)
-- SELECT count(*) FROM articles WHERE is_featured = true;

-- [검증 2] 채널별 픽 분포 (기대: 7채널 모두 1건씩)
-- SELECT c.name, count(*) FILTER (WHERE a.is_featured) AS featured_count
-- FROM channels c
-- LEFT JOIN articles a ON a.channel_id = c.id AND a.status = 'published'
-- GROUP BY c.name
-- ORDER BY c.name;

-- [검증 3] 픽 7건 매핑 정확성 (slug ↔ channel)
-- SELECT a.slug, c.name AS channel, a.title
-- FROM articles a
-- JOIN channels c ON c.id = a.channel_id
-- WHERE a.is_featured = true
-- ORDER BY c.name;
