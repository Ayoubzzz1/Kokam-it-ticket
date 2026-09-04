import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { PRIORITIES, PRIORITY_LABELS } from '../../utils/labels'

export default function TicketNew() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
  })

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data))
  }, [])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/tickets/', form)
      const file = e.target.attachment.files[0]
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/tickets/${data.id}/attachments/`, fd)
      }
      navigate(`/tickets/${data.id}`, { state: { created: data.display_number } })
    } catch (err) {
      const detail = err.response?.data
      if (detail && typeof detail === 'object') {
        const first = Object.values(detail)[0]
        setError(typeof first === 'string' ? first : "Impossible d'envoyer le ticket.")
      } else {
        setError("Impossible d'envoyer le ticket.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Signaler un problème</h2>
      <p className="muted">La demande est envoyée à l’espace IT. Vous n’avez pas à choisir un technicien.</p>
      {error && <div className="alert error">{error}</div>}

      <label>
        Catégorie
        <select value={form.category} onChange={(e) => setField('category', e.target.value)} required>
          <option value="">Sélectionner</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Service destinataire
        <input value="IT" readOnly />
      </label>

      <label>
        Demandeur
        <input value={user?.full_name || ''} readOnly />
      </label>

      <label>
        Bureau
        <input value={user?.office || '—'} readOnly />
      </label>

      <label>
        Titre
        <input
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          required
          placeholder="Décrivez brièvement le problème"
        />
      </label>

      <label>
        Description
        <textarea
          rows="5"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
          placeholder="Décrivez le problème en détail..."
        />
      </label>

      <label>
        Priorité
        <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Pièce jointe (optionnel)
        <input type="file" name="attachment" />
      </label>

      <button className="btn primary" type="submit" disabled={submitting}>
        {submitting ? 'Envoi…' : 'Envoyer à l’IT'}
      </button>
    </form>
  )
}
