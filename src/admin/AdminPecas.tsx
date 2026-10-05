import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { CategoriaType, PecaType } from '../utils/types.ts'

type FormData = {
  descricao: string
  marca?: string
  tamanho: string
  preco: number
  foto: string
  detalhes?: string
  condicao: 'NOVA' | 'SEMINOVA' | 'USADA' | 'COM_AVARIAS'
  categoriaId: number
}

export default function AdminPecas() {
  const [pecas, setPecas] = useState<PecaType[]>([])
  const [categorias, setCategorias] = useState<CategoriaType[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({ defaultValues: { condicao: 'SEMINOVA' } })

  function carregarPecas() {
    fetch(`${import.meta.env.VITE_API_URL}/pecas`)
      .then((resposta) => resposta.json())
      .then(setPecas)
  }

  useEffect(() => {
    carregarPecas()
    fetch(`${import.meta.env.VITE_API_URL}/categorias`)
      .then((resposta) => resposta.json())
      .then(setCategorias)
  }, [])

  async function aoEnviar(dados: FormData) {
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/pecas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...dados,
        preco: Number(dados.preco),
        categoriaId: Number(dados.categoriaId),
      }),
    })

    if (!resposta.ok) {
      const erro = await resposta.json()
      toast.error(erro.erro ?? 'Não foi possível cadastrar a peça')
      return
    }

    toast.success('Peça cadastrada! Os dados extras da IA podem levar alguns segundos.')
    reset()
    setMostrarForm(false)
    carregarPecas()
  }

  async function excluir(id: number) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${id}`, {
      method: 'DELETE',
    })
    if (!r.ok) {
      toast.error('Não foi possível excluir a peça.')
      return
    }
    toast.success('Peça excluída.')
    carregarPecas()
  }

  async function alternarDestaque(peca: PecaType) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${peca.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destaque: !peca.destaque }),
    })
    if (!r.ok) {
      toast.error('Não foi possível atualizar o destaque.')
      return
    }
    carregarPecas()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cadastro de Peças</h1>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
        >
          {mostrarForm ? 'Cancelar' : '+ Nova Peça'}
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit(aoEnviar)}
          className="mb-8 grid grid-cols-1 gap-3 rounded-lg bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <input
            placeholder="Descrição"
            className="rounded border border-gray-300 px-3 py-2"
            {...register('descricao', { required: true })}
          />
          <input
            placeholder="Marca (opcional)"
            className="rounded border border-gray-300 px-3 py-2"
            {...register('marca')}
          />
          <input
            placeholder="Tamanho (ex.: M, 40)"
            className="rounded border border-gray-300 px-3 py-2"
            {...register('tamanho', { required: true })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Preço"
            className="rounded border border-gray-300 px-3 py-2"
            {...register('preco', { required: true, valueAsNumber: true })}
          />
          <input
            placeholder="URL da foto"
            className="rounded border border-gray-300 px-3 py-2 sm:col-span-2"
            {...register('foto', { required: true })}
          />
          <textarea
            placeholder="Detalhes (opcional)"
            className="rounded border border-gray-300 px-3 py-2 sm:col-span-2"
            {...register('detalhes')}
          />

          <select
            className="rounded border border-gray-300 px-3 py-2"
            {...register('condicao')}
          >
            <option value="NOVA">Nova</option>
            <option value="SEMINOVA">Seminova</option>
            <option value="USADA">Usada</option>
            <option value="COM_AVARIAS">Com avarias</option>
          </select>

          <select
            className="rounded border border-gray-300 px-3 py-2"
            {...register('categoriaId', { required: true, valueAsNumber: true })}
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Peça'}
          </button>
        </form>
      )}

      <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
        <thead className="bg-gray-800 text-left text-sm text-white">
          <tr>
            <th className="p-3">Foto</th>
            <th className="p-3">Descrição</th>
            <th className="p-3">Categoria</th>
            <th className="p-3">Tamanho</th>
            <th className="p-3">Preço</th>
            <th className="p-3">Destaque</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {pecas.map((peca) => (
            <tr key={peca.id} className="border-t border-gray-100">
              <td className="p-3">
                <img src={peca.foto} alt={peca.descricao} className="h-10 w-10 rounded object-cover" />
              </td>
              <td className="p-3">{peca.descricao}</td>
              <td className="p-3">{peca.categoria.nome}</td>
              <td className="p-3">{peca.tamanho}</td>
              <td className="p-3">R$ {Number(peca.preco).toFixed(2)}</td>
              <td className="p-3">
                <button onClick={() => alternarDestaque(peca)} title="Alternar destaque">
                  {peca.destaque ? '⭐' : '☆'}
                </button>
              </td>
              <td className="p-3">
                <button
                  onClick={() => excluir(peca.id)}
                  className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                >
                  🗑 Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
