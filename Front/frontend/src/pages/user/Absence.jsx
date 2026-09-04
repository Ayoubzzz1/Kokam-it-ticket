import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../api/client'
import { PRESENCE_LABELS } from '../../utils/labels'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Absence() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="attendance-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Mon suivi</p>
          <h2>Mon absence</h2>
        </div>
        <div className="filters attendance-filters">
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="Mois">
            {MONTHS.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
          </select>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Année">
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert error" role="alert">
          <span>{error}</span>
          <button className="btn btn-secondary" type="button" onClick={loadCalendar}>Réessayer</button>
        </div>
      )}

      {loading ? <p className="page-loading">Chargement…</p> : (
        <>
          <div className="stats attendance-stats">
            <div className="stat"><span>Présent</span><strong>{summary.present}</strong></div>
            <div className="stat"><span>Absent</span><strong>{summary.absent}</strong></div>
            <div className="stat"><span>Congé</span><strong>{summary.leave}</strong></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Jour</th><th>Statut</th><th>Note RH</th></tr></thead>
              <tbody>
                {(data?.days || []).map((day) => (
                  <tr key={day.date}>
                    <td>{new Date(`${day.date}T00:00:00`).toLocaleDateString('fr-FR')}</td>
                    <td>{day.weekday}</td>
                    <td>{day.presence ? <span className={`badge presence-${day.presence}`}>{PRESENCE_LABELS[day.presence] || day.presence_label}</span> : <span className="muted">Non renseigné</span>}</td>
                    <td>{day.note || '—'}</td>
                  </tr>
                ))}
                {data && data.days?.length === 0 && <tr><td colSpan="4">Aucune donnée pour cette période.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
