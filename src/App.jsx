import { useState, createContext, useContext } from 'react'
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import Icon from './components/Icon'
import { useApp } from './store/AppContext'
import Onboarding from './screens/Onboarding'
import Today from './screens/Today'
import Children from './screens/Children'
import Cabinet from './screens/Cabinet'
import History from './screens/History'
import Settings from './screens/Settings'
import ProductForm from './screens/ProductForm'
import PrescriptionForm from './screens/PrescriptionForm'
import ChildDetail from './screens/ChildDetail'
import ProductDetail from './screens/ProductDetail'

const TABS = [
  { key: 'hoy', label: 'Hoy', icon: 'today' },
  { key: 'hijos', label: 'Hijos', icon: 'child_care' },
  { key: 'botiquin', label: 'Botiquín', icon: 'medical_services' },
  { key: 'historial', label: 'Historial', icon: 'history' },
  { key: 'ajustes', label: 'Ajustes', icon: 'settings' },
]

// Simple navigation: a tab + an optional overlay view stack.
const NavContext = createContext(null)
export const useNav = () => useContext(NavContext)

export default function App() {
  const { state } = useApp()
  const [tab, setTab] = useState('hoy')
  const [stack, setStack] = useState([]) // [{ name, params }]

  const push = (name, params = {}) => setStack((s) => [...s, { name, params }])
  const pop = () => setStack((s) => s.slice(0, -1))
  const reset = () => setStack([])
  const goTab = (t) => {
    setStack([])
    setTab(t)
  }

  if (!state.onboarded || !state.family) {
    return <Onboarding />
  }

  const overlay = stack[stack.length - 1]

  const renderOverlay = () => {
    switch (overlay?.name) {
      case 'productForm':
        return <ProductForm {...overlay.params} />
      case 'prescriptionForm':
        return <PrescriptionForm {...overlay.params} />
      case 'childDetail':
        return <ChildDetail {...overlay.params} />
      case 'productDetail':
        return <ProductDetail {...overlay.params} />
      default:
        return null
    }
  }

  const renderTab = () => {
    switch (tab) {
      case 'hoy':
        return <Today />
      case 'hijos':
        return <Children />
      case 'botiquin':
        return <Cabinet />
      case 'historial':
        return <History />
      case 'ajustes':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <NavContext.Provider value={{ push, pop, reset, goTab, tab }}>
      <Box sx={{ pb: 9, minHeight: '100vh', maxWidth: 520, mx: 'auto' }}>
        {overlay ? renderOverlay() : renderTab()}
      </Box>

      {!overlay && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, borderTop: '1px solid #dde4e3' }} elevation={0}>
          <Box sx={{ maxWidth: 520, mx: 'auto' }}>
            <BottomNavigation value={tab} onChange={(_, v) => goTab(v)} showLabels>
              {TABS.map((t) => (
                <BottomNavigationAction key={t.key} value={t.key} label={t.label} icon={<Icon name={t.icon} />} />
              ))}
            </BottomNavigation>
          </Box>
        </Paper>
      )}
    </NavContext.Provider>
  )
}
