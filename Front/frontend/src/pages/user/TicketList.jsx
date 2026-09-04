import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'

export default function TicketList({ status, title = 'Mes demandes', detailPath = '/tickets' }) {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = {}
    if (status) params.status = status
    if (search) params.search = search
    api.get('/my-requests/', { params }).then((res) => setTickets(res.data))
  }, [search, status])

  const isHistory = status === 'done'

  return (
    <div>
      <div className="page-head">
        <h2>{title}</h2>
        <input
          placeholder="Rechercher un ticket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Technicien</th>
              {isHistory && <th>Durée En cours → Terminé</th>}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td colSpan={isHistory ? '6' : '5'}>Aucun ticket</td>
              </tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`${detailPath}/${t.id}`}>{t.display_number}</Link> {t.title}
                </td>
                <td>{t.category_name}</td>
                <td>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </td>
                <td>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </td>
                <td>{t.technician_name || '—'}</td>
                {isHistory && <td>{t.resolution_time || t.intervention_duration || '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
