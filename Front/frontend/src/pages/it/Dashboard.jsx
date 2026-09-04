import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'
import { formatDate } from '../../utils/labels'

export default function ITDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/it/').then((res) => setData(res.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div>
      <p className="welcome">KOKAM PLUS — IT Espace</p>
      <div className="stats">
        {[
          ['Tickets actifs', data.total],
          ['Nouveaux', data.new],
          ['En cours', data.in_progress],
          ['Urgents', data.urgent],
          ['Terminés', data.resolved],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <h2 className="section-title">Tickets récents reçus</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Demandeur</th>
              <th>Service</th>
              <th>Poste</th>
              <th>Bureau</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {data.recent.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/it/tickets/${t.id}`}>{t.display_number}</Link>
                </td>
                <td>{t.created_by_name}</td>
                <td>{t.created_by_department || '—'}</td>
                <td>{t.created_by_job_position || '—'}</td>
                <td>{t.created_by_office || '—'}</td>
                <td>{t.category_name}</td>
                <td>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </td>
                <td>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
