import { useEffect, useState } from 'react'
import CardPeca from './components/CardPeca.tsx'
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
      <section className="my-6">
        <h1 className="sr-only">Brechó do Gogó: compra e venda de roupas usadas</h1>
        <img
          src="/banner-brecho.jpg"
          alt="Brechó do Gogó, compra e venda de roupas usadas. Seu Gogó apresenta uma jaqueta jeans no meio da loja."
          width={1600}
          height={873}
          className="w-full rounded-2xl object-cover shadow-md"
        />
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
