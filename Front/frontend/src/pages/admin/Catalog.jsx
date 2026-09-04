import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Catalog({ type }) {
  const endpoint = type === 'departments' ? '/departments/' : '/categories/'
  const [items, setItems] = useState([])
  const [name, setName] = useState('')

  async function load() {
    const { data } = await api.get(endpoint)
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [type])

  async function add(e) {
    e.preventDefault()
    await api.post(endpoint, { name })
    setName('')
    load()
  }

  async function toggle(item) {
    await api.patch(`${endpoint}${item.id}/`, { is_active: !item.is_active })
    load()
  }

  return (
    <div>
      <h2>{type === 'departments' ? 'Services' : 'Catégories'}</h2>
      <form className="inline-form" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" required />
        <button className="btn primary" type="submit">
          Ajouter
        </button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Actif</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.is_active ? 'Oui' : 'Non'}</td>
                <td>
                  <button className="btn ghost" type="button" onClick={() => toggle(item)}>
                    {item.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
