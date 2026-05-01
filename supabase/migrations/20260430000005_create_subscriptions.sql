-- =====================================================
-- 이음미디어 - subscriptions 테이블
-- 사용자 - 채널 구독 매핑
-- =====================================================

create table public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id)    on delete cascade,
  channel_id            uuid not null references public.channels(id) on delete cascade,
  notification_enabled  boolean not null default true,
  created_at            timestamptz not null default now(),
  unique (user_id, channel_id)
);

comment on table  public.subscriptions                      is '사용자 채널 구독';
comment on column public.subscriptions.id                   is '구독 ID';
comment on column public.subscriptions.user_id              is '구독자 (users.id)';
comment on column public.subscriptions.channel_id           is '구독 채널 (channels.id)';
comment on column public.subscriptions.notification_enabled is '새 기사 알림 수신 여부';
comment on column public.subscriptions.created_at           is '구독 시작 일시';

create index subscriptions_user_idx    on public.subscriptions(user_id);
create index subscriptions_channel_idx on public.subscriptions(channel_id);

-- 채널 subscriber_count 집계 동기화
create or replace function public.sync_channel_subscriber_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.channels
       set subscriber_count = subscriber_count + 1
     where id = new.channel_id;
  elsif tg_op = 'DELETE' then
    update public.channels
       set subscriber_count = greatest(subscriber_count - 1, 0)
     where id = old.channel_id;
  end if;
  return null;
end;
$$;

create trigger subscriptions_sync_count
  after insert or delete on public.subscriptions
  for each row execute function public.sync_channel_subscriber_count();

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.subscriptions enable row level security;

-- 본인 구독 목록만 조회 가능
create policy "subscriptions_select_self"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- 채널 소유자는 본 채널 구독자 목록 조회 가능
create policy "subscriptions_select_channel_owner"
  on public.subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = subscriptions.channel_id and c.owner_id = auth.uid()
    )
  );

-- 본인만 구독 생성 가능
create policy "subscriptions_insert_self"
  on public.subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 본인 구독만 수정/삭제 가능
create policy "subscriptions_update_self"
  on public.subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_self"
  on public.subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

-- 관리자는 모든 작업 가능
create policy "subscriptions_admin_all"
  on public.subscriptions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
