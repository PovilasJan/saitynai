import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { DroneIcon, MenuIcon, CloseIcon, UserIcon, LogoutIcon, MailIcon, PinIcon, StarIcon } from './icons'

export function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const close = () => setOpen(false)

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo" onClick={close}><DroneIcon size={28} /><span>EuroDrone<b>Hub</b></span></Link>
        <button className="burger" aria-label="Meniu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <nav className={`nav ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Katalogas</NavLink>
          <NavLink to="/about" onClick={close}>Apie</NavLink>
          {user ? (
            <>
              <span className="nav-user"><UserIcon size={16} /> {user.username} <em>{user.role}</em></span>
              <button className="nav-btn" onClick={async () => { await logout(); close(); nav('/') }}><LogoutIcon size={16} /> Atsijungti</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Prisijungti</NavLink>
              <NavLink to="/register" className="nav-cta" onClick={close}>Registruotis</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4><DroneIcon size={18} /> EuroDroneHub</h4>
          <p>Dronų katalogas ir naudotojų atsiliepimai vienoje vietoje.</p>
        </div>
        <div>
          <h4>Nuorodos</h4>
          <Link to="/">Katalogas</Link>
          <Link to="/about">Apie projektą</Link>
        </div>
        <div>
          <h4>Kontaktai</h4>
          <p><MailIcon size={16} /> kontaktai@pavyzdys.lt</p>
          <p><PinIcon size={16} /> Kaunas, Lietuva</p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} EuroDroneHub · KTU Saityno taikomųjų programų projektavimas</div>
    </footer>
  )
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" aria-label="Uždaryti" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Stars({ value, size = 16 }) {
  return (
    <span className="stars" aria-label={`Įvertinimas ${value} iš 5`}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} size={size} filled={i <= Math.round(value)} />)}
    </span>
  )
}

export const ErrorBox = ({ msg }) => (msg ? <div className="alert">{msg}</div> : null)
