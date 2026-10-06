import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'

type FormData = {
  email: string
  senha: string
  manterConectado: boolean
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { manterConectado: true } })

  async function aoEnviar(dados: FormData) {
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/clientes/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: dados.email, senha: dados.senha }),
    })

    if (!resposta.ok) {
      const erro = await resposta.json()
      toast.error(erro.erro ?? 'Não foi possível entrar')
      return
    }

    const cliente = await resposta.json()
    login(cliente, dados.manterConectado)
    toast.success(`Bem-vindo(a), ${cliente.nome}!`)
    navigate('/')
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Login</h1>

      <form onSubmit={handleSubmit(aoEnviar)} className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            placeholder="E-mail"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
            {...register('email', { required: 'Informe o e-mail' })}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
            {...register('senha', { required: 'Informe a senha' })}
          />
          {errors.senha && <p className="text-sm text-red-600">{errors.senha.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" {...register('manterConectado')} />
          Manter conectado neste dispositivo
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Ainda não tem conta?{' '}
        <Link to="/cadastro" className="text-emerald-700 underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  )
}
