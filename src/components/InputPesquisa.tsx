import { useState } from 'react'
import type { FormEvent } from 'react'
import type { PecaType } from '../utils/types.ts'

type Props = {
  setPecas: (pecas: PecaType[]) => void
}

export default function InputPesquisa({ setPecas }: Props) {
  const [termo, setTermo] = useState('')

  async function pesquisar(e: FormEvent) {
    e.preventDefault()
    if (!termo.trim()) return
    const resposta = await fetch(
      `${import.meta.env.VITE_API_URL}/pecas/pesquisa/${encodeURIComponent(termo)}`,
    )
    const dados = await resposta.json()
    setPecas(dados)
  }

  async function exibirDestaques() {
    setTermo('')
    const resposta = await fetch(`${import.meta.env.VITE_API_URL}/pecas?destaque=true`)
    const dados = await resposta.json()
    setPecas(dados)
  }

  return (
    <form onSubmit={pesquisar} className="mx-auto flex max-w-xl gap-2 p-4">
      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Busque por descrição, marca, categoria, tamanho ou preço máximo..."
        className="flex-1 rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
      />
      <button
        type="submit"
        className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-800"
      >
        Pesquisar
      </button>
      <button
        type="button"
        onClick={exibirDestaques}
        className="rounded border border-emerald-700 px-4 py-2 text-emerald-700 hover:bg-emerald-50"
      >
        Exibir Destaques
      </button>
    </form>
  )
}
