import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../api/client'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const PRESENCE_OPTIONS = [['present', 'P'], ['absent', 'A'], ['leave', 'C'], ['holiday', 'F']]

function dateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit' })
}

export default function HrAttendance() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/attendance/overview/', { params: { year, month } })
      setData(response.data)
    } catch (requestError) {
      setData(null)
      setError(requestError.response?.status === 401
        ? 'Votre session a expiré. Reconnectez-vous pour consulter les présences.'
        : requestError.response?.status === 405
          ? 'Le serveur refuse GET pour cette route. Redéployez le backend Django.'
          : 'Impossible de charger les présences de l’équipe.')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    const timer = setTimeout(loadOverview, 0)
    return () => clearTimeout(timer)
  }, [loadOverview])

  const years = useMemo(() => {
    const values = []
    for (let value = currentYear - 3; value <= currentYear + 1; value += 1) values.push(value)
    return values
  }, [currentYear])

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data?.rows || []
    return (data?.rows || []).filter((row) => `${row.user_name} ${row.department}`.toLowerCase().includes(query))
  }, [data, search])

  const totals = useMemo(() => (data?.rows || []).reduce((result, row) => ({
    present: result.present + row.present_days,
    absent: result.absent + row.absent_days,
    leave: result.leave + row.leave_days,
    filled: result.filled + row.filled_days,
  }), { present: 0, absent: 0, leave: 0, filled: 0 }), [data])

  async function updateAttendance(row, cell, presence) {
    const key = `${row.user}-${cell.date}`
    setSaving(key)
    setError('')
    try {
      const payload = { user: row.user, date: cell.date, presence, note: cell.note || '' }
      const response = cell.id ? await api.patch(`/attendance/${cell.id}/`, payload) : await api.post('/attendance/', payload)
      setData((current) => current ? ({ ...current, rows: current.rows.map((item) => item.user !== row.user ? item : {
        ...item,
        days: item.days.map((day) => day.date !== cell.date ? day : { ...day, ...response.data }),
        present_days: item.present_days + (presence === 'present' ? 1 : 0) - (cell.presence === 'present' ? 1 : 0),
        absent_days: item.absent_days + (presence === 'absent' ? 1 : 0) - (cell.presence === 'absent' ? 1 : 0),
        leave_days: item.leave_days + (presence === 'leave' ? 1 : 0) - (cell.presence === 'leave' ? 1 : 0),
        filled_days: item.filled_days + (presence ? 1 : 0) - (cell.presence ? 1 : 0),
      }) }) : current)
    } catch {
      setError('Impossible d’enregistrer cette journée.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="attendance-page">
      <div className="page-head">
        <div><p className="eyebrow">Pilotage RH</p><h2>Présences de l’équipe</h2></div>
        <div className="filters attendance-filters">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un collaborateur" aria-label="Rechercher un collaborateur" />
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="Mois">{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Année">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        </div>
      </div>
      {error && <div className="alert error" role="alert"><span>{error}</span><button className="btn btn-secondary" type="button" onClick={loadOverview}>Réessayer</button></div>}
      {loading ? <p className="page-loading">Chargement…</p> : !data ? <p className="empty-message">Les présences ne sont pas disponibles.</p> : <>
        <div className="stats attendance-stats">
          <div className="stat"><span>Présences saisies</span><strong>{totals.present}</strong></div>
          <div className="stat"><span>Absences</span><strong>{totals.absent}</strong></div>
          <div className="stat"><span>Congés</span><strong>{totals.leave}</strong></div>
          <div className="stat"><span>Jours renseignés</span><strong>{totals.filled}</strong></div>
        </div>
        <div className="attendance-guide"><strong>Saisir le statut du jour</strong><span><b className="dot dot-present" /> P Présent</span><span><b className="dot dot-absent" /> A Absent</span><span><b className="dot dot-leave" /> C Congé</span><span><b className="dot dot-holiday" /> F Férié</span><span className="attendance-hint">Les modifications sont enregistrées automatiquement</span></div>
        <div className="attendance-grid-frame"><div className="attendance-grid-scroll"><table className="attendance-grid"><thead><tr><th className="employee-column">Collaborateur</th>{(data.dates || []).map((item) => <th key={item.date} title={item.weekday}><span>{dateLabel(item.date)}</span><small>{item.weekday.slice(0, 3)}</small></th>)}<th>Total P</th><th>Total A</th></tr></thead><tbody>
          {rows.length === 0 && <tr><td colSpan={(data.dates?.length || 0) + 3}>Aucun collaborateur trouvé.</td></tr>}
          {rows.map((row) => <tr key={row.user}><th className="employee-column"><strong>{row.user_name}</strong><small>{row.department}</small></th>{row.days.map((cell) => { const key = `${row.user}-${cell.date}`; return <td className={`attendance-cell presence-${cell.presence || 'empty'}`} key={cell.date}><select aria-label={`${row.user_name}, ${cell.date}`} value={cell.presence} disabled={saving === key} onChange={(event) => updateAttendance(row, cell, event.target.value)}><option value="">—</option>{PRESENCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td> })}<td className="total-cell">{row.present_days}</td><td className="total-cell">{row.absent_days}</td></tr>)}
        </tbody></table></div><p className="attendance-scroll-hint">Faites défiler horizontalement pour consulter tous les jours du mois.</p></div>
      </>}
    </div>
  )
}