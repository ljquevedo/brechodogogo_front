import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CampoFoto from '../components/CampoFoto.tsx'
import { ANUNCIO_COR, ANUNCIO_LABEL, NOME_DA_CASA, mensagemDeErro, moeda } from '../utils/formatos.ts'
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
  const [motivos, setMotivos] = useState<Record<number, string>>({})
  const [gerandoIA, setGerandoIA] = useState<number | 'todas' | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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
      toast.error(await mensagemDeErro(r, 'Não foi possível excluir a peça.'))
      return
    }
    toast.success('Peça excluída.')
    carregarPecas()
  }

  async function moderar(peca: PecaType, acao: 'APROVAR' | 'REPROVAR') {
    const motivo = motivos[peca.id]?.trim()
    if (acao === 'REPROVAR' && !motivo) {
      toast.error('Escreva o motivo da reprovação.')
      return
    }
    const r = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${peca.id}/moderar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, motivo }),
    })
    if (!r.ok) {
      toast.error(await mensagemDeErro(r, 'Não foi possível moderar o anúncio.'))
      return
    }
    toast.success(acao === 'APROVAR' ? 'Anúncio aprovado e publicado na loja!' : 'Anúncio reprovado.')
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

  const temIA = (p: PecaType) => Boolean(p.materialProvavel || p.dicasCuidado || p.epocaEstimada)

  // devolve true se gerou; `silencioso` evita um aviso por peça no modo "todas"
  async function gerarIA(peca: PecaType, silencioso = false): Promise<boolean> {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${peca.id}/gerar-ia`, {
      method: 'POST',
    })
    if (!r.ok) {
      if (!silencioso) toast.error(await mensagemDeErro(r, 'Não foi possível gerar os dados de IA.'))
      return false
    }
    if (!silencioso) toast.success(`Dados de IA gerados para "${peca.descricao}".`)
    return true
  }

  async function gerarIAUma(peca: PecaType) {
    setGerandoIA(peca.id)
    await gerarIA(peca)
    setGerandoIA(null)
    carregarPecas()
  }

  // uma de cada vez, para não estourar o limite de chamadas da IA
  async function gerarIATodas() {
    const alvo = pecas.filter((p) => !temIA(p) && p.status !== 'REPROVADA')
    if (alvo.length === 0) return
    setGerandoIA('todas')
    let ok = 0
    for (const peca of alvo) {
      if (await gerarIA(peca, true)) ok++
    }
    setGerandoIA(null)
    carregarPecas()
    if (ok === alvo.length) toast.success(`Dados de IA gerados para ${ok} peça(s).`)
    else toast.error(`Gerou ${ok} de ${alvo.length}. Confira a chave do Gemini e os logs do Render.`)
  }

  const pendentes = pecas.filter((p) => p.status === 'PENDENTE')
  const semIA = pecas.filter((p) => !temIA(p) && p.status !== 'REPROVADA')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Anúncios e Peças</h1>
        <div className="flex gap-2">
          {semIA.length > 0 && (
            <button
              onClick={gerarIATodas}
              disabled={gerandoIA !== null}
              className="rounded border border-emerald-700 px-4 py-2 text-sm text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
            >
              {gerandoIA === 'todas'
                ? 'Gerando IA...'
                : `Gerar IA para ${semIA.length} peça(s) sem dados`}
            </button>
          )}
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            {mostrarForm ? 'Cancelar' : '+ Peça da casa'}
          </button>
        </div>
      </div>

      {pendentes.length > 0 && (
        <section className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="mb-3 font-semibold text-amber-900">
            Aguardando aprovação ({pendentes.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pendentes.map((peca) => (
              <div key={peca.id} className="flex flex-wrap items-center gap-3 rounded bg-white p-3">
                <img src={peca.foto} alt={peca.descricao} className="h-16 w-16 rounded object-cover" />
                <div className="min-w-48 flex-1 text-sm">
                  <div className="font-medium text-gray-800">{peca.descricao}</div>
                  <div className="text-gray-500">
                    {peca.categoria.nome} · Tam. {peca.tamanho} · {moeda(peca.preco)}
                  </div>
                  <div className="text-gray-500">
                    Vendedor: {peca.vendedor?.nome ?? NOME_DA_CASA}
                    {peca.vendedor?.cidade ? ` (${peca.vendedor.cidade})` : ''}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Motivo (obrigatório ao reprovar)"
                  value={motivos[peca.id] ?? ''}
                  onChange={(e) => setMotivos((m) => ({ ...m, [peca.id]: e.target.value }))}
                  className="w-56 rounded border border-gray-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => moderar(peca, 'APROVAR')}
                  className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                >
                  ✔ Aprovar
                </button>
                <button
                  onClick={() => moderar(peca, 'REPROVAR')}
                  className="rounded bg-amber-600 px-3 py-1 text-sm text-white hover:bg-amber-700"
                >
                  ✖ Reprovar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <div className="sm:col-span-2">
            <input type="hidden" {...register('foto', { required: 'Envie uma foto da peça' })} />
            <CampoFoto
              valor={watch('foto') ?? ''}
              aoMudar={(v) => setValue('foto', v, { shouldValidate: true })}
              erro={errors.foto?.message}
            />
          </div>
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
            <th className="p-3">Vendedor</th>
            <th className="p-3">Preço</th>
            <th className="p-3">Status</th>
            <th className="p-3">Destaque</th>
            <th className="p-3">IA</th>
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
              <td className="p-3">{peca.vendedor?.nome ?? NOME_DA_CASA}</td>
              <td className="p-3">
                {moeda(peca.precoFinal ?? peca.preco)}
                <div className="text-xs text-gray-500">Tam. {peca.tamanho}</div>
              </td>
              <td className="p-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${ANUNCIO_COR[peca.status]}`}
                >
                  {ANUNCIO_LABEL[peca.status]}
                </span>
              </td>
              <td className="p-3">
                {peca.status === 'DISPONIVEL' || peca.status === 'RESERVADA' ? (
                  <button onClick={() => alternarDestaque(peca)} title="Alternar destaque">
                    {peca.destaque ? '⭐' : '☆'}
                  </button>
                ) : (
                  '—'
                )}
              </td>
              <td className="p-3">
                {temIA(peca) ? (
                  <span className="text-xs text-emerald-700">✔ gerada</span>
                ) : (
                  <button
                    onClick={() => gerarIAUma(peca)}
                    disabled={gerandoIA !== null}
                    className="rounded border border-emerald-700 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {gerandoIA === peca.id ? 'Gerando...' : 'Gerar IA'}
                  </button>
                )}
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
