import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import type { PecaType, PropostaType } from './utils/types.ts'

const CONDICAO_LABEL: Record<string, string> = {
  NOVA: 'Nova',
  SEMINOVA: 'Seminova',
  USADA: 'Usada',
  COM_AVARIAS: 'Com avarias',
}

export default function Detalhes() {
  const { pecaId } = useParams()
  const { cliente } = useAuth()

  const [peca, setPeca] = useState<PecaType | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [propostaEnviada, setPropostaEnviada] = useState<PropostaType | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/pecas/${pecaId}`)
      .then((resposta) => resposta.json())
      .then(setPeca)
  }, [pecaId])

  async function enviarProposta(e: FormEvent) {
    e.preventDefault()
    if (!cliente || !peca || !mensagem.trim()) return

    setEnviando(true)
    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/propostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagem, pecaId: peca.id, clienteId: cliente.id }),
      })
      if (!resposta.ok) throw new Error()
      const proposta = await resposta.json()
      setPropostaEnviada(proposta)
      toast.success('Proposta enviada! Acompanhe em "Minhas Propostas".')
    } catch {
      toast.error('Não foi possível enviar a proposta.')
    } finally {
      setEnviando(false)
    }
  }

  if (!peca) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  const temDadosIA = peca.materialProvavel || peca.dicasCuidado || peca.epocaEstimada

  return (
    <main className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
      <img
        src={peca.foto}
        alt={peca.descricao}
        className="h-96 w-full rounded-lg object-cover"
      />

      <div className="flex flex-col gap-3">
        <span className="text-sm uppercase text-emerald-700">{peca.categoria.nome}</span>
        <h1 className="text-2xl font-bold text-gray-800">{peca.descricao}</h1>
        {peca.marca && <p className="text-gray-600">Marca: {peca.marca}</p>}
        <p className="text-gray-600">Tamanho: {peca.tamanho}</p>
        <p className="text-gray-600">Condição: {CONDICAO_LABEL[peca.condicao]}</p>
        {peca.detalhes && <p className="text-gray-600">{peca.detalhes}</p>}
        <p className="text-3xl font-bold text-gray-900">
          R$ {Number(peca.preco).toFixed(2)}
        </p>

        {temDadosIA && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-gray-700">
            <h2 className="mb-2 font-semibold text-emerald-800">✨ Informações da peça</h2>
            {peca.materialProvavel && (
              <p>
                <strong>Material provável:</strong> {peca.materialProvavel}
              </p>
            )}
            {peca.epocaEstimada && (
              <p>
                <strong>Época estimada:</strong> {peca.epocaEstimada}
              </p>
            )}
            {peca.dicasCuidado && (
              <p>
                <strong>Cuidados:</strong> {peca.dicasCuidado}
              </p>
            )}
            <p className="mt-2 text-xs italic text-gray-500">
              * Informações geradas por IA. Sujeito a erros.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-gray-200 p-4">
          {!cliente && (
            <p className="text-center text-gray-700">
              😍 Gostou? {' '}
              <Link to="/login" className="text-emerald-700 underline">
                Identifique-se e faça uma Proposta!
              </Link>
            </p>
          )}

          {cliente && !propostaEnviada && (
            <form onSubmit={enviarProposta} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Envie uma proposta para esta peça
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex.: Tenho interesse, aceita R$ 50?"
                className="rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
                rows={3}
              />
              <button
                type="submit"
                disabled={enviando}
                className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar Proposta'}
              </button>
            </form>
          )}

          {propostaEnviada && (
            <p className="text-center text-emerald-700">
              ✅ Proposta enviada! Acompanhe a resposta em{' '}
              <Link to="/minhas-propostas" className="underline">
                Minhas Propostas
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
