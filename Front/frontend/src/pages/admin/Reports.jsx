import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function Reports() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/reports/').then((r) => setData(r.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div>
      <h2>Rapports</h2>
      <div className="card">
        <h3>Par statut</h3>
        <ul>
          {data.by_status.map((row) => (
            <li key={row.status}>
              {row.status}: {row.count}
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3>Par catégorie</h3>
        <ul>
          {data.by_category.map((row) => (
            <li key={row.category__name}>
              {row.category__name}: {row.count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
