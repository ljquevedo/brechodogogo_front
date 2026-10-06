import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import { mensagemDeErro } from './utils/formatos.ts'
import type { CategoriaType, CondicaoPeca } from './utils/types.ts'

type FormData = {
  descricao: string
  marca?: string
  tamanho: string
  preco: number
  categoriaId: number
  foto: string
  detalhes?: string
  condicao: CondicaoPeca
}

const campo =
  'w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600'

export default function VenderRoupa() {
  const { cliente, carregando } = useAuth()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState<CategoriaType[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { condicao: 'USADA' } })

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/categorias`)
      .then((resposta) => resposta.json())
      .then(setCategorias)
  }, [])

  const foto = watch('foto')

  async function aoEnviar(dados: FormData) {
    if (!cliente) return

    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/pecas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dados,
        preco: Number(dados.preco),
        categoriaId: Number(dados.categoriaId),
        marca: dados.marca || null,
        detalhes: dados.detalhes || null,
        clienteId: cliente.id,
      }),
    })

    if (!resposta.ok) {
      toast.error(await mensagemDeErro(resposta, 'Não foi possível publicar o anúncio'))
      return
    }

    toast.success('Anúncio enviado! Assim que for aprovado ele aparece na loja.')
    navigate('/minhas-vendas')
  }

  if (carregando) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  if (!cliente) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-800">Quero vender</h1>
        <p className="mb-4 text-gray-600">
          Para anunciar uma roupa e vender direto para outras pessoas, faça login primeiro.
        </p>
        <Link
          to="/login"
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
        >
          Entrar ou cadastrar
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Quero vender</h1>
      <p className="mb-6 text-gray-600">
        Anuncie sua roupa e fixe o preço. Depois que a equipe aprovar, ela aparece na loja e
        qualquer pessoa pode comprar ou enviar uma proposta. Você acompanha tudo em{' '}
        <Link to="/minhas-vendas" className="text-emerald-700 underline">
          Minhas vendas
        </Link>
        .
      </p>

      <form
        onSubmit={handleSubmit(aoEnviar)}
        className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="O que você quer vender? (ex.: Jaqueta jeans)"
            maxLength={60}
            className={campo}
            {...register('descricao', { required: 'Informe a descrição' })}
          />
          {errors.descricao && (
            <p className="text-sm text-red-600">{errors.descricao.message}</p>
          )}
        </div>

        <div>
          <select
            className={campo}
            {...register('categoriaId', { required: 'Escolha a categoria' })}
          >
            <option value="">Categoria...</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          {errors.categoriaId && (
            <p className="text-sm text-red-600">{errors.categoriaId.message}</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Marca (opcional)"
          maxLength={30}
          className={campo}
          {...register('marca')}
        />

        <div>
          <input
            type="text"
            placeholder="Tamanho (ex.: M, 40)"
            maxLength={5}
            className={campo}
            {...register('tamanho', { required: 'Informe o tamanho' })}
          />
          {errors.tamanho && <p className="text-sm text-red-600">{errors.tamanho.message}</p>}
        </div>

        <div>
          <input
            type="number"
            step="0.01"
            placeholder="Preço (R$)"
            className={campo}
            {...register('preco', {
              required: 'Informe o preço',
              valueAsNumber: true,
              min: { value: 0.01, message: 'O preço precisa ser maior que zero' },
            })}
          />
          {errors.preco && <p className="text-sm text-red-600">{errors.preco.message}</p>}
        </div>

        <select className={campo} {...register('condicao')}>
          <option value="NOVA">Nova</option>
          <option value="SEMINOVA">Seminova</option>
          <option value="USADA">Usada</option>
          <option value="COM_AVARIAS">Com avarias</option>
        </select>

        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Link (URL) de uma foto da peça"
            className={campo}
            {...register('foto', { required: 'Informe o link de uma foto' })}
          />
          {errors.foto && <p className="text-sm text-red-600">{errors.foto.message}</p>}
          {foto && foto.startsWith('http') && (
            <img
              src={foto}
              alt="Pré-visualização da foto"
              className="mt-2 h-32 rounded object-cover"
            />
          )}
        </div>

        <textarea
          placeholder="Detalhes (opcional): estado, defeitos, tempo de uso..."
          rows={3}
          className={`${campo} sm:col-span-2`}
          {...register('detalhes')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-2"
        >
          {isSubmitting ? 'Enviando...' : 'Publicar anúncio'}
        </button>
      </form>
    </main>
  )
}
