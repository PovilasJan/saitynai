import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import {
  DroneIcon, MenuIcon, CloseIcon, UserIcon, LogoutIcon, MailIcon, PinIcon, StarIcon, BackIcon, NextIcon,
  GridIcon, ChartIcon, InfoIcon, LoginIcon, UserPlusIcon, CheckIcon, AlertIcon, TrashIcon,
} from './icons'

const ROLE_LT = { admin: 'administratorius', moderator: 'moderatorius', member: 'narys' }
export const roleName = (r) => ROLE_LT[r] || r

export function Header() {
  const { user, logout } = useAuth()
  const toast = useToast()
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
          <NavLink to="/" end onClick={close}><GridIcon size={16} /> Katalogas</NavLink>
          <NavLink to="/dashboard" onClick={close}><ChartIcon size={16} /> Statistika</NavLink>
          <NavLink to="/about" onClick={close}><InfoIcon size={16} /> Apie</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className="nav-user" onClick={close}><UserIcon size={16} /> {user.username} <em>{roleName(user.role)}</em></NavLink>
              <button className="nav-btn" onClick={async () => { await logout(); close(); toast('Atsijungėte'); nav('/') }}><LogoutIcon size={16} /> Atsijungti</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}><LoginIcon size={16} /> Prisijungti</NavLink>
              <NavLink to="/register" className="nav-cta" onClick={close}><UserPlusIcon size={16} /> Registruotis</NavLink>
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
          <Link to="/dashboard">Statistika</Link>
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

// ištrynimo patvirtinimas modaliniame lange (vietoj naršyklės confirm())
export function ConfirmModal({ text, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal title="Patvirtinkite ištrynimą" onClose={onClose}>
      <p className="confirm-text"><AlertIcon size={22} /> {text}</p>
      <div className="modal-actions">
        <button className="btn outline" onClick={onClose}>Atšaukti</button>
        <button className="btn danger" disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); onClose() }}>
          <TrashIcon size={18} /> Ištrinti
        </button>
      </div>
    </Modal>
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

// puslapiavimas pagal API meta { page, totalPages, total }
export function Pager({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null
  return (
    <nav className="pager" aria-label="Puslapiai">
      <button className="icon-btn" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} aria-label="Ankstesnis"><BackIcon size={18} /></button>
      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={`pager-num ${p === meta.page ? 'active' : ''}`} onClick={() => onPage(p)}>{p}</button>
      ))}
      <button className="icon-btn" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)} aria-label="Kitas"><NextIcon size={18} /></button>
      <small className="muted">iš viso: {meta.total}</small>
    </nav>
  )
}

export const Spinner = () => <div className="spinner" role="status" aria-label="Kraunama" />

// ---------- Pranešimai (toast) vietoj alert() ----------
const ToastCtx = createContext(() => {})

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const show = useCallback((text, type = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((x) => [...x, { id, text, type }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3000)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.type === 'ok' ? <CheckIcon size={18} /> : <AlertIcon size={18} />} {t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
