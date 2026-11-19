import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ErrorBox, Stars, Spinner, roleName } from '../components'
import { UserIcon } from '../icons'

// Profilis: GET /api/auth/me - naudotojas, jo atsiliepimai ir statistika
export default function Profile() {
  const { user } = useAuth()
  const [me, setMe] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { if (user) api('/auth/me').then(setMe).catch((e) => setErr(e.message)) }, [user])

  if (!user) return <Navigate to="/login" replace />
  if (err) return <ErrorBox msg={err} />
  if (!me) return <Spinner />

  return (
    <>
      <section className="profile-head">
        <div className="avatar"><UserIcon size={40} /></div>
        <div>
          <h1>{me.username}</h1>
          <span className="badge">{roleName(me.role)}</span>
        </div>
        <div className="stats compact">
          <div className="stat"><b>{me.stats.review_count}</b><span>atsiliepimai</span></div>
          <div className="stat"><b>{me.stats.avg_rating ?? '–'}</b><span>vid. įvertinimas</span></div>
        </div>
      </section>

      <h2>Mano atsiliepimai</h2>
      {me.reviews.map((r) => (
        <article key={r.id} className="review">
          <div className="row-between">
            <Link to={`/categories/${r.category_id}/drones/${r.drone_id}`}><b>{r.drone_name}</b></Link>
            <Stars value={r.rating} />
          </div>
          <p>{r.comment}</p>
          <small className="muted">{r.category_name}{r.flown_at ? ` · skraidyta ${r.flown_at}` : ''}</small>
        </article>
      ))}
      {!me.reviews.length && <p className="muted">Dar neparašėte nė vieno atsiliepimo. <Link to="/">Peržiūrėkite katalogą</Link>.</p>}
    </>
  )
}
