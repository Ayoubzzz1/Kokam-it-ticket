import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import { PRESENCE_LABELS } from '../../utils/labels'
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, Palmtree, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Absence() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const loadCalendar = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/attendance/calendar/', { params: { year, month } })
      setData(response.data)
    } catch (requestError) {
      setData(null)
      setError(requestError.response?.status === 401
        ? 'Votre session a expiré. Reconnectez-vous pour consulter vos absences.'
        : 'Impossible de charger votre calendrier d’absence.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    const timer = setTimeout(loadCalendar, 0)
    return () => clearTimeout(timer)
  }, [loadCalendar])

  const years = useMemo(() => {
    const values = []
    for (let value = currentYear - 3; value <= currentYear + 1; value += 1) values.push(value)
    return values
  }, [currentYear])

  const summary = useMemo(() => (data?.days || []).reduce((result, day) => {
    if (day.presence === 'present') result.present += 1
    if (day.presence === 'absent') result.absent += 1
    if (day.presence === 'leave') result.leave += 1
    return result
  }, { present: 0, absent: 0, leave: 0 }), [data])

  const pageSize = 10
  const totalDays = data?.days?.length || 0
  const totalPages = Math.max(1, Math.ceil(totalDays / pageSize))
  const visibleDays = useMemo(() => {
    const start = (page - 1) * pageSize
    return (data?.days || []).slice(start, start + pageSize)
  }, [data, page])

  function changePeriod(setter, value) {
    setPage(1)
    setter(value)
  }

  return (
    <div className="attendance-page mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><CalendarDays className="size-4" /> Suivi personnel</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-foreground">Mon absence</h2>
          <p className="mt-2 text-sm text-muted-foreground">Consultez votre présence et vos absences mois par mois.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-sm">
          <select value={month} onChange={(event) => changePeriod(setMonth, Number(event.target.value))} aria-label="Mois">
            {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
          </select>
          <select value={year} onChange={(event) => changePeriod(setYear, Number(event.target.value))} aria-label="Année">
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          <span>{error}</span>
          <Button variant="outline" size="sm" type="button" onClick={loadCalendar}><RotateCcw className="size-4" /> Réessayer</Button>
        </div>
      )}

      {loading ? <Card><CardContent className="flex items-center justify-center p-12 text-sm text-muted-foreground">Chargement...</CardContent></Card> : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="attendance-kpi border-border/70"><CardContent className="flex items-center justify-between p-5"><div><span className="block text-sm text-muted-foreground">Présent</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{summary.present}</strong></div><CheckCircle2 className="size-6 text-emerald-600" /></CardContent></Card>
            <Card className="attendance-kpi border-border/70"><CardContent className="flex items-center justify-between p-5"><div><span className="block text-sm text-muted-foreground">Absent</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{summary.absent}</strong></div><CircleAlert className="size-6 text-rose-500" /></CardContent></Card>
            <Card className="attendance-kpi border-border/70"><CardContent className="flex items-center justify-between p-5"><div><span className="block text-sm text-muted-foreground">Congé</span><strong className="mt-2 block text-3xl font-semibold text-foreground">{summary.leave}</strong></div><Palmtree className="size-6 text-amber-500" /></CardContent></Card>
          </div>
          <Card className="overflow-hidden border-border/70 p-0 shadow-sm"><CardHeader className="border-b bg-muted/20 px-5 py-4"><CardTitle>Calendrier de présence</CardTitle><CardDescription>Les jours sont affichés par groupes de dix.</CardDescription></CardHeader><CardContent className="p-0"><Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Jour</TableHead><TableHead>Statut</TableHead><TableHead>Note RH</TableHead></TableRow></TableHeader><TableBody>
                {visibleDays.map((day) => (
                  <TableRow key={day.date}><TableCell className="font-medium">{new Date(`${day.date}T00:00:00`).toLocaleDateString('fr-FR')}</TableCell><TableCell>{day.weekday}</TableCell><TableCell>{day.presence ? <span className={`badge presence-${day.presence}`}>{PRESENCE_LABELS[day.presence] || day.presence_label}</span> : <span className="muted">Non renseigné</span>}</TableCell><TableCell>{day.note || '—'}</TableCell></TableRow>
                ))}
                {data && data.days?.length === 0 && <TableRow><TableCell colSpan="4" className="h-24 text-center text-muted-foreground">Aucune donnée pour cette période.</TableCell></TableRow>}
              </TableBody></Table></CardContent></Card>
          {totalDays > pageSize && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="m-0 text-sm text-muted-foreground">
                Jours {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalDays)} sur {totalDays}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Jours précédents">
                  <ChevronLeft className="size-4" /> Précédents
                </Button>
                <span className="min-w-16 text-center text-sm font-medium text-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} aria-label="Jours suivants">
                  Suivants <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
