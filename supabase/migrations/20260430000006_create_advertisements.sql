-- =====================================================
-- 이음미디어 - advertisements 테이블
-- 광고 캠페인
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

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.advertisements enable row level security;

-- 게재중인 활성 광고는 누구나 조회 (노출용)
create policy "ads_select_serving"
  on public.advertisements for select
  using (
    is_active = true
    and now() between start_date and end_date
  );

-- 관리자는 모든 광고 전체 조회/관리 가능
create policy "ads_admin_all"
  on public.advertisements for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
