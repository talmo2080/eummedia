import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 페이지(pathname) 이동 시마다 스크롤 위치를 맨 위로 초기화.
// SPA 표준 패턴 — BrowserRouter 안에 한 번 마운트하면 모든 라우트 전환에 일관 적용.
// behavior: 'instant' — 모바일 시니어 UX에선 smooth보다 즉시 점프가 자연.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
