import { useState } from 'react'
import { Box, Typography, Card, CardContent, Stack, Button, Avatar, Chip, Snackbar, Alert } from '@mui/material'
import dayjs from 'dayjs'
import ScreenHeader from '../components/ScreenHeader'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { expiryStatus, convertDose } from '../utils/format'

export default function Today() {
  const { state, dispatch } = useApp()
  const [toast, setToast] = useState(null)

  const active = state.prescriptions.filter((p) => p.status === 'active')

  const lastDose = (prId) => state.doseLogs.find((d) => d.prescriptionId === prId)

  const giveDose = (pr, product, child) => {
    if (expiryStatus(product.expiry) === 'expired') return setToast({ sev: 'error', msg: 'Producto vencido: no se puede dar dosis.' })
    if (!product.photo) return setToast({ sev: 'warning', msg: 'Agrega la foto de la caja antes de la primera dosis.' })
    dispatch({ type: 'LOG_DOSE', payload: { childId: child.id, prescriptionId: pr.id, productId: product.id, doseAmount: pr.doseAmount, doseUnit: pr.doseUnit } })
    setToast({ sev: 'success', msg: `Dosis registrada para ${child.name}.` })
  }

  return (
    <Box>
      <ScreenHeader title="Hoy" />
      {active.length === 0 ? (
        <EmptyState icon="event_available" text="No hay dosis pendientes" />
      ) : (
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {active.map((pr) => {
              const product = state.products.find((p) => p.id === pr.productId)
              const child = state.children.find((c) => c.id === pr.childId)
              if (!product || !child) return null
              const expired = expiryStatus(product.expiry) === 'expired'
              const last = lastDose(pr.id)
              const conv = convertDose(product.components?.[0], pr.doseAmount, pr.doseUnit)
              const nextAt = last ? dayjs(last.at).add(Number(pr.freqFrom) || 0, 'hour') : null
              return (
                <Card key={pr.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: child.color, width: 36, height: 36 }}>{child.name.charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 500 }} noWrap>{child.name} · {product.brand}</Typography>
                        <Typography variant="body2" color="text.secondary">{pr.doseAmount} {pr.doseUnit} · cada {pr.freqFrom} h</Typography>
                      </Box>
                      {expired && <Chip size="small" color="error" label="Vencido" />}
                    </Box>
                    {conv && <Typography variant="caption" color="primary">{conv.text}</Typography>}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {last ? `Última: ${dayjs(last.at).format('DD/MM HH:mm')}${nextAt ? ` · Próxima: ${nextAt.format('HH:mm')}` : ''}` : 'Aún sin dosis registradas'}
                      </Typography>
                      <Button size="small" variant="contained" startIcon={<Icon name="medication_liquid" />} disabled={expired} onClick={() => giveDose(pr, product, child)}>
                        Dar dosis
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        </Box>
      )}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? <Alert severity={toast.sev} onClose={() => setToast(null)}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}
