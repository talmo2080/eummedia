# 이음미디어 Supabase 마이그레이션

Project ref: `avbsniuthpcejjcdeiyw`

## 파일 구성 (실행 순서)

| 순서 | 파일 | 내용 |
|------|------|------|
| 1 | `20260430000001_create_users.sql` | `users` + `user_role` enum + `set_updated_at()`, `is_admin()` 헬퍼 |
| 2 | `20260430000002_create_channels.sql` | `channels` |
| 3 | `20260430000003_create_articles.sql` | `articles` + `article_status` enum |
| 4 | `20260430000004_create_comments.sql` | `comments` + 댓글 수 집계 트리거 |
| 5 | `20260430000005_create_subscriptions.sql` | `subscriptions` + 구독자 수 집계 트리거 |
| 6 | `20260430000006_create_advertisements.sql` | `advertisements` + `ad_placement` enum |
| 7 | `20260430000007_create_reports.sql` | `reports` + 3종 enum |
| 8 | `20260430000008_auth_trigger.sql` | `auth.users` → `public.users` 자동 생성 트리거 |

## 적용 방법

### A. Supabase CLI

```bash
supabase link --project-ref avbsniuthpcejjcdeiyw
supabase db push
```

### B. Dashboard SQL Editor

각 파일을 순서대로 복사 → 실행.

## 핵심 설계

- **역할 기반 접근**: `users.role` (`reader` / `writer` / `admin`)
  - `writer` 이상만 채널/기사 생성 가능
  - `admin` 은 모든 테이블 전체 권한
  - 일반 사용자가 본인 `role` 을 변경하지 못하도록 트리거로 차단
- **소프트 삭제**: 댓글은 `is_deleted` 로 소프트 삭제, 사용자는 `is_active` 토글
- **집계 캐시**: `articles.comment_count`, `channels.subscriber_count` 는 트리거로 동기화
- **Slug 유니크**: 채널은 전역 unique, 기사는 `(channel_id, slug)` 로 채널 내 unique
- **신고 중복 방지**: 동일 사용자가 같은 대상을 중복 신고할 수 없음 (`pending`/`reviewing` 상태에 한해)
- **광고 노출**: `is_active = true AND now() between start_date AND end_date` 인 광고만 비로그인 포함 누구나 SELECT

## RLS 요약

| 테이블 | 비로그인 SELECT | 본인 SELECT | INSERT 권한 | UPDATE/DELETE |
|--------|----|----|----|----|
| users | 활성 프로파일만 | 본인 비활성 포함 | 본인 행만 | 본인 (role 제외) / admin |
| channels | 활성만 | 소유자/admin 비활성 포함 | writer+ 본인 owner | 소유자 / admin |
| articles | published 만 | 작성자/채널소유자/admin 전체 | writer+ 본인 author | 작성자 / 채널소유자 / admin |
| comments | published 기사의 비삭제 | 본인 / admin | 로그인 사용자 | 작성자 / admin |
| subscriptions | ❌ | 본인 / 채널소유자 | 본인 | 본인 / admin |
| advertisements | 게재중인 활성만 | — | admin only | admin only |
| reports | ❌ | 본인 / admin | 로그인 사용자 | 본인 삭제(pending) / admin |
