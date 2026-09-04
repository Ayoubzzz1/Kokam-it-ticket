import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { ArrowLeft, Banknote, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'

export default function AdvanceRequest() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    motif: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await api.post('/employee-requests/', {
        kind: 'advance',
        amount: Number(form.amount),
        motif: form.motif,
      })
      setSuccess('Votre demande d\'avance a été envoyée. Statut : En attente.')
      setForm({ amount: '', motif: '' })
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

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" type="button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="size-4" /> Retour au tableau de bord
      </Button>
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-gradient-to-br from-blue-50 to-white px-6 py-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><Banknote className="size-5" /></span>
            <div><CardTitle className="text-2xl">Demande d'avance</CardTitle><CardDescription className="mt-1">Transmettez votre demande financière à l'administration.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {success && <div className="alert success mb-5">{success}</div>}
          {error && <div className="alert error mb-5">{error}</div>}

      <form onSubmit={onSubmit} className="grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Montant demandé
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="500"
              required
            />
            <span className="rounded-md bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">TND</span>
          </div>
        </label>

        <label className="grid gap-2 text-sm font-medium text-foreground">
          Motif
          <Textarea
            rows="4"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            placeholder="Motif de votre demande..."
          />
        </label>

        <p className="m-0 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Date de la demande : <strong>{today}</strong>
        </p>

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