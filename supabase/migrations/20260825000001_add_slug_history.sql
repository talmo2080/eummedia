-- =========================================================================
-- Migration: slug_history 테이블 — 기사 slug 변경 이력 관리
-- 작성: 2026-08-25 (세연님 옵션 A 승인)
-- 목적:
--   1) articles.slug가 변경될 때마다 옛 slug를 자동 백업
--   2) middleware.js가 요청 slug를 slug_history에서 조회 → 새 slug로 301 리다이렉트
--   3) 검색엔진 색인 자산 유실 방지 (기존 URL이 그대로 살아있는 것처럼 동작)
-- 안전:
--   · 신규 테이블만 추가 (기존 데이터 무영향)
--   · articles UPDATE 시 트리거로 자동 백업 (누락 방지)
--   · slug 자체 안 바뀌면 트리거 no-op
-- =========================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- 1) 테이블
-- ────────────────────────────────────────────────────────────────
CREATE TABLE public.slug_history (
  id          bigserial PRIMARY KEY,
  article_id  uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  old_slug    text NOT NULL UNIQUE,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  changed_by  uuid REFERENCES public.users(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.slug_history IS
  '기사 slug 변경 이력. 옛 slug → 새 slug 301 리다이렉트용. articles.slug UPDATE 시 트리거로 자동 기록.';
COMMENT ON COLUMN public.slug_history.old_slug IS
  '변경 전 slug. UNIQUE 제약으로 중복 방지 (동일 slug 왕복 시 첫 기록만 유지).';

CREATE INDEX slug_history_article_idx  ON public.slug_history(article_id);
CREATE INDEX slug_history_old_slug_idx ON public.slug_history(old_slug);

-- ────────────────────────────────────────────────────────────────
-- 2) RLS
-- ────────────────────────────────────────────────────────────────
ALTER TABLE public.slug_history ENABLE ROW LEVEL SECURITY;

-- SELECT 공개 (미들웨어가 anon key로 조회)
CREATE POLICY "slug_history_select_public"
  ON public.slug_history FOR SELECT
  USING (true);

-- 관리자만 수동 조작 가능 (평시엔 트리거만 씀)
CREATE POLICY "slug_history_admin_all"
  ON public.slug_history FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ────────────────────────────────────────────────────────────────
-- 3) 트리거 — articles.slug UPDATE 시 자동 백업
-- ────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_slug_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- slug가 실제로 바뀌었을 때만 (old.slug와 new.slug 다르고 old가 존재)
  IF NEW.slug IS DISTINCT FROM OLD.slug AND OLD.slug IS NOT NULL THEN
    INSERT INTO public.slug_history (article_id, old_slug, changed_by)
    VALUES (OLD.id, OLD.slug, auth.uid())
    ON CONFLICT (old_slug) DO NOTHING;
    -- 이미 이 old_slug가 다른 이력에 있으면 무시 (첫 기록 유지)
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_log_slug_change
  BEFORE UPDATE OF slug ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.log_slug_change();

COMMIT;

-- =========================================================================
-- 사후 검증 SQL
-- =========================================================================
-- [검증 1] 테이블 + 컬럼 확인
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'slug_history' ORDER BY ordinal_position;
--
-- [검증 2] RLS 정책 확인
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'slug_history';
--
-- [검증 3] 트리거 확인
-- SELECT tgname, pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'public.articles'::regclass;
--
-- [검증 4] 트리거 실동작 테스트 (선택 — 특정 기사 slug 변경)
-- UPDATE public.articles SET slug = 'test-new-slug' WHERE slug = '<옛_slug>';
-- SELECT * FROM public.slug_history ORDER BY changed_at DESC LIMIT 3;
