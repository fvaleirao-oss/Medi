import { useState } from 'react'
import {
  Box, Button, Typography, TextField, Stack, LinearProgress, Chip, Card, CardContent,
  MenuItem, IconButton, Divider, InputAdornment,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import Icon from '../components/Icon'
import ScreenHeader from '../components/ScreenHeader'
import NumberField from '../components/NumberField'
import PhotoPicker from '../components/PhotoPicker'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { PRESENTATIONS, CONCENTRATION_UNITS, MEASURE_UNITS } from '../utils/constants'
import { componentPreview, isValidNumber } from '../utils/format'

const emptyComponent = () => ({ name: '', amount: '', unit: 'mg', perAmount: '', perUnit: 'ml' })

// onSaved: optional callback (product) => void — used when nested from a prescription.
export default function ProductForm({ initial, onSaved }) {
  const { state, dispatch } = useApp()
  const nav = useNav()
  const editingId = initial?.id

  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState(initial?.brand || '')
  const [lab, setLab] = useState(initial?.lab || '')
  const [presentation, setPresentation] = useState(initial?.presentation || '')
  const [presentationOther, setPresentationOther] = useState(initial?.presentationOther || '')
  const [components, setComponents] = useState(initial?.components?.length ? initial.components : [emptyComponent()])
  const [bottleSize, setBottleSize] = useState(initial?.bottleSize || '')
  const [bottleUnit, setBottleUnit] = useState(initial?.bottleUnit || 'ml')
  const [expiry, setExpiry] = useState(initial?.expiry ? dayjs(initial.expiry) : null)
  const [photo, setPhoto] = useState(initial?.photo || '')
  const [note, setNote] = useState(initial?.note || '')
  // fields prefilled from a photo, highlighted until the user confirms each one
  const [review, setReview] = useState(new Set())

  const steps = ['Nombre', 'Presentación', 'Componentes', 'Frasco', 'Foto', 'Resumen']
  const total = steps.length

  const reviewSx = (key) =>
    review.has(key) ? { bgcolor: '#fff8e1', '& fieldset': { borderColor: '#f9a825' } } : {}
  const confirm = (key) =>
    setReview((r) => {
      const n = new Set(r)
      n.delete(key)
      return n
    })

  const updateComponent = (i, patch) =>
    setComponents((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))

  // "Llenar desde foto": marks the relevant fields for review (OCR would fill them).
  const markFromPhoto = (keys) => setReview((r) => new Set([...r, ...keys]))

  const componentsValid = components.every((c) => c.name.trim() && isValidNumber(c.amount) && c.unit)

  const canNext = () => {
    if (step === 0) return brand.trim().length > 0
    if (step === 1) return presentation && (presentation !== 'Otro' || presentationOther.trim())
    if (step === 2) return componentsValid
    return true
  }

  const save = () => {
    const payload = {
      brand: brand.trim(),
      lab: lab.trim(),
      presentation: presentation === 'Otro' ? presentationOther.trim() : presentation,
      components: components.map((c) => ({ ...c, name: c.name.trim() })),
      bottleSize,
      bottleUnit,
      expiry: expiry ? expiry.toISOString() : null,
      photo,
      note: note.trim(),
    }
    if (editingId) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: editingId, ...payload } })
    } else {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      dispatch({ type: 'ADD_PRODUCT', payload: { id, ...payload } })
      payload.id = id
    }
    if (onSaved) onSaved({ id: editingId || payload.id, ...payload })
    else nav.pop()
  }

  return (
    <Box>
      <ScreenHeader
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        onBack={() => (step === 0 ? nav.pop() : setStep((s) => s - 1))}
      />
      <Box sx={{ px: 2, pt: 1 }}>
        <LinearProgress variant="determinate" value={((step + 1) / total) * 100} sx={{ borderRadius: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Paso {step + 1} de {total} · {steps[step]}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Step 1 — Nombre */}
        {step === 0 && (
          <Stack spacing={2}>
            <Typography variant="h6">Nombre del producto</Typography>
            <TextField label="Marca" value={brand} onChange={(e) => { setBrand(e.target.value); confirm('brand') }} sx={reviewSx('brand')} autoFocus placeholder="Ej: Tylenol" />
            <TextField label="Laboratorio" value={lab} onChange={(e) => { setLab(e.target.value); confirm('lab') }} sx={reviewSx('lab')} />
            <Button variant="text" startIcon={<Icon name="photo_camera" />} onClick={() => markFromPhoto(['brand', 'lab'])}>
              Llenar desde foto
            </Button>
            {review.size > 0 && <ReviewHint />}
          </Stack>
        )}

        {/* Step 2 — Presentación */}
        {step === 1 && (
          <Stack spacing={2}>
            <Typography variant="h6">Presentación</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {PRESENTATIONS.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  color={presentation === p ? 'primary' : 'default'}
                  variant={presentation === p ? 'filled' : 'outlined'}
                  onClick={() => setPresentation(p)}
                />
              ))}
            </Box>
            {presentation === 'Otro' && (
              <TextField label="Especifica la presentación" value={presentationOther} onChange={(e) => setPresentationOther(e.target.value)} autoFocus />
            )}
          </Stack>
        )}

        {/* Step 3 — Componentes */}
        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="h6">Componentes</Typography>
            {components.map((c, i) => (
              <Card key={i}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        Componente {i + 1}
                      </Typography>
                      {components.length > 1 && (
                        <IconButton size="small" onClick={() => setComponents((cs) => cs.filter((_, idx) => idx !== i))}>
                          <Icon name="delete" sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                    </Box>
                    <TextField
                      label="Nombre del componente"
                      value={c.name}
                      onChange={(e) => { updateComponent(i, { name: e.target.value }); confirm(`c${i}name`) }}
                      sx={reviewSx(`c${i}name`)}
                      placeholder="Ej: Diclofenaco ácido libre"
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <NumberField label="Cantidad" value={c.amount} onChange={(v) => updateComponent(i, { amount: v })} placeholder="9" />
                      <TextField select label="Unidad" value={c.unit} onChange={(e) => updateComponent(i, { unit: e.target.value })} sx={{ maxWidth: 110 }}>
                        {CONCENTRATION_UNITS.map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>por cada</Typography>
                      <NumberField label="Cantidad" value={c.perAmount} onChange={(v) => updateComponent(i, { perAmount: v })} placeholder="5" />
                      <TextField select label="Medida" value={c.perUnit} onChange={(e) => updateComponent(i, { perUnit: e.target.value })} sx={{ maxWidth: 120 }}>
                        {MEASURE_UNITS.map((u) => (
                          <MenuItem key={u} value={u}>{u}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">Vista previa</Typography>
                      <Typography>{componentPreview(c) || '—'}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            <Button variant="outlined" startIcon={<Icon name="add" />} onClick={() => setComponents((cs) => [...cs, emptyComponent()])}>
              Agregar otro componente
            </Button>
            <Button variant="text" startIcon={<Icon name="photo_camera" />} onClick={() => markFromPhoto([`c0name`])}>
              Llenar desde foto
            </Button>
            {!componentsValid && <Typography variant="caption" color="error">Cada componente necesita nombre, cantidad y unidad.</Typography>}
            {review.size > 0 && <ReviewHint />}
          </Stack>
        )}

        {/* Step 4 — Frasco y vencimiento */}
        {step === 3 && (
          <Stack spacing={2}>
            <Typography variant="h6">Frasco y vencimiento</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <NumberField label="Tamaño del frasco" value={bottleSize} onChange={setBottleSize} placeholder="60" />
              <TextField select label="Unidad" value={bottleUnit} onChange={(e) => setBottleUnit(e.target.value)} sx={{ maxWidth: 120 }}>
                {MEASURE_UNITS.map((u) => (
                  <MenuItem key={u} value={u}>{u}</MenuItem>
                ))}
              </TextField>
            </Box>
            <DatePicker label="Fecha de vencimiento" value={expiry} onChange={setExpiry} format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true } }} />
            <TextField label="Nota (opcional)" value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} />
          </Stack>
        )}

        {/* Step 5 — Foto */}
        {step === 4 && (
          <Stack spacing={2}>
            <Typography variant="h6">Foto de la caja</Typography>
            <Typography variant="body2" color="text.secondary">
              Opcional ahora, pero obligatoria antes de dar la primera dosis.
            </Typography>
            <PhotoPicker value={photo} onChange={setPhoto} label="Tomar foto de la caja" />
          </Stack>
        )}

        {/* Step 6 — Resumen */}
        {step === 5 && (
          <Stack spacing={2}>
            <Typography variant="h6">Resumen</Typography>
            <SummaryBlock title="Nombre" onEdit={() => setStep(0)}>
              <Typography>{brand || '—'}</Typography>
              {lab && <Typography variant="body2" color="text.secondary">{lab}</Typography>}
            </SummaryBlock>
            <SummaryBlock title="Presentación" onEdit={() => setStep(1)}>
              <Typography>{presentation === 'Otro' ? presentationOther : presentation || '—'}</Typography>
            </SummaryBlock>
            <SummaryBlock title="Componentes" onEdit={() => setStep(2)}>
              {components.map((c, i) => (
                <Typography key={i}>{componentPreview(c)}</Typography>
              ))}
            </SummaryBlock>
            <SummaryBlock title="Frasco y vencimiento" onEdit={() => setStep(3)}>
              <Typography>{bottleSize ? `${bottleSize} ${bottleUnit}` : 'Tamaño sin especificar'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {expiry ? `Vence: ${expiry.format('DD/MM/YYYY')}` : 'Sin fecha de vencimiento'}
              </Typography>
              {note && <Typography variant="body2" color="text.secondary">{note}</Typography>}
            </SummaryBlock>
            <SummaryBlock title="Foto" onEdit={() => setStep(4)}>
              {photo ? <img src={photo} alt="caja" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 12 }} /> : <Typography color="text.secondary">Sin foto</Typography>}
            </SummaryBlock>
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 2, position: 'sticky', bottom: 0, bgcolor: 'background.default', borderTop: '1px solid #dde4e3' }}>
        {step < total - 1 ? (
          <Button fullWidth variant="contained" size="large" disabled={!canNext()} onClick={() => setStep((s) => s + 1)} endIcon={<Icon name="arrow_forward" />}>
            Siguiente
          </Button>
        ) : (
          <Button fullWidth variant="contained" size="large" onClick={save} startIcon={<Icon name="check" />}>
            Guardar
          </Button>
        )}
      </Box>
    </Box>
  )
}

function SummaryBlock({ title, onEdit, children }) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>{title}</Typography>
          <Button size="small" startIcon={<Icon name="edit" sx={{ fontSize: 18 }} />} onClick={onEdit}>Editar</Button>
        </Box>
        {children}
      </CardContent>
    </Card>
  )
}

function ReviewHint() {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#fff8e1', p: 1.5, borderRadius: 2 }}>
      <Icon name="rate_review" sx={{ color: '#f9a825' }} />
      <Typography variant="body2">Revisa y confirma los campos en amarillo tocándolos.</Typography>
    </Box>
  )
}
