import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAdminAuth } from '../context/AdminAuthContext.tsx'

const linkClasse = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-2 text-sm ${
    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800'
  }`

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!admin) navigate('/admin/login')
  }, [admin, navigate])

  if (!admin) return null

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-gray-900 p-4">
        <h2 className="mb-6 text-lg font-bold text-white">Brechó Recomeço</h2>
        <nav className="flex flex-col gap-1">
          <NavLink to="/admin" end className={linkClasse}>
            Visão Geral
          </NavLink>
          <NavLink to="/admin/pecas" className={linkClasse}>
            Cadastro de Peças
          </NavLink>
          <NavLink to="/admin/clientes" className={linkClasse}>
            Controle de Clientes
          </NavLink>
          <NavLink to="/admin/propostas" className={linkClasse}>
            Controle de Propostas
          </NavLink>
          <button
            onClick={() => {
              logout()
              navigate('/admin/login')
            }}
            className="mt-4 rounded px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800"
          >
            Sair do Sistema
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>

      <Toaster richColors position="top-center" />
    </div>
  )
}
