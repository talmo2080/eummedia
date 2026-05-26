-- =========================================================================
-- Migration: articles 테이블에 external_url + inline_ad_* (4) 컬럼 추가
-- 작성: 2026-05-26 (2차 작업 ②③ 통합 — 원문 보기 조건부 + 본문 중간 배너 기사별 필드)
-- 검토: 옵스 진단 완료
--   · 원문 보기: 현재 모든 기사에 하드코딩 URL 노출 → 값 있을 때만 표시로 전환
--   · 본문 중간 배너: 현재 닥터리부트 하드코딩 → 기사별 4필드(image/link/title/subtitle)
-- 실행: Supabase 대시보드 SQL Editor 직접 실행 (옵스 OK 후)
-- =========================================================================

BEGIN;

-- 1) 옛 이음매거진(eummagazine.com) 원문 링크 (nullable)
--    · 값 있을 때만 ArticleDetail "원문 보기" 버튼 노출
--    · 신규 기사는 비워두면 버튼 자동 미표시
ALTER TABLE articles
ADD COLUMN external_url text;

-- 2) 본문 중간 배너 — 이미지 URL (nullable)
ALTER TABLE articles
ADD COLUMN inline_ad_image text;

-- 3) 본문 중간 배너 — 클릭 시 이동 링크 (nullable)
ALTER TABLE articles
ADD COLUMN inline_ad_link text;

-- 4) 본문 중간 배너 — 제목 (nullable)
ALTER TABLE articles
ADD COLUMN inline_ad_title text;

-- 5) 본문 중간 배너 — 부제 (nullable)
ALTER TABLE articles
ADD COLUMN inline_ad_subtitle text;

COMMIT;

-- =========================================================================
-- 사후 검증 SQL (실행 후 별도 Run — 2개 쿼리)
-- =========================================================================

-- [검증 1] 신규 5개 컬럼 존재 + 타입 + nullable 확인
--          기대: 5행, data_type 전부 'text', is_nullable 전부 'YES', column_default 전부 NULL
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'articles'
--   AND column_name IN (
--     'external_url',
--     'inline_ad_image',
--     'inline_ad_link',
--     'inline_ad_title',
--     'inline_ad_subtitle'
--   )
-- ORDER BY column_name;

-- [검증 2] articles 테이블 전체 행 수 변화 없음 확인
--          기대: ALTER 전 행 수와 동일 (ADD COLUMN은 행 추가/삭제 안 함)
-- SELECT count(*) AS total_articles FROM articles;
