import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Modal, ConfirmModal, ErrorBox, Stars, Pager, Spinner, useToast } from '../components'
import { EditIcon, TrashIcon, InfoIcon, BackIcon, UserIcon } from '../icons'

const LIMIT = 5

export default function Drone() {
  const { cid, did } = useParams()
  const { user, canModerate } = useAuth()
  const toast = useToast()
  const [drone, setDrone] = useState(null)
  const [res, setRes] = useState(null)
  const [page, setPage] = useState(1)
  const [minRating, setMinRating] = useState('')
  const [specs, setSpecs] = useState(false)
  const [edit, setEdit] = useState(null)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const base = `/categories/${cid}/drones/${did}`

  const loadDrone = () => api(base).then(setDrone).catch((e) => setErr(e.message))
  const loadReviews = () => {
    const q = new URLSearchParams({ page, limit: LIMIT })
    if (minRating) q.set('minRating', minRating)
    api(`${base}/reviews?${q}`).then(setRes).catch(() => {})
  }
  const reload = () => { loadDrone(); loadReviews() }
  useEffect(() => { loadDrone() }, [base]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadReviews() }, [base, page, minRating]) // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (r) => {
    try {
      await api(`${base}/reviews/${r.id}`, { method: 'DELETE' })
      toast('Atsiliepimas ištrintas')
      reload()
    } catch (e) { toast(e.message, 'error') }
  }

  if (err && !drone) return <ErrorBox msg={err} />
  if (!drone) return <Spinner />
  const avg = drone.avg_rating || 0

  return (
    <>
      <Link to={`/categories/${cid}`} className="back"><BackIcon size={16} /> Atgal į kategoriją</Link>
      <section className="drone-detail">
        {drone.image_url && <img src={drone.image_url} alt={drone.name} />}
        <div>
          <small className="muted">{drone.manufacturer}</small>
          <h1>{drone.name}</h1>
          <p className="price big">{drone.price} €</p>
          <p><Stars value={avg} size={20} /> {avg.toFixed(1)} ({drone.review_count} atsiliepimai)</p>
          <button className="btn outline" onClick={() => setSpecs(true)}><InfoIcon size={18} /> Specifikacija</button>
        </div>
      </section>

      <div className="two-col">
        <section>
          <div className="row-between section-head-sm">
            <h2>Atsiliepimai</h2>
            <select aria-label="Filtruoti pagal įvertinimą" value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(1) }}>
              <option value="">Visi įvertinimai</option>
              <option value="5">Tik 5 ★</option>
              <option value="4">4 ★ ir daugiau</option>
              <option value="3">3 ★ ir daugiau</option>
            </select>
          </div>
          <ErrorBox msg={err} />
          {!res ? <Spinner /> : res.data.map((r) => (
            <article key={r.id} className="review">
              <div className="row-between">
                <strong><UserIcon size={16} /> {r.username}</strong>
                <Stars value={r.rating} />
              </div>
              <p>{r.comment}</p>
              <div className="row-between">
                <small className="muted">{r.flown_at ? `Skraidyta ${r.flown_at}` : ''} {r.recommended ? '· Rekomenduoja' : '· Nerekomenduoja'}</small>
                {user && (canModerate || user.id === r.user_id) && (
                  <span>
                    <button className="icon-btn" aria-label="Redaguoti" onClick={() => setEdit(r)}><EditIcon size={16} /></button>
                    <button className="icon-btn danger" aria-label="Ištrinti" onClick={() => setDel(r)}><TrashIcon size={16} /></button>
                  </span>
                )}
              </div>
            </article>
          ))}
          {res && !res.data.length && <p className="muted">{minRating ? 'Tokių atsiliepimų nėra.' : 'Atsiliepimų dar nėra. Būkite pirmas!'}</p>}
          <Pager meta={res?.meta} onPage={setPage} />
        </section>
        <aside className="panel">
          <h3>Palikti atsiliepimą</h3>
          {user ? <ReviewForm base={base} onDone={(msg) => { toast(msg); setPage(1); reload() }} /> : <p><Link to="/login">Prisijunkite</Link>, kad galėtumėte palikti atsiliepimą.</p>}
        </aside>
      </div>

      {specs && (
        <Modal title={`${drone.name} specifikacija`} onClose={() => setSpecs(false)}>
          <table className="spec-table">
            <tbody>
              <tr><th>Gamintojas</th><td>{drone.manufacturer}</td></tr>
              <tr><th>Kaina</th><td>{drone.price} €</td></tr>
              <tr><th>Skrydžio laikas</th><td>{drone.flight_time ?? '–'} min</td></tr>
              <tr><th>Svoris</th><td>{drone.weight ?? '–'} g</td></tr>
              <tr><th>Reikia registracijos (ES)</th><td>{drone.weight >= 250 ? 'Taip, A1/A3 kategorija' : 'Ne, iki 250 g'}</td></tr>
              <tr><th>Vidutinis įvertinimas</th><td>{avg.toFixed(1)} / 5</td></tr>
            </tbody>
          </table>
        </Modal>
      )}
      {edit && (
        <Modal title="Redaguoti atsiliepimą" onClose={() => setEdit(null)}>
          <ReviewForm base={base} review={edit} onDone={(msg) => { setEdit(null); toast(msg); reload() }} />
        </Modal>
      )}
      {del && <ConfirmModal text={`Ištrinti naudotojo ${del.username} atsiliepimą?`} onConfirm={() => remove(del)} onClose={() => setDel(null)} />}
    </>
  )
}

function ReviewForm({ base, review = {}, onDone }) {
  const empty = { rating: 5, comment: '', recommended: true, flown_at: '' }
  const [f, setF] = useState(review.id ? { rating: review.rating, comment: review.comment, recommended: review.recommended, flown_at: review.flown_at || '' } : empty)
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    const body = { ...f, rating: Number(f.rating) }
    if (!body.flown_at) delete body.flown_at
    try {
      await api(review.id ? `${base}/reviews/${review.id}` : `${base}/reviews`, { method: review.id ? 'PUT' : 'POST', body })
      if (!review.id) setF(empty)
      setErr('')
      onDone(review.id ? 'Atsiliepimas atnaujintas' : 'Ačiū! Atsiliepimas paskelbtas')
    } catch (e) { setErr(e.message) }
  }
  return (
    <form className="form" onSubmit={submit}>
      <ErrorBox msg={err} />
      <label><span>Įvertinimas: <b>{f.rating}</b> / 5</span>
        <input type="range" min="1" max="5" value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} />
      </label>
      <label>Kada skraidėte?<input type="date" value={f.flown_at} onChange={(e) => setF({ ...f, flown_at: e.target.value })} /></label>
      <label>Komentaras<textarea required minLength={3} rows={4} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} /></label>
      <label className="check"><input type="checkbox" checked={f.recommended} onChange={(e) => setF({ ...f, recommended: e.target.checked })} /> Rekomenduoju šį droną</label>
      <button className="btn">{review.id ? 'Išsaugoti' : 'Skelbti'}</button>
    </form>
  )
}
