import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatDate } from '../utils/labels'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeForRole } from '../utils/labels'

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  function notificationLink(n) {
    if (n.related_request) {
      if (user.role === 'hr') return `/hr/requests/${n.related_request}`
      if (user.role === 'superadmin') return `/admin/requests/${n.related_request}`
      return `/requests/${n.related_request}`
    }
    if (!n.related_ticket) return homeForRole(user.role)
    if (user.role === 'technician') return `/it/tickets/${n.related_ticket}`
    if (user.role === 'superadmin') return `/admin/tickets/${n.related_ticket}`
    return `/tickets/${n.related_ticket}`
  }

  async function load() {
    const { data } = await api.get('/notifications/')
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function markAll() {
    await api.post('/notifications/read_all/')
    load()
  }

  return (
    <div>
      <div className="page-head">
        <h2>Notifications</h2>
        <button className="btn ghost" type="button" onClick={markAll}>
          Tout marquer comme lu
        </button>
      </div>
      <ul className="notif-list">
        {items.map((n) => (
          <li key={n.id} className={n.is_read ? '' : 'unread'}>
            <Link to={notificationLink(n)} onClick={() => api.post(`/notifications/${n.id}/read/`)}>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              <small>{formatDate(n.created_at)}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
