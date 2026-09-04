import { useState } from 'react'
import api from '../../api/client'
import { REQUEST_DESTINATION_LABELS } from '../../utils/labels'

export default function GeneralRequest() {
  const [form, setForm] = useState({
    destination: 'direction',
    title: '',
    motif: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await api.post('/employee-requests/', {
        kind: 'general',
        destination: form.destination,
        title: form.title,
        motif: form.motif,
      })
      setSuccess('Votre demande a été envoyée. Statut : En attente.')
      setForm({ destination: 'direction', title: '', motif: '' })
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
      <h2>Demande</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
        <label>
          Destinataire
          <select
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          >
            {Object.entries(REQUEST_DESTINATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Titre
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre de votre demande..."
            required
          />
        </label>

        <label>
          Objet / Demande
          <textarea
            rows="5"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Décrivez votre demande..."
            required
          />
        </label>

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}