import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from '../../utils/labels'

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/my-employee-requests/')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Impossible de charger vos demandes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-head">
        <h2>Mes demandes</h2>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p className="page-loading">Chargement…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Demande</th>
                <th>Date</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan="5">Aucune demande pour le moment.</td>
                </tr>
              )}
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{r.display_number}</td>
                  <td>{r.kind_label}</td>
                  <td>
                    {new Date(r.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <span className={`badge status-${r.status}`}>
                      {REQUEST_STATUS_LABELS[r.status] || r.status_label}
                    </span>
                  </td>
                  <td>
                    <Link className="btn ghost" to={`/requests/${r.id}`}>
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}