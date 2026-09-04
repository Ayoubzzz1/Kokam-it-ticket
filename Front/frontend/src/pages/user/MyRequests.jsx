import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from '../../utils/labels'
import { ArrowUpRight, ClipboardList, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

export default function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/my-employee-requests/')
      .then((res) => setRequests(res.data))
      .catch(() => setError('Impossible de charger vos demandes.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><ClipboardList className="size-4" /> Suivi personnel</p>
        <h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground">Mes demandes</h2>
        <p className="mt-2 text-sm text-muted-foreground">Consultez l'état de vos demandes RH et administratives.</p>
      </div>

      {error && <div className="alert error mb-5">{error}</div>}

      {loading ? (
        <Card><CardContent className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Chargement...</CardContent></Card>
      ) : (
        <Card className="overflow-hidden border-border/70 p-0 shadow-sm">
          <CardHeader className="border-b bg-muted/20 px-5 py-4"><CardTitle>Historique des demandes</CardTitle><CardDescription>Chaque demande conserve son statut et ses détails.</CardDescription></CardHeader>
          <CardContent className="p-0"><Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Demande</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {requests.length === 0 && (
                <TableRow><TableCell colSpan="5" className="h-24 text-center text-muted-foreground">Aucune demande pour le moment.</TableCell></TableRow>
              )}
              {requests.map((r) => (
                <TableRow key={r.id}><TableCell className="font-medium">{r.display_number}</TableCell><TableCell>{r.kind_label || REQUEST_KIND_LABELS[r.kind] || r.kind}</TableCell><TableCell>
                    {new Date(r.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell><TableCell>
                    <span className={`badge status-${r.status}`}>
                      {REQUEST_STATUS_LABELS[r.status] || r.status_label}
                    </span>
                  </TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" render={<Link to={`/requests/${r.id}`} />}>Détails <ArrowUpRight className="size-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table></CardContent>
        </Card>
      )}
    </div>
  )
}