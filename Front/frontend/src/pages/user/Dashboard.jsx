import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ArrowUpRight, CircleCheck, Clock3, FilePlus2, FolderOpen } from 'lucide-react'

export default function UserDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/user/').then((res) => setData(res.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div className="dashboard-page mx-auto w-full max-w-6xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-primary">Espace employé</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground">Votre activité</h2>
          <p className="mt-2 text-sm text-muted-foreground">Suivez vos demandes et obtenez rapidement de l'aide.</p>
        </div>
        <Button className="!bg-[#1769e0] !text-white hover:!bg-[#0d58c7] [&_svg]:text-white" render={<Link to="/tickets/new" />}><FilePlus2 className="size-4" /> Signaler un problème</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="dashboard-stat border-border/70"><CardContent className="flex items-center justify-between p-5">
          <div><span className="block text-sm text-muted-foreground">Demandes ouvertes</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{data.open}</strong></div>
          <span className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FolderOpen className="size-5" /></span>
        </CardContent></Card>
        <Card className="dashboard-stat border-border/70"><CardContent className="flex items-center justify-between p-5">
          <div><span className="block text-sm text-muted-foreground">En cours</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{data.in_progress}</strong></div>
          <span className="flex size-10 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Clock3 className="size-5" /></span>
        </CardContent></Card>
        <Card className="dashboard-stat border-border/70"><CardContent className="flex items-center justify-between p-5">
          <div><span className="block text-sm text-muted-foreground">Terminées</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{data.closed}</strong></div>
          <span className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CircleCheck className="size-5" /></span>
        </CardContent></Card>
      </div>
      <Card className="overflow-hidden border-border/70 p-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-5 py-4">
          <div><CardTitle>Demandes récentes</CardTitle><p className="mt-1 text-sm text-muted-foreground">Les dernières demandes envoyées à l'équipe.</p></div>
          <Button variant="ghost" size="sm" render={<Link to="/tickets" />}>Voir tout <ArrowUpRight className="size-4" /></Button>
        </CardHeader>
        <CardContent className="p-0"><Table>
          <TableHeader><TableRow>
            <TableHead>Ticket</TableHead><TableHead>Catégorie</TableHead><TableHead>Statut</TableHead><TableHead>Priorité</TableHead>
          </TableRow></TableHeader><TableBody>
            {data.recent.length === 0 && (
              <TableRow><TableCell colSpan="4" className="h-24 text-center text-muted-foreground">Aucun ticket pour le moment.</TableCell></TableRow>
            )}
            {data.recent.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link to={`/tickets/${t.id}`}>{t.display_number}</Link> {t.title}
                </TableCell><TableCell>{t.category_name}</TableCell><TableCell>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </TableCell><TableCell>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody></Table></CardContent>
      </Card>
    </div>
  )
}
