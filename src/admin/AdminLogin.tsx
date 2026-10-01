import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { useAdminAuth } from '../context/AdminAuthContext.tsx'

type FormData = {
  email: string
  senha: string
}

export default function AdminLogin() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  async function aoEnviar(dados: FormData) {
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })

    if (!resposta.ok) {
      const erro = await resposta.json()
      toast.error(erro.erro ?? 'Não foi possível entrar')
      return
    }

    const admin = await resposta.json()
    login(admin)
    navigate('/admin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Área Restrita — Admin
        </h1>

        <form onSubmit={handleSubmit(aoEnviar)} className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              placeholder="E-mail"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-gray-600"
              {...register('email', { required: 'Informe o e-mail' })}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-gray-600"
              {...register('senha', { required: 'Informe a senha' })}
            />
            {errors.senha && <p className="text-sm text-red-600">{errors.senha.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
      <Toaster richColors position="top-center" />
    </main>
  )
}
