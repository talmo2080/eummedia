-- =====================================================
-- 이음미디어 - comments 테이블
-- 기사 댓글 (대댓글 1단계 지원)
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

-- 기사 comment_count 집계 동기화
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

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.comments enable row level security;

-- 삭제되지 않은 댓글은 누구나 조회 (대상 기사가 published 인 경우)
create policy "comments_select_visible"
  on public.comments for select
  using (
    is_deleted = false
    and exists (
      select 1 from public.articles a
      where a.id = comments.article_id and a.status = 'published'
    )
  );

-- 작성자/관리자는 본인 댓글(삭제 포함) 조회 가능
create policy "comments_select_author"
  on public.comments for select
  to authenticated
  using (auth.uid() = author_id or public.is_admin(auth.uid()));

-- 로그인 사용자만 댓글 작성, 본인을 author 로 지정
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

-- 작성자는 본인 댓글 수정 가능
create policy "comments_update_author"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- 작성자는 본인 댓글 삭제 가능
create policy "comments_delete_author"
  on public.comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- 관리자는 모든 작업 가능
create policy "comments_admin_all"
  on public.comments for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
