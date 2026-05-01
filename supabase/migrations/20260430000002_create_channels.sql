-- =====================================================
-- 이음미디어 - channels 테이블
-- 언론/카테고리 채널
-- =====================================================

create table public.channels (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  description       text,
  owner_id          uuid not null references public.users(id) on delete restrict,
  cover_image_url   text,
  subscriber_count  integer not null default 0 check (subscriber_count >= 0),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table  public.channels                  is '언론/카테고리 채널';
comment on column public.channels.id               is '채널 ID';
comment on column public.channels.slug             is 'URL 슬러그 (영문, 중복 불가)';
comment on column public.channels.name             is '채널명';
comment on column public.channels.description      is '채널 설명';
comment on column public.channels.owner_id         is '채널 소유자 (users.id)';
comment on column public.channels.cover_image_url  is '커버 이미지 URL';
comment on column public.channels.subscriber_count is '구독자 수 (집계 캐시)';
comment on column public.channels.is_active        is '활성 여부';
comment on column public.channels.created_at       is '생성 일시';
comment on column public.channels.updated_at       is '수정 일시';

create index channels_owner_idx  on public.channels(owner_id);
create index channels_active_idx on public.channels(is_active) where is_active;

create trigger channels_set_updated_at
  before update on public.channels
  for each row execute function public.set_updated_at();

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.channels enable row level security;

-- 활성 채널은 모두 조회 가능
create policy "channels_select_active"
  on public.channels for select
  using (is_active = true);

-- 소유자/관리자는 비활성 채널도 조회 가능
create policy "channels_select_owner_or_admin"
  on public.channels for select
  to authenticated
  using (auth.uid() = owner_id or public.is_admin(auth.uid()));

-- writer/admin 만 채널 생성 가능, 본인을 owner 로 지정해야 함
create policy "channels_insert_writer"
  on public.channels for insert
  to authenticated
  with check (
    auth.uid() = owner_id
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('writer', 'admin') and is_active
    )
  );

-- 소유자는 본인 채널 수정/삭제 가능
create policy "channels_update_owner"
  on public.channels for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "channels_delete_owner"
  on public.channels for delete
  to authenticated
  using (auth.uid() = owner_id);

-- 관리자는 모든 작업 가능
create policy "channels_admin_all"
  on public.channels for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
