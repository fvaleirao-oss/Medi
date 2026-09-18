import { createContext, useContext, useEffect, useReducer } from 'react'

const STORAGE_KEY = 'medi.state.v1'

// The app starts COMPLETELY EMPTY. No demo data, no seeded catalogs.
const emptyState = {
  onboarded: false,
  family: null, // { id, name, members: [{name, role}] }
  children: [], // { id, name, birthdate, color }
  products: [], // botiquín — see ProductForm for shape
  prescriptions: [], // recetas linking a child + product
  doseLogs: [], // history of administered doses
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    return { ...emptyState, ...JSON.parse(raw) }
  } catch {
    return emptyState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return emptyState

    case 'COMPLETE_ONBOARDING':
      return { ...state, onboarded: true }

    case 'SET_FAMILY':
      return { ...state, family: { id: state.family?.id || uid(), members: [], ...state.family, ...action.payload } }

    case 'ADD_CHILD':
      return { ...state, children: [...state.children, { id: uid(), ...action.payload }] }
    case 'UPDATE_CHILD':
      return { ...state, children: state.children.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)) }
    case 'REMOVE_CHILD':
      return {
        ...state,
        children: state.children.filter((c) => c.id !== action.payload),
        prescriptions: state.prescriptions.filter((p) => p.childId !== action.payload),
      }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, { id: uid(), createdAt: Date.now(), ...action.payload }] }
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)) }
    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) }

    case 'ADD_PRESCRIPTION':
      return { ...state, prescriptions: [...state.prescriptions, { id: uid(), createdAt: Date.now(), ...action.payload }] }
    case 'UPDATE_PRESCRIPTION':
      return { ...state, prescriptions: state.prescriptions.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)) }
    case 'REMOVE_PRESCRIPTION':
      return { ...state, prescriptions: state.prescriptions.filter((p) => p.id !== action.payload) }

    case 'LOG_DOSE':
      return { ...state, doseLogs: [{ id: uid(), at: Date.now(), ...action.payload }, ...state.doseLogs] }
    case 'REMOVE_DOSE':
      return { ...state, doseLogs: state.doseLogs.filter((d) => d.id !== action.payload) }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [state])

  return <AppContext.Provider value={{ state, dispatch, uid }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
