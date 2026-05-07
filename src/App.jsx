import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import ChannelList from './pages/ChannelList'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/channel" element={<ChannelList />} />
        <Route path="/channel/:channelName" element={<ChannelList />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/:channel/:slug" element={<ArticleDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App