import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import ChannelList from './pages/ChannelList'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/channel" element={<ChannelList />} />
        <Route path="/channel/:channelName" element={<ChannelList />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/:channel/:slug" element={<ArticleDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
