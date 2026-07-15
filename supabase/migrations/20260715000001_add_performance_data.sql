-- =========================================================================
-- Migration: articles.performance_data (jsonb) 컬럼 추가
-- 작성: 2026-07-15 (세연님 승인 후 진행)
-- 목적: 행사/활동 기사의 성과 수치를 구조화 저장
--       → 1~5년 뒤 이음평생교육원 설립·지자체 공모·국비 훈련기관
--          제안서의 '운영 실적 포트폴리오'로 뽑아 쓰기 위함
-- 안전:
--   · nullable 컬럼 추가만 → 기존 39건 데이터 무영향
--   · 기존 발행 흐름 무영향 (payload 비어도 정상 저장)
--   · 마이그레이션 파일 문서화 + 대시보드 SQL Editor에서 세연님 직접 실행
-- 관련 스킬: eum-impact-record (봉당·웃자·이음미디어 행사 기사 성과 기록)
-- =========================================================================

BEGIN;

-- 1) 컬럼 추가 (nullable, 기본값 없음 → 기존 행은 NULL)
ALTER TABLE public.articles
  ADD COLUMN performance_data jsonb;

COMMENT ON COLUMN public.articles.performance_data IS
  '행사/활동 성과 데이터 (선택). 항목: event_date, location, host, participants(int), target_group, program, hours(int), completion(int), satisfaction, public_value, note';

-- 2) GIN 인덱스 (지금은 데이터 없지만 향후 통계·검색·집계 대비)
--    jsonb_path_ops: 존재 여부·상위 키 검색에 최적, 인덱스 크기 작음
CREATE INDEX IF NOT EXISTS articles_performance_gin
  ON public.articles
  USING gin (performance_data jsonb_path_ops);

COMMIT;

-- =========================================================================
-- 사후 검증 SQL (실행 후 별도 Run — 3개 쿼리)
-- =========================================================================

-- [검증 1] 신규 컬럼 존재 + 타입 + nullable 확인
--          기대: 1행, data_type='jsonb', is_nullable='YES', column_default=NULL
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'articles' AND column_name = 'performance_data';

-- [검증 2] GIN 인덱스 생성 확인
--          기대: 1행, indexdef 안에 gin, jsonb_path_ops 포함
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'articles' AND indexname = 'articles_performance_gin';

-- [검증 3] 기존 행 수 무변화 확인
--          기대: ALTER 전 행 수와 동일 (ADD COLUMN은 행 추가/삭제 안 함)
-- SELECT count(*) AS total_articles FROM public.articles;
