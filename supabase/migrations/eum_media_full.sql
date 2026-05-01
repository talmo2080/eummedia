-- =====================================================
-- 이음미디어 통합 마이그레이션 (8개 파일 병합본)
-- Project ref: avbsniuthpcejjcdeiyw
-- 실행 순서: users → channels → articles → comments
--            → subscriptions → advertisements → reports
--            → auth_trigger
-- =====================================================


-- =====================================================
-- 1. users 테이블 (Supabase auth.users 확장 프로파일)
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

alter table public.users enable row level security;

create policy "users_select_active_public"
  on public.users for select
  using (is_active = true);

create policy "users_select_self"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

create policy "users_insert_self"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users_update_self"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_admin_all"
  on public.users for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

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


-- =====================================================
-- 2. channels 테이블 (언론/카테고리 채널)
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

alter table public.channels enable row level security;

create policy "channels_select_active"
  on public.channels for select
  using (is_active = true);

create policy "channels_select_owner_or_admin"
  on public.channels for select
  to authenticated
  using (auth.uid() = owner_id or public.is_admin(auth.uid()));

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

create policy "channels_update_owner"
  on public.channels for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "channels_delete_owner"
  on public.channels for delete
  to authenticated
  using (auth.uid() = owner_id);

create policy "channels_admin_all"
  on public.channels for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 3. articles 테이블 (기사)
-- =====================================================

create type public.article_status as enum ('draft', 'published', 'archived');

create table public.articles (
  id              uuid primary key default gen_random_uuid(),
  channel_id      uuid not null references public.channels(id) on delete cascade,
  author_id       uuid not null references public.users(id)    on delete restrict,
  title           text not null check (char_length(title) between 1 and 200),
  slug            text not null,
  summary         text check (char_length(summary) <= 500),
  content         text not null,
  thumbnail_url   text,
  status          public.article_status not null default 'draft',
  view_count      integer not null default 0 check (view_count  >= 0),
  like_count      integer not null default 0 check (like_count  >= 0),
  comment_count   integer not null default 0 check (comment_count >= 0),
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (channel_id, slug)
);

comment on table  public.articles                is '기사';
comment on column public.articles.id             is '기사 ID';
comment on column public.articles.channel_id     is '소속 채널 (channels.id)';
comment on column public.articles.author_id      is '작성자 (users.id)';
comment on column public.articles.title          is '제목 (1~200자)';
comment on column public.articles.slug           is 'URL 슬러그 (채널 내 중복 불가)';
comment on column public.articles.summary        is '요약 (최대 500자)';
comment on column public.articles.content        is '본문';
comment on column public.articles.thumbnail_url  is '썸네일 이미지 URL';
comment on column public.articles.status         is '상태: draft(작성중) / published(게시) / archived(보관)';
comment on column public.articles.view_count     is '조회수';
comment on column public.articles.like_count     is '좋아요 수';
comment on column public.articles.comment_count  is '댓글 수 (집계 캐시)';
comment on column public.articles.published_at   is '게시 일시';
comment on column public.articles.created_at     is '생성 일시';
comment on column public.articles.updated_at     is '수정 일시';

create index articles_channel_idx     on public.articles(channel_id);
create index articles_author_idx      on public.articles(author_id);
create index articles_published_idx   on public.articles(published_at desc) where status = 'published';
create index articles_status_idx      on public.articles(status);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

create or replace function public.set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published'
     and (old.status is distinct from 'published')
     and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger articles_set_published_at
  before insert or update of status on public.articles
  for each row execute function public.set_published_at();

alter table public.articles enable row level security;

create policy "articles_select_published"
  on public.articles for select
  using (status = 'published');

create policy "articles_select_author_or_owner"
  on public.articles for select
  to authenticated
  using (
    auth.uid() = author_id
    or exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid())
    or public.is_admin(auth.uid())
  );

create policy "articles_insert_writer"
  on public.articles for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.users
      where id = auth.uid() and role in ('writer', 'admin') and is_active
    )
  );

create policy "articles_update_author"
  on public.articles for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "articles_delete_author"
  on public.articles for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "articles_manage_channel_owner"
  on public.articles for all
  to authenticated
  using (exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid()));

create policy "articles_admin_all"
  on public.articles for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 4. comments 테이블 (기사 댓글, 대댓글 1단계)
-- =====================================================

create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  article_id    uuid not null references public.articles(id) on delete cascade,
  author_id     uuid not null references public.users(id)    on delete restrict,
  parent_id     uuid references public.comments(id) on delete cascade,
  content       text not null check (char_length(content) between 1 and 2000),
  like_count    integer not null default 0 check (like_count >= 0),
  is_deleted    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.comments            is '기사 댓글 (parent_id 로 대댓글)';
comment on column public.comments.id         is '댓글 ID';
comment on column public.comments.article_id is '대상 기사 (articles.id)';
comment on column public.comments.author_id  is '작성자 (users.id)';
comment on column public.comments.parent_id  is '부모 댓글 ID (대댓글인 경우)';
comment on column public.comments.content    is '댓글 내용 (1~2000자)';
comment on column public.comments.like_count is '좋아요 수';
comment on column public.comments.is_deleted is '삭제 여부 (소프트 삭제)';
comment on column public.comments.created_at is '생성 일시';
comment on column public.comments.updated_at is '수정 일시';

create index comments_article_idx on public.comments(article_id, created_at desc);
create index comments_author_idx  on public.comments(author_id);
create index comments_parent_idx  on public.comments(parent_id) where parent_id is not null;

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

create or replace function public.sync_article_comment_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.articles
       set comment_count = comment_count + 1
     where id = new.article_id;
  elsif tg_op = 'DELETE' then
    update public.articles
       set comment_count = greatest(comment_count - 1, 0)
     where id = old.article_id;
  end if;
  return null;
end;
$$;

create trigger comments_sync_count
  after insert or delete on public.comments
  for each row execute function public.sync_article_comment_count();

alter table public.comments enable row level security;

create policy "comments_select_visible"
  on public.comments for select
  using (
    is_deleted = false
    and exists (
      select 1 from public.articles a
      where a.id = comments.article_id and a.status = 'published'
    )
  );

create policy "comments_select_author"
  on public.comments for select
  to authenticated
  using (auth.uid() = author_id or public.is_admin(auth.uid()));

create policy "comments_insert_self"
  on public.comments for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.articles a
      where a.id = article_id and a.status = 'published'
    )
  );

create policy "comments_update_author"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "comments_delete_author"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);

create policy "comments_admin_all"
  on public.comments for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 5. subscriptions 테이블 (사용자-채널 구독)
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

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_self"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "subscriptions_select_channel_owner"
  on public.subscriptions for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = subscriptions.channel_id and c.owner_id = auth.uid()
    )
  );

create policy "subscriptions_insert_self"
  on public.subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "subscriptions_update_self"
  on public.subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subscriptions_delete_self"
  on public.subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "subscriptions_admin_all"
  on public.subscriptions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 6. advertisements 테이블 (광고 캠페인)
-- =====================================================

create type public.ad_placement as enum ('sidebar', 'banner_top', 'banner_bottom', 'inline_article');

create table public.advertisements (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  advertiser_name   text not null,
  image_url         text not null,
  target_url        text not null,
  placement         public.ad_placement not null,
  start_date        timestamptz not null,
  end_date          timestamptz not null,
  budget_krw        integer check (budget_krw is null or budget_krw >= 0),
  impression_count  bigint  not null default 0 check (impression_count >= 0),
  click_count       integer not null default 0 check (click_count      >= 0),
  is_active         boolean not null default true,
  created_by        uuid not null references public.users(id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date > start_date)
);

comment on table  public.advertisements                  is '광고 캠페인';
comment on column public.advertisements.id               is '광고 ID';
comment on column public.advertisements.title            is '광고 제목';
comment on column public.advertisements.advertiser_name  is '광고주명';
comment on column public.advertisements.image_url        is '광고 이미지 URL';
comment on column public.advertisements.target_url       is '클릭 시 이동할 URL';
comment on column public.advertisements.placement        is '게재 위치: sidebar / banner_top / banner_bottom / inline_article';
comment on column public.advertisements.start_date       is '게재 시작 일시';
comment on column public.advertisements.end_date         is '게재 종료 일시';
comment on column public.advertisements.budget_krw       is '예산 (원, 선택)';
comment on column public.advertisements.impression_count is '노출 수';
comment on column public.advertisements.click_count      is '클릭 수';
comment on column public.advertisements.is_active        is '활성 여부';
comment on column public.advertisements.created_by       is '등록 관리자 (users.id)';
comment on column public.advertisements.created_at       is '생성 일시';
comment on column public.advertisements.updated_at       is '수정 일시';

create index ads_active_period_idx on public.advertisements(start_date, end_date) where is_active;
create index ads_placement_idx     on public.advertisements(placement)            where is_active;

create trigger advertisements_set_updated_at
  before update on public.advertisements
  for each row execute function public.set_updated_at();

alter table public.advertisements enable row level security;

create policy "ads_select_serving"
  on public.advertisements for select
  using (
    is_active = true
    and now() between start_date and end_date
  );

create policy "ads_admin_all"
  on public.advertisements for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 7. reports 테이블 (콘텐츠 신고)
-- =====================================================

create type public.report_target_type as enum ('article', 'comment', 'user');
create type public.report_reason      as enum ('spam', 'abuse', 'misinformation', 'copyright', 'other');
create type public.report_status      as enum ('pending', 'reviewing', 'resolved', 'rejected');

create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  reporter_id     uuid not null references public.users(id) on delete cascade,
  target_type     public.report_target_type not null,
  target_id       uuid not null,
  reason          public.report_reason not null,
  description     text check (description is null or char_length(description) <= 1000),
  status          public.report_status not null default 'pending',
  resolved_by     uuid references public.users(id) on delete set null,
  resolved_at     timestamptz,
  resolution_note text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.reports                  is '콘텐츠 신고';
comment on column public.reports.id               is '신고 ID';
comment on column public.reports.reporter_id      is '신고자 (users.id)';
comment on column public.reports.target_type      is '신고 대상 유형: article / comment / user';
comment on column public.reports.target_id        is '신고 대상 ID (target_type 에 따라 articles/comments/users 중 하나)';
comment on column public.reports.reason           is '신고 사유: spam / abuse / misinformation / copyright / other';
comment on column public.reports.description      is '추가 설명 (최대 1000자)';
comment on column public.reports.status           is '처리 상태: pending / reviewing / resolved / rejected';
comment on column public.reports.resolved_by      is '처리 관리자 (users.id)';
comment on column public.reports.resolved_at      is '처리 완료 일시';
comment on column public.reports.resolution_note  is '처리 메모';
comment on column public.reports.created_at       is '신고 일시';
comment on column public.reports.updated_at       is '수정 일시';

create index reports_target_idx   on public.reports(target_type, target_id);
create index reports_status_idx   on public.reports(status, created_at desc);
create index reports_reporter_idx on public.reports(reporter_id);

create unique index reports_unique_per_reporter
  on public.reports(reporter_id, target_type, target_id)
  where status in ('pending', 'reviewing');

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

create or replace function public.set_resolved_at()
returns trigger
language plpgsql
as $$
begin
  if new.status in ('resolved', 'rejected')
     and (old.status not in ('resolved', 'rejected'))
     and new.resolved_at is null then
    new.resolved_at = now();
    new.resolved_by = coalesce(new.resolved_by, auth.uid());
  end if;
  return new;
end;
$$;

create trigger reports_set_resolved_at
  before update of status on public.reports
  for each row execute function public.set_resolved_at();

alter table public.reports enable row level security;

create policy "reports_select_self"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

create policy "reports_insert_self"
  on public.reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_id
    and status = 'pending'
    and resolved_by is null
    and resolved_at is null
  );

create policy "reports_delete_self_pending"
  on public.reports for delete
  to authenticated
  using (auth.uid() = reporter_id and status = 'pending');

create policy "reports_admin_all"
  on public.reports for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =====================================================
-- 8. auth.users → public.users 자동 프로파일 생성 트리거
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
