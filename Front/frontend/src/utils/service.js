export function serviceName(departments, id) {
  return departments.find((d) => String(d.id) === String(id))?.name || ''
}

export function parseBureauNumber(office) {
  const match = String(office || '').match(/-bureau\s+(\d+)\s*$/i)
  return match ? match[1] : ''
}

export function bureauCode(service, number) {
  if (!service || !number) return ''
  return `${service}-bureau ${number}`
}
