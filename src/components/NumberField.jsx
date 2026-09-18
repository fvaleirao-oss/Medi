import { TextField } from '@mui/material'
import { sanitizeNumericInput, normalizeNumber } from '../utils/format'

// Numeric-only field: numeric keyboard, only digits + one decimal point,
// auto-fixes "5.0" -> "5" and ".5" -> "0.5" on blur.
export default function NumberField({ value, onChange, onBlurNormalize = true, ...props }) {
  return (
    <TextField
      value={value}
      inputMode="decimal"
      onChange={(e) => onChange(sanitizeNumericInput(e.target.value))}
      onBlur={(e) => {
        if (onBlurNormalize) onChange(normalizeNumber(e.target.value))
      }}
      {...props}
    />
  )
}
