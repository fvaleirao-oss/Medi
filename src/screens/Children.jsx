import { useState } from 'react'
import {
  Box, Typography, Card, CardActionArea, CardContent, Avatar, Fab, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
} from '@mui/material'
import ScreenHeader from '../components/ScreenHeader'
import EmptyState from '../components/EmptyState'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'
import { useNav } from '../App'
import { CHILD_COLORS } from '../utils/constants'

export default function Children() {
  const { state, dispatch } = useApp()
  const nav = useNav()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(CHILD_COLORS[0])

  const add = () => {
    if (!name.trim()) return
    dispatch({ type: 'ADD_CHILD', payload: { name: name.trim(), color } })
    setName('')
    setColor(CHILD_COLORS[0])
    setOpen(false)
  }

  const activeCount = (childId) =>
    state.prescriptions.filter((p) => p.childId === childId && p.status === 'active').length

  return (
    <Box>
      <ScreenHeader title="Hijos" />
      {state.children.length === 0 ? (
        <EmptyState icon="child_care" text="Agrega a tu primer hijo" actionLabel="Agregar hijo" onAction={() => setOpen(true)} />
      ) : (
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {state.children.map((c) => (
              <Card key={c.id}>
                <CardActionArea onClick={() => nav.push('childDetail', { id: c.id })}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: c.color || 'primary.main' }}>{c.name.charAt(0).toUpperCase()}</Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>{c.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activeCount(c.id) > 0 ? `${activeCount(c.id)} tratamiento(s) activo(s)` : 'Sin tratamientos activos'}
                      </Typography>
                    </Box>
                    <Icon name="chevron_right" sx={{ color: 'text.disabled' }} />
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {state.children.length > 0 && (
        <Fab color="primary" onClick={() => setOpen(true)} sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 5 }}>
          <Icon name="add" />
        </Fab>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Agregar hijo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>Color</Typography>
              <Stack direction="row" spacing={1}>
                {CHILD_COLORS.map((col) => (
                  <Box key={col} onClick={() => setColor(col)} sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: col, cursor: 'pointer', border: color === col ? '3px solid #191c1c' : '3px solid transparent' }} />
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={add} disabled={!name.trim()}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
