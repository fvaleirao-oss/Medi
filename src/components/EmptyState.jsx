import { Box, Button, Typography } from '@mui/material'
import Icon from './Icon'

// Google-style empty state: gray outlined Material icon, one line, one button.
export default function EmptyState({ icon, text, actionLabel, onAction }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
        py: 8,
        px: 3,
        minHeight: '50vh',
      }}
    >
      <Icon name={icon} sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography variant="body1" color="text.secondary">
        {text}
      </Typography>
      {actionLabel && (
        <Button variant="contained" startIcon={<Icon name="add" />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
