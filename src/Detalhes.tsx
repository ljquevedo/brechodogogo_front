import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import {
  ANUNCIO_COR,
  ANUNCIO_LABEL,
  CONDICAO_LABEL,
  NOME_DA_CASA,
  mensagemDeErro,
  moeda,
} from './utils/formatos.ts'
import type { PecaType } from './utils/types.ts'

const campo =
  'w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600'

export default function Detalhes() {
  const { pecaId } = useParams()
  const { cliente } = useAuth()

  const [peca, setPeca] = useState<PecaType | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [valor, setValor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [confirmandoCompra, setConfirmandoCompra] = useState(false)
  const [propostaEnviada, setPropostaEnviada] = useState(false)

  function carregar() {
    fetch(`${import.meta.env.VITE_API_URL}/pecas/${pecaId}`)
      .then((resposta) => resposta.json())
      .then(setPeca)
  }

  useEffect(carregar, [pecaId])

  async function comprarAgora() {
    if (!cliente || !peca) return
    setEnviando(true)
    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${peca.id}/comprar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: cliente.id }),
      })
      if (!resposta.ok) {
        toast.error(await mensagemDeErro(resposta, 'Não foi possível comprar esta peça.'))
        carregar()
        return
      }
      toast.success('Peça reservada para você! Veja o contato do vendedor em "Minhas compras".')
      carregar()
    } finally {
      setEnviando(false)
      setConfirmandoCompra(false)
    }
  }

  async function enviarProposta(e: FormEvent) {
    e.preventDefault()
    if (!cliente || !peca || !mensagem.trim()) return

    const valorOferta = valor ? Number(valor.replace(',', '.')) : undefined
    if (valor && (Number.isNaN(valorOferta) || (valorOferta ?? 0) <= 0)) {
      toast.error('Informe um valor válido para a proposta.')
      return
    }

    setEnviando(true)
    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/propostas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem,
          valorOferta,
          pecaId: peca.id,
          clienteId: cliente.id,
        }),
      })
      if (!resposta.ok) {
        toast.error(await mensagemDeErro(resposta, 'Não foi possível enviar a proposta.'))
        return
      }
      setPropostaEnviada(true)
      toast.success('Proposta enviada! Acompanhe em "Minhas compras".')
    } finally {
      setEnviando(false)
    }
  }

  if (!peca) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  const temDadosIA = peca.materialProvavel || peca.dicasCuidado || peca.epocaEstimada
  const souVendedor = !!cliente && peca.vendedorId === cliente.id
  const souComprador = !!cliente && peca.compradorId === cliente.id
  const nomeVendedor = peca.vendedor?.nome ?? NOME_DA_CASA

  return (
    <main className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
      <img
        src={peca.foto}
        alt={peca.descricao}
        className="h-96 w-full rounded-lg object-cover"
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm uppercase text-emerald-700">{peca.categoria.nome}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${ANUNCIO_COR[peca.status]}`}
          >
            {ANUNCIO_LABEL[peca.status]}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{peca.descricao}</h1>
        {peca.marca && <p className="text-gray-600">Marca: {peca.marca}</p>}
        <p className="text-gray-600">Tamanho: {peca.tamanho}</p>
        <p className="text-gray-600">Condição: {CONDICAO_LABEL[peca.condicao]}</p>
        {peca.detalhes && <p className="text-gray-600">{peca.detalhes}</p>}
        <p className="text-gray-600">
          Vendedor: <strong>{nomeVendedor}</strong>
          {peca.vendedor?.cidade ? ` · ${peca.vendedor.cidade}` : ''}
        </p>
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
          {peca.status === 'PENDENTE' || peca.status === 'REPROVADA' ? (
            <p className="text-center text-gray-600">
              Este anúncio não está disponível na loja.
              {peca.status === 'REPROVADA' && peca.motivoReprovacao
                ? ` Motivo: ${peca.motivoReprovacao}`
                : ''}
            </p>
          ) : peca.status === 'VENDIDA' ? (
            <p className="text-center text-gray-600">Esta peça já foi vendida.</p>
          ) : peca.status === 'RESERVADA' ? (
            souComprador ? (
              <p className="text-center text-sky-700">
                ✅ Esta peça está reservada para você. Veja o contato do vendedor em{' '}
                <Link to="/minhas-compras" className="underline">
                  Minhas compras
                </Link>
                .
              </p>
            ) : (
              <p className="text-center text-gray-600">
                Esta peça está reservada para outro comprador.
              </p>
            )
          ) : !cliente ? (
            <p className="text-center text-gray-700">
              😍 Gostou?{' '}
              <Link to="/login" className="text-emerald-700 underline">
                Faça login para comprar ou enviar uma proposta!
              </Link>
            </p>
          ) : souVendedor ? (
            <p className="text-center text-gray-700">
              Este é o seu anúncio. Acompanhe em{' '}
              <Link to="/minhas-vendas" className="text-emerald-700 underline">
                Minhas vendas
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {confirmandoCompra ? (
                <div className="flex flex-col gap-2 rounded bg-emerald-50 p-3">
                  <p className="text-sm text-gray-700">
                    Reservar esta peça por <strong>{moeda(peca.preco)}</strong>? O vendedor vai
                    confirmar a venda e vocês combinam a entrega e o pagamento.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={comprarAgora}
                      disabled={enviando}
                      className="flex-1 rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {enviando ? 'Reservando...' : 'Confirmar compra'}
                    </button>
                    <button
                      onClick={() => setConfirmandoCompra(false)}
                      className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmandoCompra(true)}
                  className="rounded bg-emerald-700 px-4 py-3 text-lg font-semibold text-white hover:bg-emerald-800"
                >
                  Comprar por {moeda(peca.preco)}
                </button>
              )}

              {propostaEnviada ? (
                <p className="text-center text-emerald-700">
                  ✅ Proposta enviada! Acompanhe a resposta em{' '}
                  <Link to="/minhas-compras" className="underline">
                    Minhas compras
                  </Link>
                  .
                </p>
              ) : (
                <form onSubmit={enviarProposta} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ou faça uma proposta ao vendedor
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Valor que você oferece (R$) — opcional"
                    className={campo}
                  />
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Ex.: Tenho interesse, aceita R$ 50?"
                    className={campo}
                    rows={3}
                  />
                  <button
                    type="submit"
                    disabled={enviando}
                    className="rounded border border-emerald-700 px-4 py-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {enviando ? 'Enviando...' : 'Enviar proposta'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
