import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Header />
        <main>
          <Routes>
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
            <Route path="/write" element={
              <ProtectedRoute requiredRole="writer"><ArticleEditor /></ProtectedRoute>
            } />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
