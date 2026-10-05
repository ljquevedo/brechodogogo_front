import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import type { CondicaoPeca, OfertaVendaType } from './utils/types.ts'

type FormData = {
  descricao: string
  marca?: string
  tamanho: string
  precoDesejado: number
  foto: string
  detalhes?: string
  condicao: CondicaoPeca
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Aguardando análise',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

const STATUS_COR: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  ACEITA: 'bg-emerald-100 text-emerald-800',
  RECUSADA: 'bg-red-100 text-red-800',
}

const campo =
  'w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600'

export default function VenderRoupa() {
  const { cliente, carregando } = useAuth()
  const [ofertas, setOfertas] = useState<OfertaVendaType[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { condicao: 'USADA' } })

  const carregarOfertas = useCallback(() => {
    if (!cliente) return
    fetch(`${import.meta.env.VITE_API_URL}/ofertas/cliente/${cliente.id}`)
      .then((resposta) => resposta.json())
      .then(setOfertas)
  }, [cliente])

  useEffect(() => {
    carregarOfertas()
  }, [carregarOfertas])

  async function aoEnviar(dados: FormData) {
    if (!cliente) return

    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/ofertas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dados,
        marca: dados.marca || null,
        detalhes: dados.detalhes || null,
        clienteId: cliente.id,
      }),
    })

    if (!resposta.ok) {
      const erro = await resposta.json()
      toast.error(erro.erro ?? 'Não foi possível enviar a oferta')
      return
    }

    toast.success('Oferta enviada! Em breve respondemos por aqui.')
    reset()
    carregarOfertas()
  }

  if (carregando) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  if (!cliente) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12 text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-800">Quero vender</h1>
        <p className="mb-4 text-gray-600">
          Para oferecer uma roupa ao Brechó do Gogó, identifique-se primeiro.
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Quero vender</h1>
      <p className="mb-6 text-gray-600">
        Tem uma roupa em bom estado? Conte para a gente e diga quanto gostaria de
        receber. Nossa equipe analisa e responde aqui mesmo.
      </p>

      <form
        onSubmit={handleSubmit(aoEnviar)}
        className="mb-10 grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="O que você quer vender? (ex.: Jaqueta jeans)"
            className={campo}
            {...register('descricao', { required: 'Informe a descrição' })}
          />
          {errors.descricao && (
            <p className="text-sm text-red-600">{errors.descricao.message}</p>
          )}
        </div>

        <input type="text" placeholder="Marca (opcional)" className={campo} {...register('marca')} />

        <div>
          <input
            type="text"
            placeholder="Tamanho (ex.: M, 40)"
            className={campo}
            {...register('tamanho', { required: 'Informe o tamanho' })}
          />
          {errors.tamanho && <p className="text-sm text-red-600">{errors.tamanho.message}</p>}
        </div>

        <div>
          <input
            type="number"
            step="0.01"
            placeholder="Quanto quer receber (R$)"
            className={campo}
            {...register('precoDesejado', {
              required: 'Informe o valor',
              valueAsNumber: true,
              min: { value: 0.01, message: 'O valor precisa ser maior que zero' },
            })}
          />
          {errors.precoDesejado && (
            <p className="text-sm text-red-600">{errors.precoDesejado.message}</p>
          )}
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
          {isSubmitting ? 'Enviando...' : 'Enviar oferta'}
        </button>
      </form>

      <h2 className="mb-3 text-xl font-bold text-gray-800">Minhas ofertas de venda</h2>

      {ofertas.length === 0 ? (
        <p className="text-gray-500">Você ainda não ofereceu nenhuma peça.</p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Valor desejado</th>
              <th className="p-3">Resposta</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ofertas.map((oferta) => (
              <tr key={oferta.id} className="border-t border-gray-100">
                <td className="flex items-center gap-2 p-3">
                  <img
                    src={oferta.foto}
                    alt={oferta.descricao}
                    className="h-12 w-12 rounded object-cover"
                  />
                  {oferta.descricao}
                </td>
                <td className="p-3">
                  {Number(oferta.precoDesejado).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="p-3">{oferta.resposta ?? '—'}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COR[oferta.status]}`}
                  >
                    {STATUS_LABEL[oferta.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
