import { useEffect, useState } from 'react'
import CardPeca from './components/CardPeca.tsx'
import DonaGogo from './components/DonaGogo.tsx'
import InputPesquisa from './components/InputPesquisa.tsx'
import type { PecaType } from './utils/types.ts'

export default function App() {
  const [pecas, setPecas] = useState<PecaType[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/pecas?destaque=true`)
      .then((resposta) => resposta.json())
      .then(setPecas)
  }, [])

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10">
      <section className="my-6 flex items-center justify-center gap-6 rounded-2xl bg-emerald-50 px-6 py-4">
        <DonaGogo className="h-40 w-auto shrink-0 sm:h-48" />
        <div>
          <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">
            Garimpo com estilo, direto da Dona Gogó
          </h1>
          <p className="mt-1 text-emerald-800">
            Peças com história, preço de brechó e muito charme.
          </p>
        </div>
      </section>

      <InputPesquisa setPecas={setPecas} />

      {pecas.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Nenhuma peça encontrada.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {pecas.map((peca) => (
            <CardPeca key={peca.id} peca={peca} />
          ))}
        </div>
      )}
    </main>
  )
}
