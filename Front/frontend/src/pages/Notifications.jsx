import { useEffect, useState } from 'react'
import api from '../api/client'
import { formatDate } from '../utils/labels'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { homeForRole } from '../utils/labels'
import { Bell, CheckCheck, ChevronRight, Inbox, Loader2 } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    try {
      setError('')
      const { data } = await api.get('/notifications/')
      setItems(data)
    } catch {
      setError('Impossible de charger vos notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function markAll() {
    await api.post('/notifications/read_all/')
    setItems((current) => current.map((item) => ({ ...item, is_read: true })))
  }

  async function markRead(id) {
    await api.post(`/notifications/${id}/read/`)
    setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item))
  }

  const unreadCount = items.filter((item) => !item.is_read).length

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><Bell className="size-4" /> Centre de suivi</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground">Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">Retrouvez les dernières mises à jour de vos demandes et tickets.</p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={markAll} disabled={!unreadCount}>
          <CheckCheck className="size-4" /> Tout marquer comme lu
        </Button>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2"><Inbox className="size-5 text-primary" /> Votre activité</CardTitle>
              <CardDescription className="mt-1">Les notifications non lues apparaissent en priorité.</CardDescription>
            </div>
            {!!unreadCount && <Badge variant="secondary">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Chargement...</div>}
          {!loading && error && <div className="p-12 text-center text-sm text-destructive">{error}</div>}
          {!loading && !error && items.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Aucune notification pour le moment.</div>}
          {!loading && !error && items.length > 0 && (
            <ul className="divide-y divide-border">
              {items.map((n) => (
                <li key={n.id} className={n.is_read ? 'bg-card' : 'bg-primary/[0.035]'}>
                  <Link
                    to={notificationLink(n)}
                    onClick={() => markRead(n.id)}
                    className="group flex items-start gap-4 px-5 py-4 no-underline transition-colors hover:bg-muted/50"
                  >
                    <span className={`mt-1 flex size-9 shrink-0 items-center justify-center rounded-full ${n.is_read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      <Bell className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 font-medium text-foreground">{n.title}{!n.is_read && <span className="size-2 rounded-full bg-primary" />}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted-foreground">{n.message}</span>
                      <span className="mt-2 block text-xs text-muted-foreground/80">{formatDate(n.created_at)}</span>
                    </span>
                    <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
