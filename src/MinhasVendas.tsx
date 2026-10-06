import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import {
  ANUNCIO_COR,
  ANUNCIO_LABEL,
  PROPOSTA_COR,
  PROPOSTA_LABEL,
  mensagemDeErro,
  moeda,
} from './utils/formatos.ts'
import type { PecaType, PropostaType } from './utils/types.ts'

export default function MinhasVendas() {
  const { cliente, carregando } = useAuth()
  const navigate = useNavigate()
  const [anuncios, setAnuncios] = useState<PecaType[]>([])
  const [propostas, setPropostas] = useState<PropostaType[]>([])
  const [respostas, setRespostas] = useState<Record<number, string>>({})

  const carregar = useCallback(() => {
    if (!cliente) return
    const api = import.meta.env.VITE_API_URL
    fetch(`${api}/pecas/vendedor/${cliente.id}`)
      .then((r) => r.json())
      .then(setAnuncios)
    fetch(`${api}/propostas/recebidas/${cliente.id}`)
      .then((r) => r.json())
      .then(setPropostas)
  }, [cliente])

  useEffect(() => {
    if (carregando) return
    if (!cliente) {
      navigate('/login')
      return
    }
    carregar()
  }, [cliente, carregando, navigate, carregar])

  async function chamar(url: string, metodo: string, corpo: object | undefined, sucesso: string) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
    if (!r.ok) {
      toast.error(await mensagemDeErro(r, 'Não foi possível concluir a ação.'))
      carregar()
      return
    }
    toast.success(sucesso)
    carregar()
  }

  function responder(proposta: PropostaType, status: 'ACEITA' | 'RECUSADA') {
    const resposta = respostas[proposta.id]?.trim()
    if (!resposta) {
      toast.error('Escreva uma resposta antes de aceitar ou recusar.')
      return
    }
    chamar(
      `/propostas/${proposta.id}`,
      'PUT',
      { resposta, status, clienteId: cliente!.id },
      status === 'ACEITA' ? 'Proposta aceita! A peça ficou reservada.' : 'Proposta recusada.',
    )
  }

  if (carregando || !cliente) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  const pendentes = propostas.filter((p) => p.status === 'PENDENTE')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Minhas vendas</h1>
        <Link
          to="/vender"
          className="rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800"
        >
          + Novo anúncio
        </Link>
      </div>

      <h2 className="mb-3 text-xl font-bold text-gray-800">
        Propostas recebidas{pendentes.length > 0 ? ` (${pendentes.length} aguardando)` : ''}
      </h2>
      {propostas.length === 0 ? (
        <p className="mb-8 text-gray-500">Ninguém enviou proposta nos seus anúncios ainda.</p>
      ) : (
        <table className="mb-8 w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Comprador</th>
              <th className="p-3">Proposta</th>
              <th className="p-3">Resposta</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {propostas.map((proposta) => (
              <tr key={proposta.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  {proposta.peca.descricao}
                  <div className="text-xs text-gray-500">
                    Anunciada por {moeda(proposta.peca.preco)}
                  </div>
                </td>
                <td className="p-3">{proposta.cliente?.nome}</td>
                <td className="p-3">
                  {proposta.valorOferta !== null && (
                    <div className="font-semibold">{moeda(proposta.valorOferta)}</div>
                  )}
                  {proposta.mensagem}
                </td>
                <td className="p-3">
                  {proposta.status === 'PENDENTE' ? (
                    <input
                      type="text"
                      placeholder="Escreva a resposta..."
                      value={respostas[proposta.id] ?? ''}
                      onChange={(e) =>
                        setRespostas((r) => ({ ...r, [proposta.id]: e.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1"
                    />
                  ) : (
                    <>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${PROPOSTA_COR[proposta.status]}`}
                      >
                        {PROPOSTA_LABEL[proposta.status]}
                      </span>
                      <div className="mt-1">{proposta.resposta}</div>
                    </>
                  )}
                </td>
                <td className="whitespace-nowrap p-3">
                  {proposta.status === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => responder(proposta, 'ACEITA')}
                        title="Aceitar"
                        className="mr-1 rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700"
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => responder(proposta, 'RECUSADA')}
                        title="Recusar"
                        className="rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
                      >
                        ✖
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-3 text-xl font-bold text-gray-800">Meus anúncios</h2>
      {anuncios.length === 0 ? (
        <p className="text-gray-500">Você ainda não anunciou nenhuma peça.</p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Status</th>
              <th className="p-3">Comprador</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {anuncios.map((peca) => (
              <tr key={peca.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <Link to={`/detalhes/${peca.id}`} className="flex items-center gap-2">
                    <img
                      src={peca.foto}
                      alt={peca.descricao}
                      className="h-12 w-12 rounded object-cover"
                    />
                    {peca.descricao}
                  </Link>
                </td>
                <td className="p-3">
                  {moeda(peca.precoFinal ?? peca.preco)}
                  {peca.precoFinal !== null && Number(peca.precoFinal) !== Number(peca.preco) && (
                    <div className="text-xs text-gray-500">anunciada por {moeda(peca.preco)}</div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${ANUNCIO_COR[peca.status]}`}
                  >
                    {ANUNCIO_LABEL[peca.status]}
                  </span>
                  {peca.status === 'REPROVADA' && peca.motivoReprovacao && (
                    <div className="mt-1 text-xs text-red-700">{peca.motivoReprovacao}</div>
                  )}
                  {peca.status === 'DISPONIVEL' && (peca._count?.propostas ?? 0) > 0 && (
                    <div className="mt-1 text-xs text-amber-700">
                      {peca._count?.propostas} proposta(s) aguardando
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {peca.comprador ? (
                    <>
                      {peca.comprador.nome}
                      <div className="text-xs text-gray-500">{peca.comprador.email}</div>
                      {peca.comprador.cidade && (
                        <div className="text-xs text-gray-500">{peca.comprador.cidade}</div>
                      )}
                    </>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="whitespace-nowrap p-3">
                  {peca.status === 'RESERVADA' && (
                    <>
                      <button
                        onClick={() =>
                          chamar(
                            `/pecas/${peca.id}/confirmar-venda`,
                            'PUT',
                            { clienteId: cliente.id },
                            'Venda confirmada!',
                          )
                        }
                        className="mr-1 rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700"
                      >
                        Confirmar venda
                      </button>
                      <button
                        onClick={() =>
                          chamar(
                            `/pecas/${peca.id}/liberar`,
                            'PUT',
                            { clienteId: cliente.id },
                            'Reserva desfeita. A peça voltou para a loja.',
                          )
                        }
                        className="rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
                      >
                        Liberar
                      </button>
                    </>
                  )}
                  {(peca.status === 'PENDENTE' ||
                    peca.status === 'DISPONIVEL' ||
                    peca.status === 'REPROVADA') && (
                    <button
                      onClick={() =>
                        chamar(
                          `/pecas/${peca.id}?clienteId=${cliente.id}`,
                          'DELETE',
                          undefined,
                          'Anúncio excluído.',
                        )
                      }
                      className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                    >
                      🗑 Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
