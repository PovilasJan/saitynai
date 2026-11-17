import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { ErrorBox } from '../components'

function AuthForm({ title, action, alt }) {
  const [f, setF] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const nav = useNavigate()
  const submit = async (e) => {
    e.preventDefault()
    try { await action(f.username, f.password); nav('/') } catch (e) { setErr(e.message) }
  }
  return (
    <div className="auth-box">
      <h1>{title}</h1>
      <form className="form" onSubmit={submit}>
        <ErrorBox msg={err} />
        <label>Vartotojo vardas<input required minLength={3} autoComplete="username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></label>
        <label>Slaptažodis<input type="password" required minLength={6} autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <button className="btn">{title}</button>
      </form>
      <p className="muted">{alt}</p>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  return <AuthForm title="Prisijungti" action={login} alt={<>Neturite paskyros? <Link to="/register">Registruokitės</Link></>} />
}

export function Register() {
  const { register } = useAuth()
  return <AuthForm title="Registruotis" action={register} alt={<>Jau turite paskyrą? <Link to="/login">Prisijunkite</Link></>} />
}
