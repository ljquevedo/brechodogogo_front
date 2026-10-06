import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ClienteType } from '../utils/types.ts'

type AuthContextType = {
  cliente: ClienteType | null
  carregando: boolean
  login: (cliente: ClienteType, manterConectado: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CHAVE_LOCALSTORAGE = 'clienteKey'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<ClienteType | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function restaurarSessao() {
      const id = localStorage.getItem(CHAVE_LOCALSTORAGE)
      if (!id) {
        setCarregando(false)
        return
      }
      try {
        const resposta = await fetch(`${import.meta.env.VITE_API_URL}/clientes/${id}`)
        if (!resposta.ok) throw new Error('Sessão inválida')
        const dados: ClienteType = await resposta.json()
        setCliente(dados)
      } catch {
        localStorage.removeItem(CHAVE_LOCALSTORAGE)
      } finally {
        setCarregando(false)
      }
    }
    restaurarSessao()
  }, [])

  function login(clienteLogado: ClienteType, manterConectado: boolean) {
    setCliente(clienteLogado)
    if (manterConectado) {
      localStorage.setItem(CHAVE_LOCALSTORAGE, clienteLogado.id)
    }
  }

  function logout() {
    setCliente(null)
    localStorage.removeItem(CHAVE_LOCALSTORAGE)
  }

  return (
    <AuthContext.Provider value={{ cliente, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth precisa estar dentro de um AuthProvider')
  return contexto
}
