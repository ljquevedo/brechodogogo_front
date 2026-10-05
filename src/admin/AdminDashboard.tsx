import { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type ResumoType = {
  totalClientes: number
  totalPecas: number
  totalPropostas: number
  propostasPorStatus: { pendentes: number; aceitas: number; recusadas: number }
  pecasPorCategoria: { categoria: string; total: number }[]
  clientesPorCidade: { cidade: string; total: number }[]
}

const CORES = ['#047857', '#0d9488', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#a855f7']

export default function AdminDashboard() {
  const [resumo, setResumo] = useState<ResumoType | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard/resumo`)
      .then((resposta) => resposta.json())
      .then(setResumo)
  }, [])

  if (!resumo) {
    return <p className="text-gray-500">Carregando indicadores...</p>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Visão Geral</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clientes cadastrados</p>
          <p className="text-3xl font-bold text-gray-800">{resumo.totalClientes}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Peças cadastradas</p>
          <p className="text-3xl font-bold text-gray-800">{resumo.totalPecas}</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Propostas recebidas</p>
          <p className="text-3xl font-bold text-gray-800">{resumo.totalPropostas}</p>
          <p className="mt-1 text-xs text-gray-500">
            {resumo.propostasPorStatus.pendentes} pendentes ·{' '}
            {resumo.propostasPorStatus.aceitas} aceitas ·{' '}
            {resumo.propostasPorStatus.recusadas} recusadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Peças por Categoria</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.pecasPorCategoria}
                dataKey="total"
                nameKey="categoria"
                innerRadius={60}
                outerRadius={90}
              >
                {resumo.pecasPorCategoria.map((_, i) => (
                  <Cell key={i} fill={CORES[i % CORES.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Clientes por Cidade</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resumo.clientesPorCidade}
                dataKey="total"
                nameKey="cidade"
                innerRadius={60}
                outerRadius={90}
              >
                {resumo.clientesPorCidade.map((_, i) => (
                  <Cell key={i} fill={CORES[i % CORES.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
