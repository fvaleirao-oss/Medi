import { useState } from 'react'
import { Box, Typography, Card, CardContent, Stack, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ScreenHeader from '../components/ScreenHeader'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { componentPreview, expiryLabel, expiryStatus } from '../utils/format'

export default function ProductDetail({ id }) {
  const { state, dispatch } = useApp()
  const nav = useNav()
  const [confirm, setConfirm] = useState(false)
  const p = state.products.find((x) => x.id === id)
  if (!p) return <ScreenHeader title="Producto" onBack={nav.pop} />

  const status = expiryStatus(p.expiry)
  const usedIn = state.prescriptions.filter((pr) => pr.productId === id).length

  const remove = () => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: id })
    nav.pop()
  }

  return (
    <Box>
      <ScreenHeader
        title={p.brand}
        onBack={nav.pop}
        action={<Button startIcon={<Icon name="edit" />} onClick={() => nav.push('productForm', { initial: p })}>Editar</Button>}
      />
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {p.photo && <img src={p.photo} alt="caja" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 16 }} />}

          {status && status !== 'ok' && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5, borderRadius: 2, bgcolor: status === 'expired' ? '#fdeded' : '#fff8e1' }}>
              <Icon name={status === 'expired' ? 'error' : 'warning'} sx={{ color: status === 'expired' ? 'error.main' : 'warning.main' }} />
              <Typography variant="body2">
                {status === 'expired' ? 'Producto vencido: no se puede usar para dar dosis.' : 'Este producto está por vencer.'}
              </Typography>
            </Box>
          )}

          <Card>
            <CardContent>
              <Row label="Marca" value={p.brand} />
              <Row label="Laboratorio" value={p.lab || '—'} />
              <Row label="Presentación" value={p.presentation || '—'} />
              <Row label="Frasco" value={p.bottleSize ? `${p.bottleSize} ${p.bottleUnit}` : '—'} />
              <Row label="Vencimiento" value={expiryLabel(p.expiry) || '—'} />
              {p.note && <Row label="Nota" value={p.note} />}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Componentes</Typography>
              {p.components?.map((c, i) => (
                <Typography key={i}>{componentPreview(c)}</Typography>
              ))}
            </CardContent>
          </Card>

          <Typography variant="caption" color="text.secondary">
            {usedIn > 0 ? `Usado en ${usedIn} receta(s).` : 'Aún no se usa en ninguna receta.'}
          </Typography>

          <Button color="error" startIcon={<Icon name="delete" />} onClick={() => setConfirm(true)}>
            Eliminar producto
          </Button>
        </Stack>
      </Box>

      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>¿Eliminar este producto?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Se quitará del botiquín. Las recetas que lo usan quedarán sin producto asociado.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancelar</Button>
          <Button color="error" onClick={remove}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', py: 0.75, gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>{label}</Typography>
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{value}</Typography>
    </Box>
  )
}
