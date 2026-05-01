-- =====================================================
-- 이음미디어 - reports 테이블
-- 콘텐츠 신고 (기사/댓글/사용자 대상)
-- =====================================================

create type public.report_target_type as enum ('article', 'comment', 'user');
create type public.report_reason      as enum ('spam', 'abuse', 'misinformation', 'copyright', 'other');
create type public.report_status      as enum ('pending', 'reviewing', 'resolved', 'rejected');

create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references public.users(id) on delete cascade,
  target_type   public.report_target_type not null,
  target_id     uuid not null,
  reason        public.report_reason not null,
  description   text check (description is null or char_length(description) <= 1000),
  status        public.report_status not null default 'pending',
  resolved_by   uuid references public.users(id) on delete set null,
  resolved_at   timestamptz,
  resolution_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
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

-- 동일 사용자가 동일 대상을 중복 신고하지 못하도록
create unique index reports_unique_per_reporter
  on public.reports(reporter_id, target_type, target_id)
  where status in ('pending', 'reviewing');

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- 처리 상태로 변경되는 순간 resolved_at 자동 세팅
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

-- =====================================================
-- RLS 정책
-- =====================================================
alter table public.reports enable row level security;

-- 본인이 작성한 신고만 조회 가능
create policy "reports_select_self"
  on public.reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- 로그인 사용자는 신고 생성 가능 (본인을 reporter 로 지정)
create policy "reports_insert_self"
  on public.reports for insert
  to authenticated
  with check (
    auth.uid() = reporter_id
    and status = 'pending'
    and resolved_by is null
    and resolved_at is null
  );

-- 신고자는 처리 전(pending) 상태에서만 본인 신고 삭제 가능
create policy "reports_delete_self_pending"
  on public.reports for delete
  to authenticated
  using (auth.uid() = reporter_id and status = 'pending');

-- 관리자는 모든 신고 조회/처리 가능
create policy "reports_admin_all"
  on public.reports for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
