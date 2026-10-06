import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export default function Titulo() {
  const { cliente, logout } = useAuth()

  return (
    <header className="flex items-center justify-between bg-emerald-800 px-6 py-4 text-white">
      <Link to="/" className="text-2xl font-bold">
        ♻️ Brechó do Gogó
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link to="/" className="underline hover:text-emerald-200">
          Quero comprar
        </Link>
        <Link to="/vender" className="underline hover:text-emerald-200">
          Quero vender
        </Link>

        {cliente ? (
          <>
            <span>
              Olá, <strong>{cliente.nome}</strong>
            </span>
            <Link to="/minhas-vendas" className="underline hover:text-emerald-200">
              Minhas vendas
            </Link>
            <Link to="/minhas-compras" className="underline hover:text-emerald-200">
              Minhas compras
            </Link>
            <button
              onClick={logout}
              className="rounded bg-emerald-900 px-3 py-1 hover:bg-emerald-950"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded bg-emerald-900 px-3 py-1 hover:bg-emerald-950"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  )
}
