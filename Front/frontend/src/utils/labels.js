export const STATUS_LABELS = {
  new: 'Nouveau',
  in_progress: 'En cours',
  resolved: 'Résolu',
  done: 'Terminé',
}

export const STATUS_LABELS_EN = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  done: 'Done',
}

export const PRIORITY_LABELS = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
}

export const ROLE_LABELS = {
  user: 'Employé',
  technician: 'Technicien IT',
  hr: 'RH',
  superadmin: 'SuperAdmin',
}

export const STATUSES = ['new', 'in_progress', 'done']
export const PRIORITIES = ['low', 'medium', 'high', 'critical']

export const REQUEST_STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
}

export const REQUEST_KIND_LABELS = {
  leave: 'Demande de congé',
  advance: "Demande d'avance",
  general: 'Demande',
}

export const REQUEST_DESTINATION_LABELS = {
  direction: 'Direction',
  hr: 'RH',
  administration: 'Administration',
}

export const LEAVE_TYPE_LABELS = {
  annual: 'Congé annuel',
  sick: 'Congé maladie',
  unpaid: 'Congé sans solde',
  other: 'Autre',
}

export const PRESENCE_LABELS = {
  present: 'Présent',
  absent: 'Absent',
  weekend: 'Week-end',
  holiday: 'Jour férié',
  leave: 'Congé',
}

export function homeForRole(role) {
  if (role === 'technician') return '/it/dashboard'
  if (role === 'superadmin') return '/admin/dashboard'
  if (role === 'hr') return '/hr/dashboard'
  return '/dashboard'
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateOnly(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
