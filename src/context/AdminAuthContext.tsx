import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AdminType } from '../utils/types.ts'

type AdminAuthContextType = {
  admin: AdminType | null
  login: (admin: AdminType) => void
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const CHAVE_LOCALSTORAGE = 'adminSessao'

function lerAdminSalvo(): AdminType | null {
  const bruto = localStorage.getItem(CHAVE_LOCALSTORAGE)
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as AdminType
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminType | null>(lerAdminSalvo)

  function login(adminLogado: AdminType) {
    setAdmin(adminLogado)
    localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(adminLogado))
  }

  function logout() {
    setAdmin(null)
    localStorage.removeItem(CHAVE_LOCALSTORAGE)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const contexto = useContext(AdminAuthContext)
  if (!contexto) throw new Error('useAdminAuth precisa estar dentro de um AdminAuthProvider')
  return contexto
}
