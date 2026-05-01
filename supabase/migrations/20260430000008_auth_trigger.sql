-- =====================================================
-- 이음미디어 - auth.users 가입 시 public.users 자동 생성
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
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)
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
  'auth.users 에 새 행이 생성될 때 public.users 프로파일을 자동 생성';
