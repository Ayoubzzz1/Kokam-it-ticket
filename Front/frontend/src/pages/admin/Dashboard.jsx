import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/admin/').then((r) => setData(r.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div>
      <p className="welcome">KOKAM PLUS — Administration</p>
      <div className="stats">
        <div className="stat">
          <span>Total users</span>
          <strong>{data.total_users}</strong>
        </div>
        <div className="stat">
          <span>IT technicians</span>
          <strong>{data.technicians}</strong>
        </div>
        <div className="stat">
          <span>Open tickets</span>
          <strong>{data.open_tickets}</strong>
        </div>
        <div className="stat">
          <span>Urgent tickets</span>
          <strong>{data.urgent_tickets}</strong>
        </div>
        <div className="stat">
          <span>Resolved this month</span>
          <strong>{data.resolved_this_month}</strong>
        </div>
      </div>
    </div>
  )
}
