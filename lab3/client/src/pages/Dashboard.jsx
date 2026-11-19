import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ErrorBox, Stars, Spinner } from '../components'
import { GridIcon, DroneIcon, StarIcon, UserIcon } from '../icons'

// Panelė: vienas GET /api/dashboard atsakymas, sudarytas iš kategorijų, dronų, atsiliepimų ir naudotojų
export default function Dashboard() {
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { api('/dashboard').then(setD).catch((e) => setErr(e.message)) }, [])

  if (err) return <ErrorBox msg={err} />
  if (!d) return <Spinner />
  const t = d.totals
  const maxCount = Math.max(1, ...d.categories.map((c) => c.drone_count))

  return (
    <>
      <h1>Statistika</h1>
      <p className="muted">Katalogo apžvalga vienoje vietoje.</p>

      <div className="stats">
        <div className="stat"><GridIcon size={26} /><b>{t.categories}</b><span>kategorijos</span></div>
        <div className="stat"><DroneIcon size={26} /><b>{t.drones}</b><span>dronai</span></div>
        <div className="stat"><StarIcon size={26} /><b>{t.reviews}</b><span>atsiliepimai · vid. {t.avg_rating ?? '–'}</span></div>
        <div className="stat"><UserIcon size={26} /><b>{t.users}</b><span>naudotojai</span></div>
      </div>

      <div className="two-col">
        <section>
          <h2>Geriausiai įvertinti dronai</h2>
          <ol className="top-list">
            {d.topDrones.map((x) => (
              <li key={x.id}>
                <img src={x.image_url} alt="" />
                <div>
                  <Link to={`/categories/${x.category_id}/drones/${x.id}`}><b>{x.name}</b></Link>
                  <small className="muted"> · {x.manufacturer} · {x.category_name}</small>
                  <div><Stars value={x.avg_rating} /> {x.avg_rating} ({x.review_count})</div>
                </div>
                <strong className="price">{x.price} €</strong>
              </li>
            ))}
          </ol>

          <h2>Naujausi atsiliepimai</h2>
          {d.latestReviews.map((r) => (
            <article key={r.id} className="review">
              <div className="row-between">
                <strong><UserIcon size={16} /> {r.username}</strong>
                <Stars value={r.rating} />
              </div>
              <p>{r.comment}</p>
              <small className="muted"><Link to={`/categories/${r.category_id}/drones/${r.drone_id}`}>{r.drone_name}</Link> · {r.category_name}</small>
            </article>
          ))}
        </section>

        <aside className="panel">
          <h3>Dronai pagal kategoriją</h3>
          {d.categories.map((c) => (
            <div key={c.id} className="bar-row">
              <div className="row-between"><Link to={`/categories/${c.id}`}>{c.name}</Link><b>{c.drone_count}</b></div>
              <div className="bar"><span style={{ width: `${(c.drone_count / maxCount) * 100}%` }} /></div>
              <small className="muted">{c.drone_count ? `${c.min_price}–${c.max_price} €, vid. ${c.avg_price} €` : 'dronų nėra'}</small>
            </div>
          ))}
        </aside>
      </div>
    </>
  )
}
