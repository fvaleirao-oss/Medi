import { useState } from 'react'
import {
  Box, Button, Typography, TextField, Stack, LinearProgress, Card, CardContent, CardActionArea,
  MenuItem, Avatar, ToggleButtonGroup, ToggleButton, Divider, Chip,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import Icon from '../components/Icon'
import ScreenHeader from '../components/ScreenHeader'
import NumberField from '../components/NumberField'
import PhotoPicker from '../components/PhotoPicker'
import ProductForm from './ProductForm'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { MEASURE_UNITS, ROUTES } from '../utils/constants'
import { componentPreview, convertDose, isValidNumber, expiryStatus } from '../utils/format'

export default function PrescriptionForm({ childId: presetChild }) {
  const { state, dispatch } = useApp()
  const nav = useNav()

  const [step, setStep] = useState(presetChild ? 1 : 0)
  const [childId, setChildId] = useState(presetChild || '')
  const [productId, setProductId] = useState('')
  const [newProduct, setNewProduct] = useState(false)

  const [doseAmount, setDoseAmount] = useState('')
  const [doseUnit, setDoseUnit] = useState('ml')
  const [route, setRoute] = useState('Oral')
  const [freqFrom, setFreqFrom] = useState('')
  const [freqTo, setFreqTo] = useState('')
  const [durFrom, setDurFrom] = useState('')
  const [durTo, setDurTo] = useState('')
  const [durUnit, setDurUnit] = useState('días')
  const [reason, setReason] = useState('')
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState(dayjs())
  const [instructions, setInstructions] = useState('')
  const [recipePhoto, setRecipePhoto] = useState('')
  const [status, setStatus] = useState('cabinet')

  const steps = ['Hijo', 'Producto', 'Receta', 'Estado', 'Resumen']
  const total = steps.length
  const product = state.products.find((p) => p.id === productId)

  if (newProduct) {
    return (
      <ProductForm
        onSaved={(p) => {
          setProductId(p.id)
          setNewProduct(false)
          setStep(2)
        }}
      />
    )
  }

  const canNext = () => {
    if (step === 0) return !!childId
    if (step === 1) return !!productId
    if (step === 2) return isValidNumber(doseAmount) && doseUnit && route && isValidNumber(freqFrom)
    return true
  }

  const save = () => {
    dispatch({
      type: 'ADD_PRESCRIPTION',
      payload: {
        childId, productId, doseAmount, doseUnit, route,
        freqFrom, freqTo: freqTo || freqFrom, durFrom, durTo, durUnit,
        reason: reason.trim(), doctor: doctor.trim(), date: date ? date.toISOString() : null,
        instructions: instructions.trim(), recipePhoto, status,
      },
    })
    nav.pop()
  }

  const conv = product && convertDose(product.components?.[0], doseAmount, doseUnit)

  return (
    <Box>
      <ScreenHeader title="Agregar medicamento" onBack={() => (step === (presetChild ? 1 : 0) ? nav.pop() : setStep((s) => s - 1))} />
      <Box sx={{ px: 2, pt: 1 }}>
        <LinearProgress variant="determinate" value={((step + 1) / total) * 100} sx={{ borderRadius: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Paso {step + 1} de {total} · {steps[step]}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Step 1 — Elegir hijo */}
        {step === 0 && (
          <Stack spacing={1.5}>
            <Typography variant="h6">¿Para qué hijo?</Typography>
            {state.children.map((c) => (
              <Card key={c.id} sx={{ borderColor: childId === c.id ? 'primary.main' : undefined, borderWidth: childId === c.id ? 2 : 1 }}>
                <CardActionArea onClick={() => setChildId(c.id)}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: c.color }}>{c.name.charAt(0).toUpperCase()}</Avatar>
                    <Typography sx={{ flexGrow: 1 }}>{c.name}</Typography>
                    {childId === c.id && <Icon name="check_circle" sx={{ color: 'primary.main' }} />}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}

        {/* Step 2 — Elegir producto */}
        {step === 1 && (
          <Stack spacing={1.5}>
            <Typography variant="h6">Elige un producto del botiquín</Typography>
            <Button variant="outlined" startIcon={<Icon name="add" />} onClick={() => setNewProduct(true)}>
              Nuevo producto
            </Button>
            {state.products.length === 0 && (
              <Typography variant="body2" color="text.secondary">Aún no hay productos. Crea uno nuevo.</Typography>
            )}
            {state.products.map((p) => {
              const expired = expiryStatus(p.expiry) === 'expired'
              return (
                <Card key={p.id} sx={{ borderColor: productId === p.id ? 'primary.main' : undefined, borderWidth: productId === p.id ? 2 : 1, opacity: expired ? 0.6 : 1 }}>
                  <CardActionArea onClick={() => !expired && setProductId(p.id)} disabled={expired}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 500, flexGrow: 1 }}>{p.brand}</Typography>
                        {expired && <Chip size="small" color="error" label="Vencido" />}
                        {productId === p.id && <Icon name="check_circle" sx={{ color: 'primary.main' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{p.components?.map(componentPreview).join(' · ')}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              )
            })}
          </Stack>
        )}

        {/* Step 3 — Datos de la receta */}
        {step === 2 && (
          <Stack spacing={2}>
            <Typography variant="h6">Datos de la receta</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <NumberField label="Dosis" value={doseAmount} onChange={setDoseAmount} placeholder="6" />
              <TextField select label="Unidad" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)} sx={{ maxWidth: 120 }}>
                {MEASURE_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Box>
            <TextField select label="Vía" value={route} onChange={(e) => setRoute(e.target.value)}>
              {ROUTES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <Typography variant="subtitle2" color="text.secondary">Frecuencia (cada cuántas horas)</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <NumberField label="Desde" value={freqFrom} onChange={setFreqFrom} placeholder="8" />
              <Typography color="text.secondary">a</Typography>
              <NumberField label="Hasta" value={freqTo} onChange={setFreqTo} placeholder="8" />
              <Typography color="text.secondary">h</Typography>
            </Box>
            <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <NumberField label="Desde" value={durFrom} onChange={setDurFrom} placeholder="3" />
              <Typography color="text.secondary">a</Typography>
              <NumberField label="Hasta" value={durTo} onChange={setDurTo} placeholder="5" />
              <TextField select value={durUnit} onChange={(e) => setDurUnit(e.target.value)} sx={{ maxWidth: 110 }}>
                <MenuItem value="días">días</MenuItem>
                <MenuItem value="horas">horas</MenuItem>
              </TextField>
            </Box>
            <TextField label="Para qué" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej: fiebre" />
            <TextField label="Doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
            <DatePicker label="Fecha" value={date} onChange={setDate} format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true } }} />
            <TextField label="Instrucciones" value={instructions} onChange={(e) => setInstructions(e.target.value)} multiline minRows={2} />
            <PhotoPicker value={recipePhoto} onChange={setRecipePhoto} label="Foto de la receta (opcional)" />
            {conv && (
              <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Conversión</Typography>
                <Typography>{conv.text}</Typography>
              </Box>
            )}
          </Stack>
        )}

        {/* Step 4 — Estado inicial */}
        {step === 3 && (
          <Stack spacing={2}>
            <Typography variant="h6">Estado inicial</Typography>
            <ToggleButtonGroup exclusive value={status} onChange={(_, v) => v && setStatus(v)} orientation="vertical" fullWidth>
              <ToggleButton value="cabinet" sx={{ justifyContent: 'flex-start', gap: 1, py: 2 }}>
                <Icon name="medical_services" /> En botiquín
              </ToggleButton>
              <ToggleButton value="active" sx={{ justifyContent: 'flex-start', gap: 1, py: 2 }}>
                <Icon name="play_circle" /> Empezar tratamiento ahora
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        )}

        {/* Step 5 — Resumen */}
        {step === 4 && (
          <Stack spacing={2}>
            <Typography variant="h6">Resumen</Typography>
            <Card><CardContent>
              <Line label="Hijo" value={state.children.find((c) => c.id === childId)?.name} />
              <Line label="Producto" value={product?.brand} />
              <Line label="Dosis" value={`${doseAmount} ${doseUnit} · ${route}`} />
              <Line label="Frecuencia" value={`cada ${freqFrom}${freqTo && freqTo !== freqFrom ? `–${freqTo}` : ''} h`} />
              {(durFrom || durTo) && <Line label="Duración" value={`${durFrom || '?'}${durTo ? `–${durTo}` : ''} ${durUnit}`} />}
              {reason && <Line label="Para qué" value={reason} />}
              {doctor && <Line label="Doctor" value={doctor} />}
              <Line label="Estado" value={status === 'active' ? 'Empezar tratamiento' : 'En botiquín'} />
            </CardContent></Card>
            {conv && (
              <Card sx={{ bgcolor: '#e6f4f1' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">Conversión calculada</Typography>
                  <Typography variant="h6" color="primary">{conv.text}</Typography>
                </CardContent>
              </Card>
            )}
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

function Line({ label, value }) {
  if (!value) return null
  return (
    <Box sx={{ display: 'flex', py: 0.75, gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>{label}</Typography>
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{value}</Typography>
    </Box>
  )
}
