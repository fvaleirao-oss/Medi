import { Box } from '@mui/material'

// Thin wrapper around Material Symbols Outlined so we get the exact
// Google "outlined" icon set the spec asks for, with sx support.
export default function Icon({ name, sx, fill = 0, ...props }) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...sx }}
      {...props}
    >
      {name}
    </Box>
  )
}
