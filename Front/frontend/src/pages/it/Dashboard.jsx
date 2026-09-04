import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../../utils/labels'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

export default function ITDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard/it/').then((res) => setData(res.data))
  }, [])

  if (!data) return <p>Chargement…</p>

  return (
    <div>
      <p className="welcome">KOKAM PLUS — IT Espace</p>
      <div className="stats">
        {[
          ['Tickets actifs', data.total],
          ['Nouveaux', data.new],
          ['En cours', data.in_progress],
          ['Urgents', data.urgent],
          ['Terminés', data.resolved],
        ].map(([label, value]) => (
          <Card className="stat" key={label}><CardContent className="p-0">
            <span>{label}</span>
            <strong>{value}</strong>
          </CardContent></Card>
        ))}
      </div>
      <h2 className="section-title">Tickets récents reçus</h2>
      <Card className="p-0"><CardHeader className="border-b"><CardTitle>Tickets récents reçus</CardTitle></CardHeader><CardContent className="p-0"><Table>
          <TableHeader><TableRow>
              <th>Ticket</th>
              <th>Demandeur</th>
              <th>Service</th>
              <th>Poste</th>
              <th>Bureau</th>
              <th>Catégorie</th>
              <th>Priorité</th>
              <th>Statut</th>
            </TableRow></TableHeader><TableBody>
            {data.recent.map((t) => (
              <TableRow key={t.id}><TableCell>
                  <Link to={`/it/tickets/${t.id}`}>{t.display_number}</Link>
                </TableCell><TableCell>{t.created_by_name}</TableCell><TableCell>{t.created_by_department || '—'}</TableCell><TableCell>{t.created_by_job_position || '—'}</TableCell><TableCell>{t.created_by_office || '—'}</TableCell><TableCell>{t.category_name}</TableCell><TableCell>
                  <span className={`badge prio-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </TableCell><TableCell>
                  <span className={`badge status-${t.status}`}>{STATUS_LABELS[t.status]}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody></Table></CardContent></Card>
    </div>
  )
}
