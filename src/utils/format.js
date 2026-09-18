import dayjs from 'dayjs'

// --- Numeric input handling -------------------------------------------------

// Keep only digits and a single decimal point while the user types.
export function sanitizeNumericInput(raw) {
  if (raw == null) return ''
  let s = String(raw).replace(',', '.')
  // remove anything that is not a digit or dot
  s = s.replace(/[^0-9.]/g, '')
  // collapse multiple dots -> keep the first
  const firstDot = s.indexOf('.')
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '')
  }
  return s
}

// Normalize a finished numeric value: "5.0" -> "5", ".5" -> "0.5", "5." -> "5"
export function normalizeNumber(raw) {
  const s = sanitizeNumericInput(raw)
  if (s === '' || s === '.') return ''
  const n = Number(s)
  if (Number.isNaN(n)) return ''
  // Number() already drops trailing zeros and adds leading zero
  return String(n)
}

export function isValidNumber(raw) {
  const s = normalizeNumber(raw)
  return s !== '' && Number(s) > 0
}

// --- Component reading ("Diclofenaco · 9 mg por cada 5 ml") -----------------

export function componentPreview(c) {
  if (!c) return ''
  const name = (c.name || '').trim()
  const amount = normalizeNumber(c.amount)
  const perAmount = normalizeNumber(c.perAmount)
  const parts = []
  if (name) parts.push(name)
  const dose = [amount, c.unit].filter(Boolean).join(' ')
  const per = [perAmount || '', c.perUnit].filter(Boolean).join(' ')
  if (dose && per) return `${name ? name + ' · ' : ''}${dose} por cada ${per}`.trim()
  if (dose) return `${name ? name + ' · ' : ''}${dose}`.trim()
  return parts.join(' · ')
}

// --- Dose conversion --------------------------------------------------------
// Given a prescription dose (amount + measure unit e.g. 6 ml) and a product
// component (e.g. 9 mg por cada 5 ml), compute the delivered active amount.
export function convertDose(component, doseAmount, doseUnit) {
  const amount = Number(normalizeNumber(component?.amount))
  const per = Number(normalizeNumber(component?.perAmount))
  const dose = Number(normalizeNumber(doseAmount))
  if (!amount || !per || !dose) return null
  if (component.perUnit !== doseUnit) return null // units must match to convert
  const value = (amount / per) * dose
  const rounded = Math.round(value * 1000) / 1000
  return { value: rounded, unit: component.unit, text: `${dose} ${doseUnit} = ${rounded} ${component.unit} de ${component.name || 'componente'}` }
}

// --- Dates ------------------------------------------------------------------

export function formatDate(d) {
  if (!d) return ''
  return dayjs(d).format('DD/MM/YYYY')
}

// Expiry helpers. Returns 'expired' | 'soon' | 'ok' | null
export function expiryStatus(dateStr, soonDays = 30) {
  if (!dateStr) return null
  const exp = dayjs(dateStr).endOf('day')
  const now = dayjs()
  if (exp.isBefore(now)) return 'expired'
  if (exp.diff(now, 'day') <= soonDays) return 'soon'
  return 'ok'
}

export function expiryLabel(dateStr) {
  const status = expiryStatus(dateStr)
  if (status === 'expired') return `Vencido el ${formatDate(dateStr)}`
  if (status === 'soon') return `Por vencer: ${formatDate(dateStr)}`
  if (status === 'ok') return `Vence el ${formatDate(dateStr)}`
  return ''
}
