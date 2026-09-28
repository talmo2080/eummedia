-- =========================================================================
-- Migration: increment_comment_like_count RPC
-- 작성: 2026-09-28
-- 목적:
--   댓글 좋아요 원자 증감 함수. 클라이언트가 anon key로 호출해도
--   comments.like_count를 안전하게 +1/-1 할 수 있게 함.
--   (기존 comments RLS는 작성자 본인만 update 가능 → 남의 댓글에 좋아요
--    누를 수 없었음. 이 RPC로 RLS 우회하되 delta는 ±1만 허용해 남용 차단)
--
-- 보안:
--   · SECURITY DEFINER — 함수 소유자 권한(공용 관리자)으로 실행
--   · delta ∈ {-1, +1} 검증 (임의 값 -1000 등 차단)
--   · like_count ≥ 0 CHECK 제약 유지 (기존 테이블 제약)
--   · GRANT EXECUTE TO anon, authenticated — 로그인 없이도 호출 가능
--
-- 중복 방지는 클라이언트 localStorage로 구현 (기사 좋아요와 동일 방식).
-- 완벽한 서버 측 방지가 필요하면 별도 comment_likes(user_id, comment_id)
-- 테이블 도입이 이후 과제.
-- =========================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.increment_comment_like_count(
  p_comment_id uuid,
  p_delta      integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- delta ±1 만 허용
  IF p_delta NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'delta must be -1 or 1, got %', p_delta USING ERRCODE = 'check_violation';
  END IF;

  -- 존재·삭제 여부·기사 published 검증
  IF NOT EXISTS (
    SELECT 1 FROM public.comments c
    JOIN public.articles a ON a.id = c.article_id
    WHERE c.id = p_comment_id
      AND c.is_deleted = false
      AND a.status = 'published'
  ) THEN
    RAISE EXCEPTION 'comment not found or not visible' USING ERRCODE = 'no_data_found';
  END IF;

  -- 원자 증감 (0 하한 GREATEST로 보호 — 제약도 있지만 이중 안전)
  UPDATE public.comments
     SET like_count = GREATEST(like_count + p_delta, 0)
   WHERE id = p_comment_id
  RETURNING like_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

COMMENT ON FUNCTION public.increment_comment_like_count(uuid, integer) IS
  '댓글 좋아요 원자 증감. delta ±1만 허용. anon도 호출 가능하나 delta 검증으로 남용 차단.';

-- anon·authenticated 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.increment_comment_like_count(uuid, integer)
  TO anon, authenticated;

COMMIT;

-- =========================================================================
-- 검증 SQL (선택)
-- =========================================================================
-- [1] 함수 정의 확인
-- SELECT pg_get_functiondef('public.increment_comment_like_count'::regproc);
--
-- [2] 실동작 테스트 (임의 댓글 ID로)
-- SELECT public.increment_comment_like_count('<comment_id>', 1);
-- SELECT id, like_count FROM public.comments WHERE id = '<comment_id>';
--
-- [3] delta 검증 (실패해야 정상)
-- SELECT public.increment_comment_like_count('<comment_id>', 5);
--   → ERROR: delta must be -1 or 1
