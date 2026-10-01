import { Link } from 'react-router-dom'
import type { PecaType } from '../utils/types.ts'

type Props = {
  peca: PecaType
}

export default function CardPeca({ peca }: Props) {
  return (
    <Link
      to={`/detalhes/${peca.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <img src={peca.foto} alt={peca.descricao} className="h-56 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase text-emerald-700">{peca.categoria.nome}</span>
        <h3 className="line-clamp-2 font-semibold text-gray-800">{peca.descricao}</h3>
        <span className="text-sm text-gray-500">Tam. {peca.tamanho}</span>
        <span className="mt-auto text-lg font-bold text-gray-900">
          R$ {Number(peca.preco).toFixed(2)}
        </span>
      </div>
    </Link>
  )
}
