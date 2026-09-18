import { Box, Typography, Card, CardContent, Stack, Avatar, IconButton } from '@mui/material'
import dayjs from 'dayjs'
import ScreenHeader from '../components/ScreenHeader'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'

export default function History() {
  const { state, dispatch } = useApp()

  const grouped = state.doseLogs.reduce((acc, d) => {
    const day = dayjs(d.at).format('YYYY-MM-DD')
    ;(acc[day] = acc[day] || []).push(d)
    return acc
  }, {})
  const days = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1))

  return (
    <Box>
      <ScreenHeader title="Historial" />
      {state.doseLogs.length === 0 ? (
        <EmptyState icon="history" text="Aún no hay dosis registradas" />
      ) : (
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {days.map((day) => (
              <Box key={day}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {dayjs(day).format('dddd, D [de] MMMM')}
                </Typography>
                <Stack spacing={1}>
                  {grouped[day].map((d) => {
                    const child = state.children.find((c) => c.id === d.childId)
                    const product = state.products.find((p) => p.id === d.productId)
                    return (
                      <Card key={d.id}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Avatar sx={{ bgcolor: child?.color || 'grey.400', width: 34, height: 34 }}>
                            {child?.name?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {child?.name || 'Hijo'} · {product?.brand || 'Producto'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {d.doseAmount} {d.doseUnit} · {dayjs(d.at).format('HH:mm')}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={() => dispatch({ type: 'REMOVE_DOSE', payload: d.id })}>
                            <Icon name="delete" sx={{ fontSize: 18 }} />
                          </IconButton>
                        </CardContent>
                      </Card>
                    )
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
