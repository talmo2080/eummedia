-- =========================================================================
-- Migration: 관리자도 댓글 삭제 가능하도록 RLS 정책 보강
-- 작성: 2026-05-27
-- 검토: 옵스 진단 완료
--
-- 배경:
--   · 기존 comments_delete_author 정책은 auth.uid() = author_id 만 허용 → 본인만 삭제
--   · 기존 comments_admin_all 정책(for all)이 admin 모든 작업을 허용하지만,
--     명시적으로 DELETE에 admin 권한이 표현되어 있지 않아 확인·디버깅이 어려움
--   · 본 마이그레이션은 DELETE 권한을 "본인 OR admin" 단일 정책으로 통합·명시화
--
-- 변경 사항:
--   · DROP comments_delete_author (본인만)
--   · CREATE comments_delete_author_or_admin (본인 + admin)
--
-- 영향 없음 (변경하지 않는 정책):
--   · comments_update_author — 본인 수정만 (기존 그대로 유지)
--   · comments_admin_all — admin 모든 작업 (안전망)
--   · comments_select_*, comments_insert_self — 변경 없음
--
-- is_admin(uid uuid) 함수:
--   · 정의 위치: 20260430000001_create_users.sql 라인 49-57
--   · 동작: users.role = 'admin' AND is_active = true 인 경우 true 반환
--
-- 실행: Supabase 대시보드 SQL Editor 직접 실행 (옵스 OK 후)
-- =========================================================================

BEGIN;

-- 1) 기존 본인 전용 DELETE 정책 제거
DROP POLICY IF EXISTS "comments_delete_author" ON public.comments;

-- 2) 본인 OR admin DELETE 허용 — 단일 통합 정책
CREATE POLICY "comments_delete_author_or_admin"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id OR public.is_admin(auth.uid()));

COMMIT;

-- =========================================================================
-- 사후 검증 SQL (별도 Run — 3개 쿼리)
-- =========================================================================

-- [검증 1] 새 정책 존재 + USING 절 확인 (1행, qual에 author_id + is_admin 표현 포함)
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename  = 'comments'
--   AND policyname = 'comments_delete_author_or_admin';

-- [검증 2] 기존 comments_delete_author 제거 확인 (0행)
-- SELECT policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename  = 'comments'
--   AND policyname = 'comments_delete_author';

-- [검증 3] 본인 수정 정책 무변경 확인 (그대로 1행)
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename  = 'comments'
--   AND policyname = 'comments_update_author';
