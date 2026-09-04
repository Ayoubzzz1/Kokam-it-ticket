import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { PRIORITIES, PRIORITY_LABELS } from '../../utils/labels'
import { ArrowLeft, LifeBuoy, Paperclip, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'

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
    <div className="mx-auto w-full max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" type="button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="size-4" /> Retour au tableau de bord
      </Button>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-br from-blue-50 to-white px-6 py-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><LifeBuoy className="size-5" /></span>
            <div><CardTitle className="text-2xl">Signaler un problème</CardTitle><CardDescription className="mt-1">Décrivez votre besoin. L'équipe IT recevra votre demande immédiatement.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form className="grid gap-5" onSubmit={onSubmit}>
          {error && <div className="alert error" role="alert">{error}</div>}

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Catégorie <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setField('category', e.target.value)} required>
          <option value="">Sélectionner</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
      <label className="grid gap-2 text-sm font-medium text-foreground">Service destinataire<Input value="IT" readOnly /></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">Demandeur<Input value={user?.full_name || ''} readOnly /></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">Bureau<Input value={user?.office || '—'} readOnly /></label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Titre
        <Input
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          required
          placeholder="Décrivez brièvement le problème"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Description
        <Textarea
          rows="5"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          required
          placeholder="Décrivez le problème en détail..."
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        Priorité
        <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm font-medium text-foreground">
        <span className="flex items-center gap-2"><Paperclip className="size-4 text-muted-foreground" /> Pièce jointe <span className="font-normal text-muted-foreground">(optionnel)</span></span>
        <Input type="file" name="attachment" />
      </label>

      <div className="flex justify-end border-t border-border pt-5">
        <Button className="bg-[#1769e0] text-white hover:bg-[#0d58c7]" type="submit" disabled={submitting}>
          <Send className="size-4" /> {submitting ? 'Envoi...' : 'Envoyer à l’IT'}
        </Button>
      </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
