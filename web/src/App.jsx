import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import GlobalNav from './components/GlobalNav'
import Footer from './components/Footer'
import Home from './pages/Home'
import CategoryIndex from './pages/CategoryIndex'
import CategoryPage from './pages/CategoryPage'
import DetailPage from './pages/DetailPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <GlobalNav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<CategoryIndex />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/detail/:category/:filename" element={<DetailPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}