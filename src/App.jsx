import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import ChannelList from './pages/ChannelList'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'
import Advertise from './pages/Advertise'
import Report from './pages/Report'
import CitizenReporter from './pages/CitizenReporter'
import Subscribe from './pages/Subscribe'
import About from './pages/About'
import Privacy from './pages/Privacy'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/channel/:englishSlug" element={<ChannelList />} />
          <Route path="/channel" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/report" element={<Report />} />
          <Route path="/citizen-reporter" element={<CitizenReporter />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
