import { Routes, Route } from 'react-router-dom'
import { Header, Footer } from './components'
import Home from './pages/Home'
import Category from './pages/Category'
import Drone from './pages/Drone'
import { Login, Register } from './pages/Auth'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

export default function App() {
  return (
    <div className="layout">
      <Header />
      <main className="content container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categories/:cid" element={<Category />} />
          <Route path="/categories/:cid/drones/:did" element={<Drone />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<h2>Puslapis nerastas</h2>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
