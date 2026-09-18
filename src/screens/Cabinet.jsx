import { Box, Typography, Card, CardActionArea, CardContent, Chip, Fab, Stack } from '@mui/material'
import ScreenHeader from '../components/ScreenHeader'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { componentPreview, expiryStatus, expiryLabel } from '../utils/format'

function ExpiryChip({ expiry }) {
  const status = expiryStatus(expiry)
  if (!status) return null
  const map = {
    expired: { color: 'error', icon: 'error' },
    soon: { color: 'warning', icon: 'warning' },
    ok: { color: 'default', icon: 'event_available' },
  }
  const cfg = map[status]
  return <Chip size="small" color={cfg.color} variant={status === 'ok' ? 'outlined' : 'filled'} icon={<Icon name={cfg.icon} sx={{ fontSize: 16 }} />} label={expiryLabel(expiry)} />
}

export default function Cabinet() {
  const { state } = useApp()
  const nav = useNav()

  const openNew = () => nav.push('productForm')

  return (
    <Box>
      <ScreenHeader title="Botiquín" />
      {state.products.length === 0 ? (
        <EmptyState icon="medical_services" text="Aún no hay medicamentos" actionLabel="Agregar medicamento" onAction={openNew} />
      ) : (
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {state.products.map((p) => (
              <Card key={p.id}>
                <CardActionArea onClick={() => nav.push('productDetail', { id: p.id })}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {p.photo ? (
                        <img src={p.photo} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="medication" sx={{ color: 'text.disabled' }} />
                        </Box>
                      )}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 500 }}>{p.brand}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {[p.lab, p.presentation].filter(Boolean).join(' · ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {p.components?.map(componentPreview).join('  ·  ')}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <ExpiryChip expiry={p.expiry} />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {state.products.length > 0 && (
        <Fab color="primary" onClick={openNew} sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 5, maxWidth: 520 }}>
          <Icon name="add" />
        </Fab>
      )}
    </Box>
  )
}
