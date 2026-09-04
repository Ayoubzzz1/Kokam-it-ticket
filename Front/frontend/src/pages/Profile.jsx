import { useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { parseBureauNumber } from '../utils/service'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [officeNumber, setOfficeNumber] = useState(parseBureauNumber(user.office) || user.office_number || '')
  const [form, setForm] = useState({
    last_name: user.last_name || '',
    first_name: user.first_name || '',
  })
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.patch('/me/', {
        ...form,
        office_number: Number(officeNumber),
      })
      setUser(data)
      setOk('Profil mis à jour.')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Mise à jour impossible.')
    }
  }

  const service = user.department_name || ''

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Mon profil</h2>
      {ok && <div className="alert success">{ok}</div>}
      {error && <div className="alert error">{error}</div>}
      <label>
        Nom
        <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
      </label>
      <label>
        Prénom
        <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
      </label>
      <label>
        Service
        <input value={service} readOnly />
      </label>
      <label>
        Poste
        <input value={user.job_position || service} readOnly />
      </label>
      <label>
        Bureau
        <div className="bureau-row">
          <span className="bureau-prefix">{service ? `${service}-bureau` : 'service-bureau'}</span>
          <input
            type="number"
            min="1"
            value={officeNumber}
            onChange={(e) => setOfficeNumber(e.target.value)}
            required
          />
        </div>
      </label>
      <p className="muted">Email: {user.email}</p>
      <button className="btn primary" type="submit">
        Enregistrer
      </button>
    </form>
  )
}
