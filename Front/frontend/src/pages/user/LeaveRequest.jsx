import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { LEAVE_TYPE_LABELS } from '../../utils/labels'
import { ArrowLeft, CalendarDays, Send, Umbrella } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'

export default function LeaveRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    motif: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function computeDays() {
    if (!form.start_date || !form.end_date) return 0
    const start = new Date(form.start_date)
    const end = new Date(form.end_date)
    if (end < start) return 0
    let days = 0
    const d = new Date(start)
    while (d <= end) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) days++
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  const days = computeDays()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await api.post('/employee-requests/', {
        kind: 'leave',
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        motif: form.motif,
      })
      setSuccess('Votre demande de congé a été envoyée. Statut : En attente.')
      setForm({ leave_type: 'annual', start_date: '', end_date: '', motif: '' })
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
    <div className="mx-auto w-full max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" type="button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="size-4" /> Retour au tableau de bord
      </Button>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-br from-blue-50 to-white px-6 py-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><Umbrella className="size-5" /></span>
            <div><CardTitle className="text-2xl">Demande de congé</CardTitle><CardDescription className="mt-1">Choisissez vos dates et indiquez le motif de votre absence.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {success && <div className="alert success mb-5">{success}</div>}
          {error && <div className="alert error mb-5">{error}</div>}

      <form onSubmit={onSubmit} className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Type de congé
          <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
          >
            {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /> Date de début</span>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          <span className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /> Date de fin</span>
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            required
          />
        </label>
        </div>

        <p className="m-0 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Durée calculée : <strong>{days} jour{days > 1 ? 's' : ''}</strong> ouvré{days > 1 ? 's' : ''}
        </p>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Motif
          <Textarea
            rows="4"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Motif de votre demande..."
          />
        </label>

        <div className="flex justify-end border-t border-border pt-5">
          <Button className="!bg-[#1769e0] !text-white hover:!bg-[#0d58c7]" type="submit" disabled={busy}>
            <Send className="size-4" /> {busy ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  )
}