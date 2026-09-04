import { useEffect, useState } from 'react'
import api from '../../api/client'
import { ROLE_LABELS } from '../../utils/labels'

export default function AdminUsers({ roleFilter = '' }) {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const emptyForm = {
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    role: roleFilter || 'user',
    department: '',
    office_number: '',
    job_position: '',
    is_active: true,
  }
  const [form, setForm] = useState(emptyForm)

  async function load() {
    const { data } = await api.get('/admin/users/', {
      params: { search, role: roleFilter || undefined },
    })
    setUsers(data)
  }

  useEffect(() => {
    api.get('/departments/').then((r) => setDepartments(r.data))
  }, [])

  useEffect(() => {
    load()
  }, [search, roleFilter])

  function startEdit(u) {
    setEditing(u.id)
    setForm({
      last_name: u.last_name || '',
      first_name: u.first_name || '',
      email: u.email,
      password: '',
      role: u.role,
      department: u.department || '',
      office_number: u.office_number || '',
      job_position: u.job_position || '',
      is_active: u.is_active,
    })
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (payload.office_number) payload.office_number = Number(payload.office_number)
      if (editing) await api.patch(`/admin/users/${editing}/`, payload)
      else await api.post('/admin/users/', payload)
      setEditing(null)
      setForm({ ...emptyForm, role: roleFilter || 'user' })
      load()
    } catch (err) {
      const data = err.response?.data
      setError(
        typeof data === 'string'
          ? data
          : data
            ? Object.entries(data).map(([field, messages]) => `${field}: ${[].concat(messages).join(' ')}`).join(' ')
            : "Impossible d'enregistrer cet utilisateur."
      )
    }
  }

  return (
    <div className="split">
      <div>
        <div className="page-head">
          <h2>{roleFilter === 'technician' ? 'Techniciens' : 'Utilisateurs'}</h2>
          <input placeholder="Rechercher" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Service</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.last_name}</td>
                  <td>{u.first_name}</td>
                  <td>{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>{u.department_name || '—'}</td>
                  <td>
                    <button className="btn ghost" type="button" onClick={() => startEdit(u)}>
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form className="card form" onSubmit={save}>
        <h3>{editing ? 'Modifier' : 'Créer'}</h3>
        {error && <div className="alert error" role="alert">{error}</div>}
        <label>
          Nom
          <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
        </label>
        <label>
          Prénom
          <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Mot de passe {editing ? '(vide = inchangé)' : ''}
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
        </label>
        <label>
          Rôle
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">Utilisateur</option>
            <option value="technician">Technicien IT</option>
            <option value="hr">RH</option>
            <option value="superadmin">SuperAdmin</option>
          </select>
        </label>
        <label>
          Service
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Poste
          <input value={form.job_position} onChange={(e) => setForm({ ...form, job_position: e.target.value })} />
        </label>
        <label>
          N° bureau
          <input
            type="number"
            min="1"
            value={form.office_number}
            onChange={(e) => setForm({ ...form, office_number: e.target.value })}
            required
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Compte actif
        </label>
        <button className="btn primary" type="submit">
          Enregistrer
        </button>
      </form>
    </div>
  )
}
