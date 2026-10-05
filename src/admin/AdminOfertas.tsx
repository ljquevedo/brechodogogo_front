import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { OfertaVendaType } from '../utils/types.ts'

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState<OfertaVendaType[]>([])
  const [respostas, setRespostas] = useState<Record<number, string>>({})

  function carregar() {
    fetch(`${import.meta.env.VITE_API_URL}/ofertas`)
      .then((resposta) => resposta.json())
      .then(setOfertas)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function responder(id: number, status: 'ACEITA' | 'RECUSADA') {
    const resposta = respostas[id]?.trim()
    if (!resposta) {
      toast.error('Escreva uma resposta antes de aceitar ou recusar.')
      return
    }

    const r = await fetch(`${import.meta.env.VITE_API_URL}/ofertas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta, status }),
    })
    if (!r.ok) {
      toast.error('Não foi possível responder a oferta.')
      return
    }
    toast.success(status === 'ACEITA' ? 'Oferta aceita!' : 'Oferta recusada.')
    carregar()
  }

  async function excluir(id: number) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/ofertas/${id}`, {
      method: 'DELETE',
    })
    if (!r.ok) {
      toast.error('Não foi possível excluir a oferta.')
      return
    }
    toast.success('Oferta excluída.')
    carregar()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Ofertas de Venda</h1>

      {ofertas.length === 0 ? (
        <p className="text-gray-500">Nenhum cliente ofereceu peças ainda.</p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
          <thead className="bg-gray-800 text-left text-sm text-white">
            <tr>
              <th className="p-3">Peça</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Valor desejado</th>
              <th className="p-3">Status</th>
              <th className="p-3">Resposta</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ofertas.map((oferta) => (
              <tr key={oferta.id} className="border-t border-gray-100 align-top">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={oferta.foto}
                      alt={oferta.descricao}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <div>{oferta.descricao}</div>
                      <div className="text-xs text-gray-500">
                        Tam. {oferta.tamanho} · {oferta.condicao}
                      </div>
                      {oferta.detalhes && (
                        <div className="text-xs text-gray-500">{oferta.detalhes}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {oferta.cliente?.nome}
                  <div className="text-xs text-gray-500">{oferta.cliente?.email}</div>
                </td>
                <td className="p-3">
                  {Number(oferta.precoDesejado).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
                <td className="p-3">{STATUS_LABEL[oferta.status]}</td>
                <td className="p-3">
                  {oferta.status === 'PENDENTE' ? (
                    <input
                      type="text"
                      placeholder="Escreva a resposta..."
                      value={respostas[oferta.id] ?? ''}
                      onChange={(e) =>
                        setRespostas((r) => ({ ...r, [oferta.id]: e.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-2 py-1"
                    />
                  ) : (
                    oferta.resposta
                  )}
                </td>
                <td className="whitespace-nowrap p-3">
                  {oferta.status === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => responder(oferta.id, 'ACEITA')}
                        title="Aceitar"
                        className="mr-1 rounded bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700"
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => responder(oferta.id, 'RECUSADA')}
                        title="Recusar"
                        className="mr-1 rounded bg-amber-600 px-2 py-1 text-white hover:bg-amber-700"
                      >
                        ✖
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => excluir(oferta.id)}
                    title="Excluir"
                    className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
