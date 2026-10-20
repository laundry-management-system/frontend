import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface DashboardPageState {
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
}

const DashboardPageContext = createContext<DashboardPageState | null>(null)

export function DashboardPageProvider({ children }: { children: ReactNode }) {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const value = useMemo(() => ({ autoRefresh, setAutoRefresh }), [autoRefresh])
  return <DashboardPageContext.Provider value={value}>{children}</DashboardPageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardPage() {
  const ctx = useContext(DashboardPageContext)
  if (!ctx) throw new Error('useDashboardPage phải dùng bên trong DashboardPageProvider')
  return ctx
}
