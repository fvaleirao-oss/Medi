import { createTheme } from '@mui/material/styles'

// Material 3 inspired teal palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00696e', light: '#4c9a9f', dark: '#003b3f', contrastText: '#ffffff' },
    secondary: { main: '#4a6365', light: '#b1cbcd' },
    error: { main: '#ba1a1a' },
    warning: { main: '#8a6d00' },
    success: { main: '#2e6b34' },
    background: { default: '#f5fafa', paper: '#ffffff' },
    text: { primary: '#191c1c', secondary: '#3f4948' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Roboto, system-ui, -apple-system, sans-serif',
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, border: '1px solid #dde4e3' } },
      defaultProps: { elevation: 0 },
    },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'default' } },
  },
})

export default theme
