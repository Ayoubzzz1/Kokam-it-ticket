import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { REQUEST_STATUS_LABELS } from '../../utils/labels'

export default function HrDashboard({ detailBasePath = '/hr/requests' }) {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('pending')
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/employee-requests/', { params: filter ? { status: filter } : {} })
      setRequests(data)
      setError('')
    } catch {
      setError('Impossible de charger les demandes.')
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  async function review(id, status) {
    try {
      await api.patch(`/employee-requests/${id}/`, { status })
      load()
    } catch {
      setError('Impossible de mettre à jour le statut.')
    }
  }

  return (
    <div>
      <div className="page-head">
        <h2>Demandes RH</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Refusées</option>
          <option value="">Toutes</option>
        </select>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employé</th>
              <th>Type</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && <tr><td colSpan="6">Aucune demande.</td></tr>}
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.display_number}</td>
                <td>{request.created_by_name}</td>
                <td>{request.kind_label}</td>
                <td>{new Date(request.created_at).toLocaleDateString('fr-FR')}</td>
                <td><span className={`badge status-${request.status}`}>{REQUEST_STATUS_LABELS[request.status]}</span></td>
                <td>
                  <Link className="btn ghost" to={`${detailBasePath}/${request.id}`}>Détails</Link>
                  {request.status === 'pending' && (
                    <>
                      <button className="btn ghost" type="button" onClick={() => review(request.id, 'approved')}>Approuver</button>
                      <button className="btn ghost" type="button" onClick={() => review(request.id, 'rejected')}>Refuser</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
