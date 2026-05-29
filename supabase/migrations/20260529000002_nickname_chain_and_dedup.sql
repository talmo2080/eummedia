-- =====================================================
-- 이음미디어 - 카카오 닉네임 매핑 + 동명이인 충돌 처리 트리거 (최종본)
-- =====================================================
-- 2026-05-29
--
-- 변경 내용:
--   handle_new_auth_user() 함수 두 가지 보강:
--     (1) fallback 체인에 카카오/Supabase OAuth 표준 메타 키 추가
--         + nullif(trim(...), '') 로 빈 문자열/공백 방어
--     (2) public.users.nickname UNIQUE 제약 위반 회피 — 동명이인 가입 시
--         숫자 suffix 자동 부여 루프 (정세연 → 정세연2 → 정세연3 ...)
--
--   v_base fallback 체인 (위에서 아래로):
--     raw_user_meta_data->>'nickname'        (Supabase signUp meta)
--     raw_user_meta_data->>'name'            (Signup.jsx options.data.name)
--     raw_user_meta_data->>'full_name'       (Supabase OAuth 표준)
--     raw_user_meta_data->>'user_name'       (Kakao 일부 응답)
--     '독자_' || substr(new.id::text, 1, 6)
--
-- 배경:
--   - 카카오 OAuth 사용자 이름이 fallback(독자_XXX)으로만 들어가던 문제 해소.
--   - public.users.nickname UNIQUE 제약 → 동명이인 카카오 사용자
--     (둘 다 "홍길동")가 가입하면 두 번째 트리거 실패 → auth.users는 생성됐는데
--     public.users 행만 누락되는 정합 깨짐. while 루프로 사전 회피.
--   - 빈 문자열/공백 키가 raw_user_meta_data 에 들어오는 경우(일부 OAuth
--     프로바이더가 빈 값을 빈 문자열로 넘김) coalesce 가 NULL 이 아닌 빈 값에
--     머무는 문제를 nullif(trim(...), '') 로 방어.
--
-- 한계 / 향후 과제:
--   - while 루프는 동명이인이 수천 명일 경우 N개 쿼리 발생. 현 매체 규모에서는
--     무시 가능. 폭발적 동명이인 발생 시 인덱스 hint 또는 random suffix 도입 고려.
--   - 사용자가 직접 닉네임 변경 UI 는 별도 사이클 (창간 후).
--   - 본 함수는 security definer 라 RLS 우회. nickname 검색 쿼리는 트리거 정의자
--     권한이라 정상 동작.
--
-- 적용 시점:
--   2026-05-29 Supabase SQL Editor 에서 선행 실행 완료. 본 파일은 git 박제.
--
-- 이전 마이그레이션과의 관계:
--   20260529000001_nickname_fallback.sql 의 후속 보강. 동일 함수를 다시
--   create or replace 하므로 마지막에 실행된 정의가 활성. 본 파일이 최종본.
-- =====================================================

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base     text;
  v_nickname text;
  v_counter  int := 2;
begin
  -- (1) fallback 체인 — 빈 문자열/공백은 NULL 취급
  v_base := coalesce(
    nullif(trim(new.raw_user_meta_data->>'nickname'),  ''),
    nullif(trim(new.raw_user_meta_data->>'name'),      ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'user_name'), ''),
    '독자_' || substr(new.id::text, 1, 6)
  );

  -- (2) UNIQUE 충돌 회피 — 같은 닉네임 존재 시 숫자 suffix
  v_nickname := v_base;
  while exists (select 1 from public.users where nickname = v_nickname) loop
    v_nickname := v_base || v_counter::text;
    v_counter  := v_counter + 1;
  end loop;

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
  'auth.users 새 행 → public.users 자동 생성. fallback: nickname→name→full_name→user_name→독자_<UUID6>. 동명이인은 숫자 suffix 자동 부여.';
