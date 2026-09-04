import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'

export default function UserDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/user/').then((res) => setData(res.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div>
      <p className="welcome">Bienvenue dans votre espace utilisateur.</p>
      <div className="stats">
        <div className="stat">
          <span>Demandes ouvertes</span>
          <strong>{data.open}</strong>
        </div>
        <div className="stat">
          <span>En cours</span>
          <strong>{data.in_progress}</strong>
        </div>
        <div className="stat">
          <span>Terminées</span>
          <strong>{data.closed}</strong>
        </div>
      </div>
      <Link className="btn primary" to="/tickets/new">
        + Signaler un problème
      </Link>
      <h2 className="section-title">Mes demandes récentes</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Priorité</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.length === 0 && (
              <tr>
                <td colSpan="4">Aucun ticket pour le moment.</td>
              </tr>
            )}
            {data.recent.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/tickets/${t.id}`}>{t.display_number}</Link> {t.title}
                </td>
                <td>{t.category_name}</td>
                <td>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </td>
                <td>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
