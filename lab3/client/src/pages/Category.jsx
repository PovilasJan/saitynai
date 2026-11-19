import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Modal, ConfirmModal, ErrorBox, Stars, Pager, Spinner, useToast } from '../components'
import { PlusIcon, EditIcon, TrashIcon, ClockIcon, WeightIcon, BackIcon, SearchIcon } from '../icons'

const LIMIT = 6
const MANUFACTURERS = ['DJI', 'Autel Robotics', 'iFlight', 'Parrot', 'Skydio', 'BetaFPV']
const noFilter = { search: '', manufacturer: '', maxPrice: '' }

export default function Category() {
  const { cid } = useParams()
  const { isAdmin } = useAuth()
  const toast = useToast()
  const [cat, setCat] = useState(null)
  const [res, setRes] = useState(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState(noFilter)
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')

  const loadDrones = () => {
    const q = new URLSearchParams({ page, limit: LIMIT })
    for (const [k, v] of Object.entries(filter)) if (v !== '') q.set(k, v)
    api(`/categories/${cid}/drones?${q}`).then(setRes).catch((e) => setErr(e.message))
  }
  useEffect(() => { api(`/categories/${cid}`).then(setCat).catch((e) => setErr(e.message)) }, [cid])
  useEffect(() => {
    const t = setTimeout(loadDrones, 250)
    return () => clearTimeout(t)
  }, [cid, page, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const setF = (k) => (e) => { setFilter({ ...filter, [k]: e.target.value }); setPage(1) }

  const remove = async (d) => {
    try {
      await api(`/categories/${cid}/drones/${d.id}`, { method: 'DELETE' })
      toast(`Dronas „${d.name}“ ištrintas`)
      loadDrones()
    } catch (e) { toast(e.message, 'error') }
  }

  if (err && !cat) return <ErrorBox msg={err} />
  if (!cat) return <Spinner />

  return (
    <>
      <Link to="/" className="back"><BackIcon size={16} /> Visos kategorijos</Link>
      <div className="section-head">
        <div>
          <h1>{cat.name}</h1>
          <p className="muted">{cat.description}</p>
        </div>
        {isAdmin && <button className="btn" onClick={() => setEdit({})}><PlusIcon size={18} /> Naujas dronas</button>}
      </div>

      <div className="filters">
        <label className="search">
          <SearchIcon size={18} />
          <input type="search" placeholder="Modelio pavadinimas..." aria-label="Ieškoti modelio" value={filter.search} onChange={setF('search')} />
        </label>
        <select aria-label="Gamintojas" value={filter.manufacturer} onChange={setF('manufacturer')}>
          <option value="">Visi gamintojai</option>
          {MANUFACTURERS.map((m) => <option key={m}>{m}</option>)}
        </select>
        <input type="number" min="0" placeholder="Kaina iki, €" aria-label="Didžiausia kaina" value={filter.maxPrice} onChange={setF('maxPrice')} />
        {(filter.search || filter.manufacturer || filter.maxPrice) && (
          <button className="btn outline small" onClick={() => { setFilter(noFilter); setPage(1) }}>Išvalyti</button>
        )}
      </div>
      <ErrorBox msg={err} />

      {!res ? <Spinner /> : (
        <div className="grid">
          {res.data.map((d) => (
            <article key={d.id} className="card drone-card">
              <Link to={`/categories/${cid}/drones/${d.id}`} className="card-link">
                {d.image_url && <img src={d.image_url} alt={d.name} />}
                <div className="drone-card-body">
                  <small>{d.manufacturer}</small>
                  <h3>{d.name}</h3>
                  <div className="specs">
                    <span><ClockIcon size={16} /> {d.flight_time ?? '–'} min</span>
                    <span><WeightIcon size={16} /> {d.weight ?? '–'} g</span>
                  </div>
                  <div className="row-between">
                    <strong className="price">{d.price} €</strong>
                    <span><Stars value={d.avg_rating || 0} /> <small>({d.review_count})</small></span>
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <div className="card-actions">
                  <button className="icon-btn" aria-label="Redaguoti" onClick={() => setEdit(d)}><EditIcon size={18} /></button>
                  <button className="icon-btn danger" aria-label="Ištrinti" onClick={() => setDel(d)}><TrashIcon size={18} /></button>
                </div>
              )}
            </article>
          ))}
          {!res.data.length && <p className="muted">Pagal pasirinktus filtrus dronų nerasta.</p>}
        </div>
      )}
      <Pager meta={res?.meta} onPage={setPage} />

      {edit && (
        <Modal title={edit.id ? 'Redaguoti droną' : 'Naujas dronas'} onClose={() => setEdit(null)}>
          <DroneForm cid={cid} drone={edit} onDone={(msg) => { setEdit(null); toast(msg); loadDrones() }} />
        </Modal>
      )}
      {del && <ConfirmModal text={`Ištrinti droną „${del.name}“ kartu su jo atsiliepimais?`} onConfirm={() => remove(del)} onClose={() => setDel(null)} />}
    </>
  )
}

function DroneForm({ cid, drone, onDone }) {
  const [f, setF] = useState({
    name: drone.name || '', manufacturer: drone.manufacturer || 'DJI', price: drone.price ?? '',
    flight_time: drone.flight_time ?? '', weight: drone.weight ?? '', image_url: drone.image_url || '',
  })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    const body = { ...f, price: Number(f.price) }
    for (const k of ['flight_time', 'weight']) body[k] = f[k] === '' ? undefined : Number(f[k])
    if (!body.image_url) delete body.image_url
    try {
      await api(drone.id ? `/categories/${cid}/drones/${drone.id}` : `/categories/${cid}/drones`, { method: drone.id ? 'PUT' : 'POST', body })
      onDone(drone.id ? 'Dronas atnaujintas' : 'Dronas pridėtas')
    } catch (e) { setErr(e.message) }
  }
  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox msg={err} />
      <label>Modelis<input required value={f.name} onChange={set('name')} /></label>
      <label>Gamintojas
        <select value={f.manufacturer} onChange={set('manufacturer')}>
          {MANUFACTURERS.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <div className="form-row">
        <label>Kaina (€)<input type="number" required min="0" step="0.01" value={f.price} onChange={set('price')} /></label>
        <label>Skrydžio laikas (min)<input type="number" min="0" value={f.flight_time} onChange={set('flight_time')} /></label>
        <label>Svoris (g)<input type="number" min="0" value={f.weight} onChange={set('weight')} /></label>
      </div>
      <label>Nuotraukos URL<input value={f.image_url} onChange={set("image_url")} placeholder="/img/cam-1.svg arba https://..." /></label>
      <button className="btn">Išsaugoti</button>
    </form>
  )
}
