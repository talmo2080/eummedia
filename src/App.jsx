import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:channel/:slug" element={<ArticleDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
