import { useEffect, useState } from 'react'
import type { ClienteType } from '../utils/types.ts'

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ClienteType[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clientes`)
      .then((resposta) => resposta.json())
      .then(setClientes)
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Controle de Clientes</h1>

      <table className="w-full border-collapse overflow-hidden rounded-lg bg-white shadow-sm">
        <thead className="bg-gray-800 text-left text-sm text-white">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">E-mail</th>
            <th className="p-3">Cidade</th>
            <th className="p-3">Cadastrado em</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {clientes.map((cliente) => (
            <tr key={cliente.id} className="border-t border-gray-100">
              <td className="p-3">{cliente.nome}</td>
              <td className="p-3">{cliente.email}</td>
              <td className="p-3">{cliente.cidade ?? '—'}</td>
              <td className="p-3">
                {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
