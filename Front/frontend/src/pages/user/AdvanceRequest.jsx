import { useState } from 'react'
import api from '../../api/client'

export default function AdvanceRequest() {
  const [form, setForm] = useState({
    amount: '',
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
        kind: 'advance',
        amount: Number(form.amount),
        motif: form.motif,
      })
      setSuccess('Votre demande d\'avance a été envoyée. Statut : En attente.')
      setForm({ amount: '', motif: '' })
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

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="card form">
      <h2>Demande d'avance</h2>
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
        <label>
          Montant demandé
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="500"
              required
              style={{ flex: 1 }}
            />
            <span className="muted">TND</span>
          </div>
        </label>

        <label>
          Motif
          <textarea
            rows="4"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Motif de votre demande..."
          />
        </label>

        <p className="muted">
          Date de la demande : <strong>{today}</strong>
        </p>

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Envoi en cours…' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}