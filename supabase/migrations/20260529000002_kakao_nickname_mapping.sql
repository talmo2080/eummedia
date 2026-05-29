-- =====================================================
-- 이음미디어 - 카카오 OAuth 닉네임 매핑 트리거
-- =====================================================
-- 2026-05-29
-- 변경 내용:
--   handle_new_auth_user() 함수의 v_nickname fallback 체인에
--   카카오 OAuth가 raw_user_meta_data 에 채워 넣는 키들을 추가.
--
--   기존 체인 (20260529000001):
--     raw_user_meta_data->>'nickname'
--     → '독자_' || substr(new.id::text, 1, 6)
--
--   변경 체인:
--     raw_user_meta_data->>'nickname'
--     → raw_user_meta_data->>'name'           (Signup options.data.name)
--     → raw_user_meta_data->>'full_name'      (Supabase OAuth 표준 키)
--     → raw_user_meta_data->>'user_name'      (Kakao 일부 응답에서 사용)
--     → '독자_' || substr(new.id::text, 1, 6)
--
-- 배경:
--   카카오 로그인 시 사용자가 동의한 닉네임이 raw_user_meta_data 에 들어오지만
--   트리거가 'nickname' 키만 보고 있어서 항상 fallback(독자_XXX) 발동.
--   카카오/Supabase OAuth 표준 키들을 fallback 체인에 추가하면 사용자가
--   카카오에 설정해 둔 이름이 닉네임으로 매핑됨.
--
-- 한계 / 향후 과제:
--   - public.users.nickname 은 UNIQUE 제약 → 동명이인 카카오 사용자
--     (예: 둘 다 "홍길동")가 가입하면 2번째 사용자 트리거 실패.
--     on conflict (id) do nothing 은 PK 충돌만 처리하므로 nickname 충돌은 별개.
--     → 창간 후 닉네임 입력 UI + 충돌 시 suffix 자동 부여 흐름 도입 필요.
--
-- 적용 시점:
--   2026-05-29 Supabase SQL Editor 에서 선행 실행 완료. 본 파일은 git 박제.
-- =====================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nickname text;
begin
  v_nickname := coalesce(
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'user_name',
    '독자_' || substr(new.id::text, 1, 6)
  );

  insert into public.users (id, email, nickname, role)
  values (
    new.id,
    new.email,
    v_nickname,
    'reader'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

comment on function public.handle_new_auth_user() is
  'auth.users 에 새 행이 생성될 때 public.users 프로파일을 자동 생성 (fallback 체인: nickname → name → full_name → user_name → 독자_<UUID6>)';
