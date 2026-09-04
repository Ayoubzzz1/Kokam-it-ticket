import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, PRIORITIES, STATUS_LABELS, STATUSES } from '../../utils/labels'

export default function ITTickets({
  apiEndpoint = '/it-tickets/',
  history = false,
  detailPath = '/it/tickets',
}) {
  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
  })

  const isHistory = history
  const pageTitle = isHistory ? 'Historique' : 'Tickets'

  useEffect(() => {
    api.get('/categories/').then((r) => setCategories(r.data))
  }, [])

  useEffect(() => {
    const queryFilters = {}
    if (isHistory) queryFilters.status = 'done'
    if (filters.search) queryFilters.search = filters.search
    if (!isHistory && filters.status) queryFilters.status = filters.status
    if (filters.category) queryFilters.category = filters.category
    if (filters.priority) queryFilters.priority = filters.priority
    api.get(apiEndpoint, { params: queryFilters }).then((r) => setTickets(r.data))
  }, [filters, apiEndpoint, isHistory])

  function set(key, value) {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  return (
    <div>
      <div className="page-head">
        <h2>{pageTitle}</h2>
        <input placeholder="Chercher un ticket..." value={filters.search} onChange={(e) => set('search', e.target.value)} />
      </div>
      {!isHistory && (
        <div className="filters">
          <select value={filters.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">Statut</option>
            {STATUSES.filter((s) => s !== 'done' && s !== 'resolved').map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select value={filters.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">Catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
            <option value="">Priorité</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Demandeur</th>
              <th>Service</th>
              <th>Bureau</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
              {isHistory && <th>Durée En cours → Terminé</th>}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr>
                <td colSpan={isHistory ? '8' : '7'}>Aucun ticket</td>
              </tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`${detailPath}/${t.id}`}>{t.display_number}</Link> {t.title}
                </td>
                <td>{t.created_by_name}</td>
                <td>{t.created_by_department || '—'}</td>
                <td>{t.created_by_office || t.bureau || '—'}</td>
                <td>{t.category_name}</td>
                <td>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </td>
                <td>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </td>
                {isHistory && <td>{t.resolution_time || t.intervention_duration || '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
