-- =========================================================================
-- Migration: articles.deploy_alert_sent (boolean) 컬럼 추가
-- 작성: 2026-08-09 (한기식대표 국토종주 기사 404 관측 사고 대응)
-- 목적: 발행 후 실제 라이브 URL이 200이 아닌 기사에 대해
--       Vercel Cron(api/publish-check)이 텔레그램 알림을 1회만 보내도록
--       중복 알림 방지 플래그.
-- 안전: NOT NULL + DEFAULT false → 기존 발행 기사에 자동 false 세팅,
--       발행 흐름 무영향, 알림 대상은 이 시점 이후 발행 기사만.
-- 리셋 정책: "한 번 알림 가면 종료" (세연 지시) — 리셋 로직 없음.
-- =========================================================================

BEGIN;

ALTER TABLE public.articles
  ADD COLUMN deploy_alert_sent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.articles.deploy_alert_sent IS
  '발행 후 라이브 URL 404 감지 시 텔레그램 알림을 보냈는지 여부. 중복 알림 방지용.';

-- 조회 최적화: 아직 알림 안 간 + published 인 최근 기사만 인덱스
--   publish-check가 매 10분 도는 쿼리: WHERE status='published' AND deploy_alert_sent=false
--   AND published_at > now() - interval '1 hour'
CREATE INDEX IF NOT EXISTS articles_deploy_alert_pending
  ON public.articles(published_at DESC)
  WHERE deploy_alert_sent = false AND status = 'published';

COMMIT;

-- =========================================================================
-- 사후 검증 SQL
-- =========================================================================
-- [검증 1] 컬럼 확인 (기대: 1행, boolean, NO, false)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name='articles' AND column_name='deploy_alert_sent';
--
-- [검증 2] 인덱스 확인
-- SELECT indexname, indexdef FROM pg_indexes
-- WHERE tablename='articles' AND indexname='articles_deploy_alert_pending';
--
-- [검증 3] 기존 행 모두 false 확인 (기대: 알림 미발송 = 전체 건수)
-- SELECT count(*) FROM articles WHERE deploy_alert_sent = false;
