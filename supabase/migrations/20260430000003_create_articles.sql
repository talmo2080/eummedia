-- =====================================================
-- 이음미디어 - articles 테이블
-- 기사
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

-- published 상태로 변경되는 순간 published_at 자동 세팅
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

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.articles enable row level security;

-- 게시된 기사는 누구나 조회
create policy "articles_select_published"
  on public.articles for select
  using (status = 'published');

-- 작성자/채널 소유자/관리자는 모든 상태 조회 가능
create policy "articles_select_author_or_owner"
  on public.articles for select
  to authenticated
  using (
    auth.uid() = author_id
    or exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid())
    or public.is_admin(auth.uid())
  );

-- writer/admin 이고 본인을 author 로 지정해야 INSERT 허용
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

-- 작성자는 본인 기사 수정/삭제 가능
create policy "articles_update_author"
  on public.articles for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "articles_delete_author"
  on public.articles for delete
  to authenticated
  using (auth.uid() = author_id);

-- 채널 소유자도 본 채널의 기사 관리 가능
create policy "articles_manage_channel_owner"
  on public.articles for all
  to authenticated
  using (exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.channels c where c.id = articles.channel_id and c.owner_id = auth.uid()));

-- 관리자는 모든 작업 가능
create policy "articles_admin_all"
  on public.articles for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
