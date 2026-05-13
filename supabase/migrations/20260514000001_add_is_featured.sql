-- =========================================================================
-- Migration: articles.is_featured 컬럼 추가 + 채널당 1건만 true 제약
-- 작성: 2026-05-13 (설계안 1.0) / 옵스 재검증 통과 2026-05-14
-- 실행: 2026-05-14 Supabase 대시보드 SQL Editor 직접 실행 (세연님 OK 후)
-- 설계안: docs/design-proposals/2026-05-13-channel-list-feature.md
-- =========================================================================

BEGIN;

-- 1) 컬럼 추가 (NOT NULL + DEFAULT false → 기존 39건 자동으로 false)
ALTER TABLE articles
ADD COLUMN is_featured boolean NOT NULL DEFAULT false;

-- 2) "채널당 1건만 true" Partial Unique Index
--    - is_featured = true 행만 인덱스에 포함
--    - 같은 channel_id로 두 번째 true 시도 시 DB가 23505로 거절
CREATE UNIQUE INDEX articles_one_featured_per_channel
ON articles (channel_id)
WHERE is_featured = true;

COMMIT;

-- =========================================================================
-- 사후 검증 SQL (실행 후 별도 Run — 4개 쿼리)
-- =========================================================================

-- [검증 1] is_featured = false 행 수 (기대: 39)
-- SELECT count(*) FROM articles WHERE is_featured = false;

-- [검증 2] is_featured = true 행 수 (기대: 0)
-- SELECT count(*) FROM articles WHERE is_featured = true;

-- [검증 3] is_featured 컬럼 존재 확인
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'articles' AND column_name = 'is_featured';

-- [검증 4] Partial Unique Index 존재 확인
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'articles' AND indexname = 'articles_one_featured_per_channel';
