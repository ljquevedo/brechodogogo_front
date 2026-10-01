import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

export default function Titulo() {
  const { cliente, logout } = useAuth()

  return (
    <header className="flex items-center justify-between bg-emerald-800 px-6 py-4 text-white">
      <Link to="/" className="text-2xl font-bold">
        ♻️ Brechó Recomeço
      </Link>

      {cliente ? (
        <div className="flex items-center gap-4 text-sm">
          <span>
            Olá, <strong>{cliente.nome}</strong>
          </span>
          <Link to="/minhas-propostas" className="underline hover:text-emerald-200">
            Minhas Propostas
          </Link>
          <button
            onClick={logout}
            className="rounded bg-emerald-900 px-3 py-1 hover:bg-emerald-950"
          >
            Sair
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="rounded bg-emerald-900 px-3 py-1 text-sm hover:bg-emerald-950"
        >
          Identifique-se
        </Link>
      )}
    </header>
  )
}
