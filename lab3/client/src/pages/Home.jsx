import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Modal, ErrorBox } from '../components'
import { PlusIcon, EditIcon, TrashIcon, DroneIcon } from '../icons'

export default function Home() {
  const { isAdmin } = useAuth()
  const [cats, setCats] = useState([])
  const [edit, setEdit] = useState(null) // null | {} | kategorija
  const [err, setErr] = useState('')

  const load = () => api('/categories').then(setCats).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])

  const remove = async (c) => {
    if (!confirm(`Ištrinti kategoriją „${c.name}“ su visais dronais?`)) return
    await api(`/categories/${c.id}`, { method: 'DELETE' }).then(load).catch((e) => setErr(e.message))
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1>Raskite savo droną</h1>
          <p>Peržiūrėkite dronų kategorijas, palyginkite modelius ir skaitykite tikrų pilotų atsiliepimus.</p>
        </div>
        <img src="/img/hero.svg" alt="Dronas ore" />
      </section>

      <div className="section-head">
        <h2>Kategorijos</h2>
        {isAdmin && <button className="btn" onClick={() => setEdit({})}><PlusIcon size={18} /> Nauja kategorija</button>}
      </div>
      <ErrorBox msg={err} />

      <div className="grid">
        {cats.map((c) => (
          <article key={c.id} className="card">
            <Link to={`/categories/${c.id}`} className="card-link">
              <div className="card-icon"><DroneIcon size={32} /></div>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
              <span className="badge">{c.drone_count} dronai</span>
            </Link>
            {isAdmin && (
              <div className="card-actions">
                <button className="icon-btn" aria-label="Redaguoti" onClick={() => setEdit(c)}><EditIcon size={18} /></button>
                <button className="icon-btn danger" aria-label="Ištrinti" onClick={() => remove(c)}><TrashIcon size={18} /></button>
              </div>
            )}
          </article>
        ))}
      </div>

      {edit && (
        <Modal title={edit.id ? 'Redaguoti kategoriją' : 'Nauja kategorija'} onClose={() => setEdit(null)}>
          <CategoryForm cat={edit} onDone={() => { setEdit(null); load() }} />
        </Modal>
      )}
    </>
  )
}

function CategoryForm({ cat, onDone }) {
  const [f, setF] = useState({ name: cat.name || '', description: cat.description || '' })
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    try {
      await api(cat.id ? `/categories/${cat.id}` : '/categories', { method: cat.id ? 'PUT' : 'POST', body: f })
      onDone()
    } catch (e) { setErr(e.message) }
  }
  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox msg={err} />
      <label>Pavadinimas<input required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label>Aprašymas<textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <button className="btn">Išsaugoti</button>
    </form>
  )
}
