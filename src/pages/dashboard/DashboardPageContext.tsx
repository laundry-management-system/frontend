import { createContext, useContext, useState, type ReactNode } from 'react'

interface DashboardPageState {
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
}

const DashboardPageContext = createContext<DashboardPageState | null>(null)

/** State chỉ dùng trong trang dashboard; Provider đặt ở page nên rời trang là mất. */
export function DashboardPageProvider({ children }: { children: ReactNode }) {
  const [autoRefresh, setAutoRefresh] = useState(false)
  return (
    <DashboardPageContext.Provider value={{ autoRefresh, setAutoRefresh }}>
      {children}
    </DashboardPageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDashboardPage() {
  const ctx = useContext(DashboardPageContext)
  if (!ctx) throw new Error('useDashboardPage phải dùng bên trong DashboardPageProvider')
  return ctx
}
