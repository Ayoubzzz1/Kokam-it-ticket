import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client'
import {
  LEAVE_TYPE_LABELS,
  REQUEST_DESTINATION_LABELS,
  REQUEST_KIND_LABELS,
  REQUEST_STATUS_LABELS,
} from '../../utils/labels'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function RequestDetail() {
  const { id } = useParams()
  const [req, setReq] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/employee-requests/${id}/`)
      .then((res) => setReq(res.data))
      .catch(() => setError('Impossible de charger la demande.'))
      .finally(() => setLoading(false))
  }, [id])

  function printDocument() {
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) return
    const title =
      req.kind === 'leave'
        ? 'DEMANDE DE CONGÉ'
        : req.kind === 'advance'
          ? "DEMANDE D'AVANCE"
          : 'DEMANDE'
    const destinationLabel = REQUEST_DESTINATION_LABELS[req.destination] || req.destination_label
    const statusLabel = REQUEST_STATUS_LABELS[req.status] || req.status_label

    const lines = []
    lines.push(`<div class="doc-title">${title}</div>`)
    lines.push(`<div class="doc-meta"><span>N° de demande: ${req.display_number}</span><span>Date: ${formatDate(req.created_at)}</span></div>`)
    lines.push(`<hr/>`)
    lines.push(`<div class="doc-block"><strong>Employé:</strong> ${req.created_by_name}</div>`)
    lines.push(`<div class="doc-block"><strong>Matricule:</strong> ${req.employee_id || '—'}</div>`)
    lines.push(`<div class="doc-block"><strong>Service:</strong> ${req.service || '—'}</div>`)
    lines.push(`<div class="doc-block"><strong>Bureau:</strong> ${req.bureau || '—'}</div>`)
    lines.push(`<hr/>`)

    if (req.kind === 'leave') {
      lines.push(`<div class="doc-block"><strong>Type de congé:</strong> ${LEAVE_TYPE_LABELS[req.leave_type] || req.leave_type_label}</div>`)
      lines.push(`<div class="doc-block"><strong>Date de début:</strong> ${formatDate(req.start_date)}</div>`)
      lines.push(`<div class="doc-block"><strong>Date de fin:</strong> ${formatDate(req.end_date)}</div>`)
      lines.push(`<div class="doc-block"><strong>Nombre de jours:</strong> ${req.days} jour${req.days > 1 ? 's' : ''}</div>`)
    } else if (req.kind === 'advance') {
      lines.push(`<div class="doc-block"><strong>Montant demandé:</strong> ${req.amount} ${req.currency}</div>`)
    } else {
      lines.push(`<div class="doc-block"><strong>Objet:</strong> ${req.title}</div>`)
      lines.push(`<div class="doc-block"><strong>Destinataire:</strong> ${destinationLabel}</div>`)
    }

    if (req.motif) {
      lines.push(`<div class="doc-block"><strong>Motif:</strong><br/>${req.motif.replace(/\n/g, '<br/>')}</div>`)
    }

    lines.push(`<hr/>`)
    lines.push(`<div class="doc-block"><strong>Statut:</strong> ${statusLabel}</div>`)
    if (req.admin_comment) {
      lines.push(`<div class="doc-block"><strong>Commentaire RH/Admin:</strong><br/>${req.admin_comment.replace(/\n/g, '<br/>')}</div>`)
    }
    if (req.reviewed_by_name) {
      lines.push(`<div class="doc-block"><strong>Examiné par:</strong> ${req.reviewed_by_name} le ${formatDate(req.reviewed_at)}</div>`)
    }

    lines.push(`<hr/>`)
    lines.push(`<div class="signature-section">`)
    if (req.kind === 'leave' || req.kind === 'advance') {
      lines.push(`<div class="signature-block director-signature"><div class="signature-label">Signature du Directeur</div><div class="signature-line"></div></div>`)
    } else {
      lines.push(`<div class="signature-block"><div class="signature-label">Signature Administration / RH / Direction</div><div class="signature-line"></div></div>`)
    }
    lines.push(`</div>`)

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${title} ${req.display_number}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
  .company { text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #0f172a; margin-bottom: 4px; }
  .doc-title { text-align: center; font-size: 20px; font-weight: 700; margin: 24px 0; text-transform: uppercase; letter-spacing: 1px; }
  .doc-meta { display: flex; justify-content: space-between; font-size: 13px; color: #475569; margin-bottom: 16px; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 20px 0; }
  .doc-block { font-size: 14px; margin-bottom: 10px; line-height: 1.6; }
  .doc-block strong { color: #0f172a; }
  .signature-section { margin-top: 60px; display: flex; flex-direction: column; gap: 48px; }
  .signature-label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
  .signature-line { border-bottom: 1px solid #334155; width: 280px; height: 40px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
  <div class="company">KOKAM PLUS</div>
  ${lines.join('\n')}
</body>
</html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  if (loading) return <p className="page-loading">Chargement…</p>
  if (error) return <div className="alert error">{error}</div>
  if (!req) return null

  const statusLabel = REQUEST_STATUS_LABELS[req.status] || req.status_label
  const destinationLabel = REQUEST_DESTINATION_LABELS[req.destination] || req.destination_label

  return (
    <div className="card">
      <div className="page-head">
        <h2>Demande {req.display_number}</h2>
        <button className="btn primary" type="button" onClick={printDocument}>
          Imprimer la demande
        </button>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <label>Employé</label>
          <p>{req.created_by_name}</p>
        </div>
        <div className="info-item">
          <label>Matricule</label>
          <p>{req.employee_id || '—'}</p>
        </div>
        <div className="info-item">
          <label>Service</label>
          <p>{req.service || '—'}</p>
        </div>
        <div className="info-item">
          <label>Bureau</label>
          <p>{req.bureau || '—'}</p>
        </div>
        <div className="info-item">
          <label>Type</label>
          <p>{req.kind_label}</p>
        </div>
        <div className="info-item">
          <label>Destinataire</label>
          <p>{destinationLabel}</p>
        </div>
        <div className="info-item">
          <label>Date</label>
          <p>{formatDate(req.created_at)}</p>
        </div>
        <div className="info-item">
          <label>Statut</label>
          <p>
            <span className={`badge status-${req.status}`}>{statusLabel}</span>
          </p>
        </div>
      </div>

      {req.kind === 'leave' && (
        <div className="info-grid" style={{ marginTop: '16px' }}>
          <div className="info-item">
            <label>Type de congé</label>
            <p>{LEAVE_TYPE_LABELS[req.leave_type] || req.leave_type_label}</p>
          </div>
          <div className="info-item">
            <label>Date de début</label>
            <p>{formatDate(req.start_date)}</p>
          </div>
          <div className="info-item">
            <label>Date de fin</label>
            <p>{formatDate(req.end_date)}</p>
          </div>
          <div className="info-item">
            <label>Nombre de jours</label>
            <p>{req.days} jour{req.days > 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {req.kind === 'advance' && (
        <div className="info-grid" style={{ marginTop: '16px' }}>
          <div className="info-item">
            <label>Montant</label>
            <p>
              {req.amount} {req.currency}
            </p>
          </div>
        </div>
      )}

      {req.motif && (
        <div className="description-box" style={{ marginTop: '16px' }}>
          <strong>Motif :</strong>
          <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{req.motif}</p>
        </div>
      )}

      {req.admin_comment && (
        <div className="description-box" style={{ marginTop: '16px', background: '#fef3c7' }}>
          <strong>Commentaire RH/Admin :</strong>
          <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0 0' }}>{req.admin_comment}</p>
        </div>
      )}

      {req.reviewed_by_name && (
        <p className="muted" style={{ marginTop: '16px' }}>
          Examiné par {req.reviewed_by_name} le {formatDate(req.reviewed_at)}
        </p>
      )}
    </div>
  )
}