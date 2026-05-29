-- =====================================================
-- 이음미디어 - 트리거 nickname fallback 패턴 정정
-- =====================================================
-- 2026-05-29
-- 변경 내용:
--   handle_new_auth_user() 함수의 v_nickname fallback 패턴을
--   '(이메일앞부분)_(UUID앞6자)' → '독자_(UUID앞6자)' 로 변경.
--
-- 배경:
--   Signup.jsx 는 signUp() 시 raw_user_meta_data 에 { name: ... } 키로
--   사용자 이름을 전달하지만, 트리거는 'nickname' 키만 찾으므로
--   항상 fallback 패턴이 동작 → ohj7159_344b80 같은 비친화적 닉네임 양산.
--
--   닉네임 입력 UI 추가는 창간 후 별도 사이클로 보류하고,
--   당장은 사용자에게 노출되는 자동 닉네임을 '독자_<UUID6>' 형태로 정돈.
--
-- 정합:
--   - Signup.jsx 클라이언트 측 public.users INSERT 제거 (PK 충돌 해소)
--     → 트리거가 public.users 행 생성을 단일 책임 (single source of truth)
--   - 기존 함수 구조 유지 (security definer / on conflict do nothing)
--   - 트리거 정의도 동일 (drop + create)
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
  'auth.users 에 새 행이 생성될 때 public.users 프로파일을 자동 생성 (fallback: 독자_<UUID6>)';
