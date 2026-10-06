import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './context/AuthContext.tsx'
import {
  ANUNCIO_COR,
  ANUNCIO_LABEL,
  NOME_DA_CASA,
  PROPOSTA_COR,
  PROPOSTA_LABEL,
  mensagemDeErro,
  moeda,
} from './utils/formatos.ts'
import type { PecaType, PropostaType } from './utils/types.ts'

export default function MinhasCompras() {
  const { cliente, carregando } = useAuth()
  const navigate = useNavigate()
  const [compras, setCompras] = useState<PecaType[]>([])
  const [propostas, setPropostas] = useState<PropostaType[]>([])

  const carregar = useCallback(() => {
    if (!cliente) return
    const api = import.meta.env.VITE_API_URL
    fetch(`${api}/pecas/comprador/${cliente.id}`)
      .then((r) => r.json())
      .then(setCompras)
    fetch(`${api}/propostas/cliente/${cliente.id}`)
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

  async function desistir(peca: PecaType) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/pecas/${peca.id}/liberar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId: cliente!.id }),
    })
    if (!r.ok) {
      toast.error(await mensagemDeErro(r, 'Não foi possível desistir da compra.'))
    } else {
      toast.success('Reserva cancelada. A peça voltou para a loja.')
    }
    carregar()
  }

  if (carregando || !cliente) {
    return <main className="p-6 text-center text-gray-500">Carregando...</main>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Minhas compras</h1>

      <h2 className="mb-3 text-xl font-bold text-gray-800">Peças reservadas e compradas</h2>
      {compras.length === 0 ? (
        <p className="mb-8 text-gray-500">
          Você ainda não comprou nada.{' '}
          <Link to="/" className="text-emerald-700 underline">
            Ver a loja
          </Link>
        </p>
      ) : (
        <table className="mb-8 w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Contato do vendedor</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {compras.map((peca) => (
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
                <td className="p-3">{moeda(peca.precoFinal ?? peca.preco)}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${ANUNCIO_COR[peca.status]}`}
                  >
                    {peca.status === 'RESERVADA' ? 'Reservada para você' : ANUNCIO_LABEL[peca.status]}
                  </span>
                </td>
                <td className="p-3">
                  {peca.vendedor ? (
                    <>
                      {peca.vendedor.nome}
                      <div className="text-xs text-gray-500">{peca.vendedor.email}</div>
                      {peca.vendedor.cidade && (
                        <div className="text-xs text-gray-500">{peca.vendedor.cidade}</div>
                      )}
                    </>
                  ) : (
                    <>
                      {NOME_DA_CASA}
                      <div className="text-xs text-gray-500">A equipe entra em contato.</div>
                    </>
                  )}
                </td>
                <td className="p-3">
                  {peca.status === 'RESERVADA' && (
                    <button
                      onClick={() => desistir(peca)}
                      className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                    >
                      Desistir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="mb-3 text-xl font-bold text-gray-800">Propostas que enviei</h2>
      {propostas.length === 0 ? (
        <p className="text-gray-500">Você ainda não enviou nenhuma proposta.</p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-emerald-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Sua proposta</th>
              <th className="p-3">Resposta</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {propostas.map((proposta) => (
              <tr key={proposta.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <Link to={`/detalhes/${proposta.peca.id}`} className="flex items-center gap-2">
                    <img
                      src={proposta.peca.foto}
                      alt={proposta.peca.descricao}
                      className="h-12 w-12 rounded object-cover"
                    />
                    {proposta.peca.descricao}
                  </Link>
                </td>
                <td className="p-3">
                  {proposta.valorOferta !== null && (
                    <div className="font-semibold">{moeda(proposta.valorOferta)}</div>
                  )}
                  {proposta.mensagem}
                </td>
                <td className="p-3">{proposta.resposta ?? '—'}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${PROPOSTA_COR[proposta.status]}`}
                  >
                    {PROPOSTA_LABEL[proposta.status]}
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
