-- =====================================================
-- 이음미디어 - users 테이블
-- Supabase auth.users 확장 프로파일
-- =====================================================

create type public.user_role as enum ('reader', 'writer', 'admin');

create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  nickname      text not null unique,
  role          public.user_role not null default 'reader',
  avatar_url    text,
  bio           text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.users               is '서비스 사용자 프로파일 (auth.users 확장)';
comment on column public.users.id            is '사용자 ID (auth.users.id 참조)';
comment on column public.users.email         is '이메일';
comment on column public.users.nickname      is '닉네임 (중복 불가)';
comment on column public.users.role          is '역할: reader(독자) / writer(기자) / admin(관리자)';
comment on column public.users.avatar_url    is '프로필 이미지 URL';
comment on column public.users.bio           is '자기소개';
comment on column public.users.is_active     is '활성 계정 여부';
comment on column public.users.created_at    is '생성 일시';
comment on column public.users.updated_at    is '수정 일시';

create index users_role_idx on public.users(role);

-- updated_at 자동 갱신 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- 관리자 여부 헬퍼 (RLS 에서 재사용)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = uid and role = 'admin' and is_active
  );
$$;

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.users enable row level security;

-- 모든 사용자(비로그인 포함)는 활성 프로파일을 조회 가능
create policy "users_select_active_public"
  on public.users for select
  using (is_active = true);

-- 본인 프로파일은 항상 조회 가능 (비활성 포함)
create policy "users_select_self"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

-- 회원가입 직후 본인 행 INSERT (트리거로도 가능하나 명시적 허용)
create policy "users_insert_self"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- 본인 프로파일만 수정 가능 (단, role 변경은 관리자만 — 트리거에서 차단)
create policy "users_update_self"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 관리자는 모든 행 수정/삭제 가능
create policy "users_admin_all"
  on public.users for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- 일반 사용자가 role 을 임의로 바꾸지 못하도록 차단
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
    raise exception '권한 없음: role 변경은 관리자만 가능합니다';
  end if;
  return new;
end;
$$;

create trigger users_prevent_role_escalation
  before update of role on public.users
  for each row execute function public.prevent_role_escalation();
