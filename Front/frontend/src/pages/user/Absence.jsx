import { useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { PRESENCE_LABELS } from '../../utils/labels'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const PRESENCE_OPTIONS = [['present', 'P'], ['absent', 'A'], ['leave', 'C'], ['holiday', 'F']]

function dateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit' })
}

export default function Absence() {
  const { user } = useAuth()
  const now = new Date()
  const isHr = user?.role === 'hr' || user?.role === 'superadmin'
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const endpoint = isHr ? '/attendance/overview/' : '/attendance/calendar/'
    api.get(endpoint, { params: { year, month } })
      .then((res) => setData(res.data))
      .catch(() => setError('Impossible de charger les présences.'))
      .finally(() => setLoading(false))
  }, [isHr, year, month])

  const years = []
  for (let current = now.getFullYear() - 3; current <= now.getFullYear() + 1; current += 1) years.push(current)
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data?.rows || []
    return (data?.rows || []).filter((row) => `${row.user_name} ${row.department}`.toLowerCase().includes(query))
  }, [data, search])
  const totals = useMemo(() => (data?.rows || []).reduce((result, row) => ({
    present: result.present + row.present_days, absent: result.absent + row.absent_days,
    leave: result.leave + row.leave_days, filled: result.filled + row.filled_days,
  }), { present: 0, absent: 0, leave: 0, filled: 0 }), [data])

  async function updateAttendance(row, cell, presence) {
    const key = `${row.user}-${cell.date}`
    setSaving(key)
    setError('')
    try {
      const payload = { user: row.user, date: cell.date, presence, note: cell.note || '' }
      const response = cell.id ? await api.patch(`/attendance/${cell.id}/`, payload) : await api.post('/attendance/', payload)
      setData((current) => ({ ...current, rows: current.rows.map((item) => item.user !== row.user ? item : {
        ...item,
        days: item.days.map((day) => day.date !== cell.date ? day : { ...day, ...response.data }),
        present_days: item.present_days + (presence === 'present' ? 1 : 0) - (cell.presence === 'present' ? 1 : 0),
        absent_days: item.absent_days + (presence === 'absent' ? 1 : 0) - (cell.presence === 'absent' ? 1 : 0),
        leave_days: item.leave_days + (presence === 'leave' ? 1 : 0) - (cell.presence === 'leave' ? 1 : 0),
        filled_days: item.filled_days + (presence ? 1 : 0) - (cell.presence ? 1 : 0),
      }) }))
    } catch {
      setError('Impossible d’enregistrer cette journée.')
    } finally {
      setSaving(null)
    }
  }

  return <div className="attendance-page">
    <div className="page-head">
      <div><p className="eyebrow">{isHr ? 'Pilotage RH' : 'Mon suivi'}</p><h2>{isHr ? 'Présences de l’équipe' : 'Mon absence'}</h2></div>
      <div className="filters attendance-filters">
        {isHr && <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un collaborateur" />}
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>{MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
    </div>
    {error && <div className="alert error">{error}</div>}
    {loading ? <p className="page-loading">Chargement…</p> : isHr ? <>
      <div className="stats attendance-stats"><div className="stat"><span>Présences saisies</span><strong>{totals.present}</strong></div><div className="stat"><span>Absences</span><strong>{totals.absent}</strong></div><div className="stat"><span>Congés</span><strong>{totals.leave}</strong></div><div className="stat"><span>Jours renseignés</span><strong>{totals.filled}</strong></div></div>
      <div className="attendance-guide"><span><b className="dot dot-present" /> P = Présent</span><span><b className="dot dot-absent" /> A = Absent</span><span><b className="dot dot-leave" /> C = Congé</span><span><b className="dot dot-holiday" /> F = Jour férié</span><span className="attendance-hint">Chaque jour est ouvert à la saisie</span></div>
      <div className="table-wrap attendance-grid-wrap"><table className="attendance-grid"><thead><tr><th className="employee-column">Collaborateur</th>{data.dates.map((item) => <th key={item.date} title={item.weekday}>{dateLabel(item.date)}</th>)}<th>Total P</th><th>Total A</th></tr></thead><tbody>
        {filteredRows.length === 0 && <tr><td colSpan={(data.dates?.length || 0) + 3}>Aucun collaborateur trouvé.</td></tr>}
        {filteredRows.map((row) => <tr key={row.user}><th className="employee-column"><strong>{row.user_name}</strong><small>{row.department}</small></th>{row.days.map((cell) => {
          const key = `${row.user}-${cell.date}`
          return <td className={`attendance-cell presence-${cell.presence || 'empty'}`} key={cell.date}><select aria-label={`${row.user_name}, ${cell.date}`} value={cell.presence} disabled={saving === key} onChange={(e) => updateAttendance(row, cell, e.target.value)}><option value="">—</option>{PRESENCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
        })}<td className="total-cell">{row.present_days}</td><td className="total-cell">{row.absent_days}</td></tr>)}
      </tbody></table></div>
    </> : <EmployeeCalendar data={data} />}
  </div>
}

function EmployeeCalendar({ data }) {
  const summary = (data?.days || []).reduce((result, day) => {
    if (day.presence === 'present') result.present += 1
    if (day.presence === 'absent') result.absent += 1
    if (day.presence === 'leave') result.leave += 1
    return result
  }, { present: 0, absent: 0, leave: 0 })
  return <><div className="stats attendance-stats"><div className="stat"><span>Présent</span><strong>{summary.present}</strong></div><div className="stat"><span>Absent</span><strong>{summary.absent}</strong></div><div className="stat"><span>Congé</span><strong>{summary.leave}</strong></div></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Jour</th><th>Statut</th><th>Note RH</th></tr></thead><tbody>{data?.days?.map((day) => <tr key={day.date}><td>{new Date(`${day.date}T00:00:00`).toLocaleDateString('fr-FR')}</td><td>{day.weekday}</td><td>{day.presence ? <span className={`badge presence-${day.presence}`}>{PRESENCE_LABELS[day.presence] || day.presence_label}</span> : <span className="muted">Non renseigné</span>}</td><td>{day.note || '—'}</td></tr>)}</tbody></table></div></>
}
