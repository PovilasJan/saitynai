import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Modal, ConfirmModal, ErrorBox, Pager, Spinner, useToast } from '../components'
import { PlusIcon, EditIcon, TrashIcon, DroneIcon, SearchIcon } from '../icons'

const LIMIT = 6

export default function Home() {
  const { isAdmin } = useAuth()
  const toast = useToast()
  const [res, setRes] = useState(null) // { data, meta, _links }
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [edit, setEdit] = useState(null) // null | {} | kategorija
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')

  const load = () => {
    const q = new URLSearchParams({ page, limit: LIMIT })
    if (search) q.set('search', search)
    api(`/categories?${q}`).then(setRes).catch((e) => setErr(e.message))
  }
  useEffect(() => {
    const t = setTimeout(load, 250) // paieška tik nustojus rašyti
    return () => clearTimeout(t)
  }, [page, search]) // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (c) => {
    try {
      await api(`/categories/${c.id}`, { method: 'DELETE' })
      toast(`Kategorija „${c.name}“ ištrinta`)
      load()
    } catch (e) { toast(e.message, 'error') }
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
        <div className="toolbar">
          <label className="search">
            <SearchIcon size={18} />
            <input type="search" placeholder="Ieškoti kategorijos..." aria-label="Ieškoti kategorijos" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </label>
          {isAdmin && <button className="btn" onClick={() => setEdit({})}><PlusIcon size={18} /> Nauja kategorija</button>}
        </div>
      </div>
      <ErrorBox msg={err} />

      {!res ? <Spinner /> : (
        <div className="grid">
          {res.data.map((c) => (
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
                  <button className="icon-btn danger" aria-label="Ištrinti" onClick={() => setDel(c)}><TrashIcon size={18} /></button>
                </div>
              )}
            </article>
          ))}
          {!res.data.length && <p className="muted">Kategorijų nerasta.</p>}
        </div>
      )}
      <Pager meta={res?.meta} onPage={setPage} />

      {edit && (
        <Modal title={edit.id ? 'Redaguoti kategoriją' : 'Nauja kategorija'} onClose={() => setEdit(null)}>
          <CategoryForm cat={edit} onDone={(msg) => { setEdit(null); toast(msg); load() }} />
        </Modal>
      )}
      {del && (
        <ConfirmModal text={`Ištrinti kategoriją „${del.name}“ kartu su visais jos dronais?`} onConfirm={() => remove(del)} onClose={() => setDel(null)} />
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
      onDone(cat.id ? 'Kategorija atnaujinta' : 'Kategorija sukurta')
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
