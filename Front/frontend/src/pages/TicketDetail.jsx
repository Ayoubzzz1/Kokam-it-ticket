import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDate,
} from '../utils/labels'

export default function TicketDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [technicians, setTechnicians] = useState([])
  const [message, setMessage] = useState('')
  const [notice] = useState(
    location.state?.created ? `Votre problème a été envoyé avec succès. Ticket ${location.state.created}` : ''
  )

  const isIT = user.role === 'technician'
  const isAdmin = user.role === 'superadmin'
  const isStaff = isIT || isAdmin

  async function load() {
    const { data } = await api.get(`/tickets/${id}/`)
    setTicket(data)
  }

  useEffect(() => {
    load()
    if (isStaff) {
      api.get('/technicians/').then((res) => setTechnicians(res.data))
    }
  }, [id])

  async function addComment(e) {
    e.preventDefault()
    if (!message.trim()) return
    await api.post(`/tickets/${id}/comments/`, { message })
    setMessage('')
    load()
  }

  async function upload(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    await api.post(`/tickets/${id}/attachments/`, fd)
    load()
  }

  async function startWork() {
    await api.post(`/tickets/${id}/start/`, {})
    load()
  }

  async function markDone() {
    await api.patch(`/tickets/${id}/`, { status: 'done' })
    load()
  }

  async function changePriority(priority) {
    await api.patch(`/tickets/${id}/`, { priority })
    load()
  }

  async function assign(technicianId) {
    await api.post(
      `/tickets/${id}/assign/`,
      technicianId ? { technician_id: technicianId } : {}
    )
    load()
  }

  if (!ticket) {
    return (
      <div className="ticket-loading">
        <div className="spinner"></div>
        <p>Chargement du ticket…</p>
      </div>
    )
  }

  const emp = ticket.created_by_detail || {}
  const isCreator = user.id === ticket.created_by
  const isAssignedTech = user.id === ticket.assigned_technician
  const canManageAsIT = isAdmin || (isIT && (isAssignedTech || !ticket.assigned_technician))

  return (
    <div className="ticket-detail">
      {notice && (
        <div className="alert success">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {notice}
        </div>
      )}

      <div className="ticket-grid">
        {/* LEFT COLUMN - Ticket Info */}
        <div className="ticket-main">
          {/* Header Section */}
          <section className="ticket-header">
            <div className="header-top">
              <div>
                <p className="ticket-number">Ticket #{ticket.display_number}</p>
                <h1>{ticket.title}</h1>
              </div>
              <div className="header-badges">
                <span className={`badge prio-${ticket.priority}`}>
                  {PRIORITY_LABELS[ticket.priority]}
                </span>
                <span className={`badge status-${ticket.status}`}>
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </span>
              </div>
            </div>
            <p className="ticket-category">{ticket.category_name}</p>
          </section>

          {/* Status Timeline */}
          <section className="card">
            <h3>Historique</h3>
            <div className="status-timeline">
              {[
                { status: 'new', label: STATUS_LABELS.new || 'Nouveau', date: ticket.created_at },
                { status: 'in_progress', label: STATUS_LABELS.in_progress || 'En cours', date: ticket.started_at },
                { status: 'done', label: STATUS_LABELS.done || 'Terminé', date: ticket.closed_at },
              ].map((step, idx) => {
                const statusOrder = ['new', 'in_progress', 'done']
                const currentIdx = statusOrder.indexOf(ticket.status)
                const stepIdx = statusOrder.indexOf(step.status)
                const isCompleted = stepIdx < currentIdx
                const isActive = step.status === ticket.status

                return (
                  <div key={step.status} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className={`timeline-indicator status-${step.status}`}></div>
                    <div className="timeline-info">
                      <p className="timeline-status">{step.label}</p>
                      {step.date ? <p className="timeline-time">{formatDate(step.date)}</p> : <p className="timeline-time">—</p>}
                    </div>
                  </div>
                )
              })}
            </div>
            {ticket.resolution_time && (
              <div className="resolution-time">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 3V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <strong>Temps d'intervention</strong>
                  <p>{ticket.resolution_time}</p>
                </div>
              </div>
            )}
          </section>

          {/* Description & Details */}
          <section className="card">
            <h3>Description</h3>
            <div className="description-box">
              <p>{ticket.description}</p>
            </div>
          </section>

          {/* Requester Info */}
          <section className="card">
            <h3>Demandeur</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nom</label>
                <p>{emp.last_name || '—'}</p>
              </div>
              <div className="info-item">
                <label>Prénom</label>
                <p>{emp.first_name || '—'}</p>
              </div>
              <div className="info-item">
                <label>Service</label>
                <p>{emp.department_name || ticket.created_by_department || '—'}</p>
              </div>
              <div className="info-item">
                <label>Poste</label>
                <p>{emp.job_position || '—'}</p>
              </div>
              <div className="info-item">
                <label>Bureau</label>
                <p>{ticket.location || ticket.bureau || emp.office || '—'}</p>
              </div>
              <div className="info-item">
                <label>Créé le</label>
                <p>{formatDate(ticket.created_at)}</p>
              </div>
            </div>
          </section>

          {/* Work Notes for Staff */}
          {isStaff && (
            <section className="card">
              <h3>Notes de travail</h3>
              <div className={`notes-display ${!ticket.work_notes ? 'empty' : ''}`}>
                {ticket.work_notes ? <p>{ticket.work_notes}</p> : <p className="empty-message">Aucune note de travail</p>}
              </div>
            </section>
          )}

          {/* Resolution Info */}
          {ticket.resolution_info && (
            <section className="card">
              <h3>Informations de résolution</h3>
              <div className="resolution-display">
                <p>{ticket.resolution_info}</p>
              </div>
            </section>
          )}

          {/* Attachments */}
          <section className="card">
            <h3>Pièces jointes</h3>
            {ticket.attachments.length > 0 ? (
              <div className="attachments-list">
                {ticket.attachments.map((a) => (
                  <a key={a.id} href={a.file} target="_blank" rel="noreferrer" className="attachment-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13 11V13.5C13 14.3284 12.3284 15 11.5 15H2.5C1.67157 15 1 14.3284 1 13.5V6.5C1 5.67157 1.67157 5 2.5 5H5M11 1H6C4.89543 1 4 1.89543 4 3V8C4 9.10457 4.89543 10 6 10H11C12.1046 10 13 9.10457 13 8V3C13 1.89543 12.1046 1 11 1Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="attachment-meta">
                      <p className="attachment-name">{a.file.split('/').pop()}</p>
                      <p className="attachment-by">{a.uploaded_by_name}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucune pièce jointe</p>
            )}
            <label className="file-upload">
              <input type="file" onChange={upload} />
              <span>Ajouter une pièce jointe</span>
            </label>
          </section>

          {/* Modification History */}
          <section className="card">
            <h3>Historique des modifications</h3>
            {ticket.history.length > 0 ? (
              <div className="history-list">
                {ticket.history.map((h) => (
                  <div key={h.id} className="history-item">
                    <time>{formatDate(h.created_at)}</time>
                    <p>
                      <strong>{h.action}</strong>
                      {h.old_value && h.new_value ? ` : ${h.old_value} → ${h.new_value}` : h.new_value ? ` : ${h.new_value}` : ''}
                      {h.actor_name ? <span className="actor"> par {h.actor_name}</span> : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucun historique</p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN - Conversation & Actions */}
        <div className="ticket-sidebar">
          {/* Status Actions */}
          {(canManageAsIT || isCreator) && (
            <section className="card actions-card">
              <h3>Actions</h3>
              <div className="actions-group">
                {canManageAsIT && ticket.status === 'new' && (
                  <button className="btn btn-primary" onClick={startWork}>
                    Passer en cours
                  </button>
                )}
                {isCreator && ticket.status === 'in_progress' && (
                  <div className="status-info">
                    <p className="info-text">L'IT a pris votre demande en charge. Marquez-la comme terminée quand le problème est résolu.</p>
                    <button className="btn btn-primary" onClick={markDone}>
                      Marquer comme terminé
                    </button>
                  </div>
                )}
                {canManageAsIT && ticket.status === 'in_progress' && (
                  <p className="info-text muted">Ticket en cours. Le demandeur marquera comme terminé.</p>
                )}
              </div>
            </section>
          )}

          {/* Admin Controls */}
          {isAdmin && (
            <section className="card">
              <h3>Gestion</h3>
              <div className="admin-controls">
                <label className="control-group">
                  <span>Priorité</span>
                  <select value={ticket.priority} onChange={(e) => changePriority(e.target.value)}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="control-group">
                  <span>Technicien assigné</span>
                  <select value={ticket.assigned_technician || ''} onChange={(e) => assign(e.target.value)}>
                    <option value="">IT Team (non assigné)</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                {!isAssignedTech && (
                  <button className="btn btn-secondary btn-block" onClick={() => assign(user.id)}>
                    Prendre ce ticket
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="card full-card">
            <h3>Conversation</h3>
            <div className="comments-thread">
              {ticket.comments.length === 0 ? (
                <p className="empty-message">Aucun commentaire pour le moment</p>
              ) : (
                ticket.comments.map((c) => (
                  <div key={c.id} className={`comment ${c.author_role === 'technician' ? 'comment-staff' : 'comment-user'}`}>
                    <div className="comment-header">
                      <strong>
                        {c.author_name}
                        {c.author_role === 'technician' && <span className="badge-staff">IT</span>}
                      </strong>
                      <time>{formatDate(c.created_at)}</time>
                    </div>
                    <p className="comment-text">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addComment} className="comment-form">
              <textarea
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrire un commentaire…"
                maxLength="2000"
              />
              <div className="form-footer">
                <span className="char-count">{message.length}/2000</span>
                <button className="btn btn-primary" type="submit" disabled={!message.trim()}>
                  Envoyer
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
