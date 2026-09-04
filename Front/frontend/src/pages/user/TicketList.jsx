import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

export default function TicketList({ status, title = 'Mes demandes', detailPath = '/tickets' }) {
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = {}
    if (status) params.status = status
    if (search) params.search = search
    api.get('/my-requests/', { params }).then((res) => setTickets(res.data))
  }, [search, status])

  const isHistory = status === 'done'

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b">
        <CardTitle>{title}</CardTitle>
        <Input
          className="max-w-xs"
          placeholder="Rechercher un ticket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Technicien</TableHead>
              {isHistory && <TableHead>Durée En cours → Terminé</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 && (
              <TableRow><TableCell colSpan={isHistory ? 6 : 5} className="h-24 text-center text-muted-foreground">Aucun ticket</TableCell></TableRow>
            )}
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Link to={`${detailPath}/${t.id}`}>{t.display_number}</Link> {t.title}
                </TableCell>
                <TableCell>{t.category_name}</TableCell>
                <TableCell>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </TableCell>
                <TableCell>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </TableCell>
                <TableCell>{t.technician_name || '—'}</TableCell>
                {isHistory && <TableCell>{t.resolution_time || t.intervention_duration || '—'}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
