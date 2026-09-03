import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import PiumShell from './components/PiumShell'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import ChannelList from './pages/ChannelList'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Register from './pages/Register'
import FindPassword from './pages/FindPassword'
import Terms from './pages/Terms'
import AdminDashboard from './pages/AdminDashboard'
import Advertise from './pages/Advertise'
import Report from './pages/Report'
import CitizenReporter from './pages/CitizenReporter'
import Subscribe from './pages/Subscribe'
import About from './pages/About'
import Privacy from './pages/Privacy'
import YouthPolicy from './pages/YouthPolicy'
import ArticleEditor from './pages/ArticleEditor'
import MyPage from './pages/MyPage'
import Videos from './pages/Videos'
import Pium from './pages/Pium'
import PiumRequest from './pages/PiumRequest'
import PiumSubmitPage from './pages/PiumSubmitPage'
import PiumAdminPage from './pages/PiumAdminPage'
import PiumStorePage from './pages/PiumStorePage'
import PiumAppDetailPage from './pages/PiumAppDetailPage'

/* ── 이음미디어 헤더·푸터를 피움 경로에서 숨기는 껍데기 ── */
function AppShell() {
  const { pathname } = useLocation();
  const isPium = pathname.startsWith('/pium');

  return (
    <AuthProvider>
      {/* Skip-to-content 링크 — 키보드·스크린리더 사용자용
          평소엔 sr-only (화면에서 안 보임)로 감춤. Tab 누르면 첫 focus로 이동해 표시.
          클릭·Enter 시 <main id="main-content">로 포커스 이동. */}
      <a href="#main-content" className="skip-link">본문 바로가기</a>
      {!isPium && <Header />}
      <Routes>
        {/* ── 이음미디어 라우트 ── */}
        <Route path="/" element={<Home />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/channel/:englishSlug" element={<ChannelList />} />
        <Route path="/channel" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Register />} />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/report" element={<Report />} />
        <Route path="/citizen-reporter" element={<CitizenReporter />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/youth" element={<YouthPolicy />} />
        <Route path="/videos" element={<Videos />} />
        {/* 접근성 안내 페이지 — 5-3에서 실제 페이지로 대체. 우선 홈으로 리다이렉트 (링크 유효성 확보) */}
        <Route path="/accessibility" element={<Navigate to="/" replace />} />
        <Route path="/write" element={
          <ProtectedRoute requiredRole="writer"><ArticleEditor /></ProtectedRoute>
        } />
        <Route path="/mypage" element={<MyPage />} />

        {/* ── 피움 라우트 (PiumShell: 피움 헤더·푸터·배경) ── */}
        <Route element={<PiumShell />}>
          <Route path="/pium" element={<Pium />} />
          <Route path="/pium-store" element={<PiumStorePage />} />
          <Route path="/pium-app/:slug" element={<PiumAppDetailPage />} />
          <Route path="/pium-request" element={<PiumRequest />} />
          <Route path="/pium-submit" element={<PiumSubmitPage />} />
          <Route path="/pium-admin" element={
            <ProtectedRoute requiredRole="admin"><PiumAdminPage /></ProtectedRoute>
          } />
        </Route>
      </Routes>
      {!isPium && <Footer />}
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  )
}
