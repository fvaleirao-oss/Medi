import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import Icon from './Icon'

export default function ScreenHeader({ title, onBack, action }) {
  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.default', borderBottom: '1px solid #dde4e3' }}>
      <Toolbar sx={{ gap: 1 }}>
        {onBack && (
          <IconButton edge="start" onClick={onBack} aria-label="Volver">
            <Icon name="arrow_back" />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          {title}
        </Typography>
        {action && <Box>{action}</Box>}
      </Toolbar>
    </AppBar>
  )
}
