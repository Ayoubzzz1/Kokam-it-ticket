import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { LEAVE_TYPE_LABELS } from '../../utils/labels'

export default function LeaveRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    motif: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function computeDays() {
    if (!form.start_date || !form.end_date) return 0
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    if (end < start) return 0
    let days = 0
    const d = new Date(start)
    while (d <= end) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) days++
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  const days = computeDays()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await api.post('/employee-requests/', {
        kind: 'leave',
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        motif: form.motif,
      })
      setSuccess('Votre demande de congé a été envoyée. Statut : En attente.')
      setForm({ leave_type: 'annual', start_date: '', end_date: '', motif: '' })
    } catch (err) {
      const data = err.response?.data
      setError(
        typeof data === 'string'
          ? data
          : data
            ? Object.values(data).flat().join(' ')
            : 'Envoi impossible.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card form">
      <h2>Demande de congé</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
        <label>
          Type de congé
          <select
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          >
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date de début
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
        </label>

        <label>
          Date de fin
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            required
          />
        </label>

        <p className="muted">
          Nombre de jours : <strong>{days} jour{days > 1 ? 's' : ''}</strong>
        </p>

        <label>
          Motif
          <textarea
            rows="4"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Motif de votre demande..."
          />
        </label>

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Envoi en cours…' : 'Envoyer la demande'}
        </button>
      </form>
    </div>
  )
}