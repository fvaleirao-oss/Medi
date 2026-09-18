import { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, Button, TextField, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton,
} from '@mui/material'
import ScreenHeader from '../components/ScreenHeader'
import Icon from '../components/Icon'
import { useApp } from '../store/AppContext'

export default function Settings() {
  const { state, dispatch } = useApp()
  const [familyName, setFamilyName] = useState(state.family?.name || '')
  const [invite, setInvite] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const members = state.family?.members || []

  const saveName = () => dispatch({ type: 'SET_FAMILY', payload: { name: familyName.trim() || 'Mi familia' } })

  const addMember = () => {
    if (!invite.trim()) return
    dispatch({ type: 'SET_FAMILY', payload: { members: [...members, { name: invite.trim(), role: 'invitado', invited: true }] } })
    setInvite('')
  }

  const removeMember = (i) =>
    dispatch({ type: 'SET_FAMILY', payload: { members: members.filter((_, idx) => idx !== i) } })

  return (
    <Box>
      <ScreenHeader title="Ajustes" />
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Familia</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField label="Nombre de la familia" value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
                <Button variant="contained" onClick={saveName}>Guardar</Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Miembros</Typography>
              <List dense disablePadding>
                {members.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Aún no has invitado a nadie más.</Typography>
                )}
                {members.map((m, i) => (
                  <ListItem key={i} disableGutters secondaryAction={<IconButton edge="end" onClick={() => removeMember(i)}><Icon name="close" sx={{ fontSize: 20 }} /></IconButton>}>
                    <ListItemAvatar><Avatar sx={{ bgcolor: 'secondary.main' }}>{m.name.charAt(0).toUpperCase()}</Avatar></ListItemAvatar>
                    <ListItemText primary={m.name} secondary={m.invited ? 'Invitación pendiente' : m.role} />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', mt: 1 }}>
                <TextField label="Invitar (correo o teléfono)" value={invite} onChange={(e) => setInvite(e.target.value)} />
                <Button variant="outlined" startIcon={<Icon name="person_add" />} onClick={addMember}>Invitar</Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Datos</Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">{state.children.length} hijo(s)</Typography>
                <Typography variant="body2">{state.products.length} producto(s) en el botiquín</Typography>
                <Typography variant="body2">{state.prescriptions.length} receta(s)</Typography>
                <Typography variant="body2">{state.doseLogs.length} dosis registradas</Typography>
              </Stack>
              <Button color="error" startIcon={<Icon name="restart_alt" />} sx={{ mt: 2 }} onClick={() => setConfirmReset(true)}>
                Borrar todos los datos
              </Button>
            </CardContent>
          </Card>

          <Typography variant="caption" color="text.secondary" align="center">Medi · versión 0.1.0</Typography>
        </Stack>
      </Box>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)}>
        <DialogTitle>¿Borrar todos los datos?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esto elimina hijos, productos, recetas e historial de este dispositivo. No se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmReset(false)}>Cancelar</Button>
          <Button color="error" onClick={() => { dispatch({ type: 'RESET' }); setConfirmReset(false) }}>Borrar todo</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
