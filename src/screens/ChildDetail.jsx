import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, Button, Chip, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert,
} from '@mui/material'
import ScreenHeader from '../components/ScreenHeader'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { componentPreview, expiryStatus, convertDose } from '../utils/format'

export default function ChildDetail({ id }) {
  const { state, dispatch } = useApp()
  const nav = useNav()
  const [toast, setToast] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const child = state.children.find((c) => c.id === id)
  if (!child) return <ScreenHeader title="Hijo" onBack={nav.pop} />

  const prescriptions = state.prescriptions.filter((p) => p.childId === id)
  const productOf = (pid) => state.products.find((p) => p.id === pid)

  const giveDose = (pr) => {
    const product = productOf(pr.productId)
    if (!product) return setToast({ sev: 'error', msg: 'El producto ya no existe.' })
    if (expiryStatus(product.expiry) === 'expired') return setToast({ sev: 'error', msg: 'Producto vencido: no se puede dar dosis.' })
    if (!product.photo) return setToast({ sev: 'warning', msg: 'Agrega la foto de la caja antes de la primera dosis.' })
    dispatch({
      type: 'LOG_DOSE',
      payload: { childId: id, prescriptionId: pr.id, productId: product.id, doseAmount: pr.doseAmount, doseUnit: pr.doseUnit },
    })
    setToast({ sev: 'success', msg: `Dosis registrada para ${child.name}.` })
  }

  return (
    <Box>
      <ScreenHeader title={child.name} onBack={nav.pop} />
      <Box sx={{ p: 2 }}>
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: child.color, width: 48, height: 48 }}>{child.name.charAt(0).toUpperCase()}</Avatar>
            <Box>
              <Typography variant="h6">{child.name}</Typography>
              <Typography variant="body2" color="text.secondary">{prescriptions.length} medicamento(s)</Typography>
            </Box>
          </CardContent>
        </Card>

        <Button fullWidth variant="contained" startIcon={<Icon name="add" />} onClick={() => nav.push('prescriptionForm', { childId: id })} sx={{ mb: 2 }}>
          Agregar medicamento
        </Button>

        {prescriptions.length === 0 ? (
          <EmptyState icon="prescriptions" text="Este hijo aún no tiene medicamentos" />
        ) : (
          <Stack spacing={1.5}>
            {prescriptions.map((pr) => {
              const product = productOf(pr.productId)
              const expired = product && expiryStatus(product.expiry) === 'expired'
              const conv = product && convertDose(product.components?.[0], pr.doseAmount, pr.doseUnit)
              return (
                <Card key={pr.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 500 }} noWrap>{product?.brand || 'Producto eliminado'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pr.doseAmount} {pr.doseUnit} · {pr.route} · cada {pr.freqFrom}{pr.freqTo && pr.freqTo !== pr.freqFrom ? `–${pr.freqTo}` : ''} h
                        </Typography>
                        {pr.reason && <Typography variant="body2" color="text.secondary">Para: {pr.reason}</Typography>}
                        {conv && <Typography variant="caption" color="primary">{conv.text}</Typography>}
                      </Box>
                      <Chip size="small" label={pr.status === 'active' ? 'En tratamiento' : 'En botiquín'} color={pr.status === 'active' ? 'success' : 'default'} variant={pr.status === 'active' ? 'filled' : 'outlined'} />
                    </Box>
                    {expired && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        <Icon name="error" sx={{ fontSize: 14, verticalAlign: 'middle' }} /> Producto vencido
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Button size="small" variant="contained" startIcon={<Icon name="medication_liquid" />} disabled={expired} onClick={() => giveDose(pr)}>
                        Dar dosis
                      </Button>
                      {pr.status !== 'active' && (
                        <Button size="small" onClick={() => dispatch({ type: 'UPDATE_PRESCRIPTION', payload: { id: pr.id, status: 'active' } })}>
                          Empezar tratamiento
                        </Button>
                      )}
                      <Box sx={{ flexGrow: 1 }} />
                      <IconButton size="small" onClick={() => setConfirmDel(pr.id)}>
                        <Icon name="delete" sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      <Dialog open={!!confirmDel} onClose={() => setConfirmDel(null)}>
        <DialogTitle>¿Quitar este medicamento?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel(null)}>Cancelar</Button>
          <Button color="error" onClick={() => { dispatch({ type: 'REMOVE_PRESCRIPTION', payload: confirmDel }); setConfirmDel(null) }}>Quitar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {toast ? <Alert severity={toast.sev} onClose={() => setToast(null)}>{toast.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}
