import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Modal, ErrorBox, Stars } from '../components'
import { PlusIcon, EditIcon, TrashIcon, ClockIcon, WeightIcon, BackIcon } from '../icons'

export default function Category() {
  const { cid } = useParams()
  const { isAdmin } = useAuth()
  const [cat, setCat] = useState(null)
  const [drones, setDrones] = useState([])
  const [edit, setEdit] = useState(null)
  const [err, setErr] = useState('')

  const load = () => {
    api(`/categories/${cid}`).then(setCat).catch((e) => setErr(e.message))
    api(`/categories/${cid}/drones`).then(setDrones).catch(() => {})
  }
  useEffect(load, [cid])

  const remove = async (d) => {
    if (!confirm(`Ištrinti droną „${d.name}“?`)) return
    await api(`/categories/${cid}/drones/${d.id}`, { method: 'DELETE' }).then(load).catch((e) => setErr(e.message))
  }

  if (err && !cat) return <ErrorBox msg={err} />
  if (!cat) return <p>Kraunama...</p>

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
      <ErrorBox msg={err} />

      <div className="grid">
        {drones.map((d) => (
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
                <button className="icon-btn danger" aria-label="Ištrinti" onClick={() => remove(d)}><TrashIcon size={18} /></button>
              </div>
            )}
          </article>
        ))}
        {!drones.length && <p className="muted">Šioje kategorijoje dronų dar nėra.</p>}
      </div>

      {edit && (
        <Modal title={edit.id ? 'Redaguoti droną' : 'Naujas dronas'} onClose={() => setEdit(null)}>
          <DroneForm cid={cid} drone={edit} onDone={() => { setEdit(null); load() }} />
        </Modal>
      )}
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
      onDone()
    } catch (e) { setErr(e.message) }
  }
  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox msg={err} />
      <label>Modelis<input required value={f.name} onChange={set('name')} /></label>
      <label>Gamintojas
        <select value={f.manufacturer} onChange={set('manufacturer')}>
          {['DJI', 'Autel Robotics', 'iFlight', 'Parrot', 'Skydio', 'BetaFPV'].map((m) => <option key={m}>{m}</option>)}
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
