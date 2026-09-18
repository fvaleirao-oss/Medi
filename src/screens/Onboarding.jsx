import { useState } from 'react'
import { Box, Button, Typography, TextField, Stack, LinearProgress, Chip } from '@mui/material'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { CHILD_COLORS } from '../utils/constants'

export default function Onboarding() {
  const { dispatch } = useApp()
  const [step, setStep] = useState(0)
  const [familyName, setFamilyName] = useState('')
  const [childName, setChildName] = useState('')
  const [color, setColor] = useState(CHILD_COLORS[0])
  const [invite, setInvite] = useState('')

  const total = 3
  const finish = () => {
    dispatch({ type: 'SET_FAMILY', payload: { name: familyName.trim() || 'Mi familia', members: [] } })
    if (childName.trim()) {
      dispatch({ type: 'ADD_CHILD', payload: { name: childName.trim(), color } })
    }
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          💊 Medi
        </Typography>
        <Typography color="text.secondary">Los medicamentos de tus hijos, en orden</Typography>
      </Box>

      <LinearProgress variant="determinate" value={((step + 1) / total) * 100} sx={{ borderRadius: 2, mb: 4 }} />

      <Box sx={{ flexGrow: 1 }}>
        {step === 0 && (
          <Stack spacing={3}>
            <StepTitle icon="groups" title="Crea tu familia" subtitle="Un espacio compartido para organizar todo." />
            <TextField label="Nombre de la familia" value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Ej: Familia Valeirao" autoFocus />
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={3}>
            <StepTitle icon="child_care" title="Agrega a tu primer hijo" subtitle="Podrás agregar más después." />
            <TextField label="Nombre del hijo" value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Ej: Mateo" autoFocus />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Color
              </Typography>
              <Stack direction="row" spacing={1}>
                {CHILD_COLORS.map((c) => (
                  <Box
                    key={c}
                    onClick={() => setColor(c)}
                    sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: color === c ? '3px solid #191c1c' : '3px solid transparent' }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={3}>
            <StepTitle icon="person_add" title="Invita al otro papá o mamá" subtitle="Compartirán la misma información. Puedes saltar este paso." />
            <TextField label="Correo o teléfono (opcional)" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="correo@ejemplo.com" />
            <Chip icon={<Icon name="info" sx={{ fontSize: 18 }} />} label="La invitación se enviará al terminar" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ pt: 3 }}>
        {step > 0 && (
          <Button variant="text" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {step === 2 && (
          <Button variant="text" onClick={finish}>
            Saltar
          </Button>
        )}
        {step < 2 ? (
          <Button variant="contained" endIcon={<Icon name="arrow_forward" />} onClick={() => setStep((s) => s + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" onClick={finish}>
            Empezar
          </Button>
        )}
      </Stack>
    </Box>
  )
}

function StepTitle({ icon, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Icon name={icon} sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary">{subtitle}</Typography>
    </Box>
  )
}
