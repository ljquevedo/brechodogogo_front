import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'

type FormData = {
  nome: string
  email: string
  senha: string
  cidade?: string
}

export default function Cadastro() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  async function aoEnviar(dados: FormData) {
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })

    if (!resposta.ok) {
      const erro = await resposta.json()
      toast.error(erro.erro ?? 'Não foi possível concluir o cadastro')
      return
    }

    const cliente = await resposta.json()
    login(cliente, true)
    toast.success('Cadastro realizado com sucesso!')
    navigate('/')
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Criar conta</h1>

      <form onSubmit={handleSubmit(aoEnviar)} className="flex flex-col gap-3">
        <div>
          <input
            type="text"
            placeholder="Nome completo"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
            {...register('nome', { required: 'Informe o nome' })}
          />
          {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
        </div>

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
            placeholder="Senha (mín. 6 caracteres)"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
            {...register('senha', {
              required: 'Informe a senha',
              minLength: { value: 6, message: 'A senha precisa ter ao menos 6 caracteres' },
            })}
          />
          {errors.senha && <p className="text-sm text-red-600">{errors.senha.message}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Cidade (opcional)"
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
            {...register('cidade')}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando...' : 'Cadastrar'}
        </button>
      </form>
    </main>
  )
}
