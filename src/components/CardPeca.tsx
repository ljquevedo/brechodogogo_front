import { Link } from 'react-router-dom'
import { NOME_DA_CASA } from '../utils/formatos.ts'
import type { PecaType } from '../utils/types.ts'

type Props = {
  peca: PecaType
}

export default function CardPeca({ peca }: Props) {
  const reservada = peca.status === 'RESERVADA'

  return (
    <Link
      to={`/detalhes/${peca.id}`}
      className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      {reservada && (
        <span className="absolute left-2 top-2 rounded-full bg-sky-600 px-2 py-0.5 text-xs font-medium text-white">
          Reservada
        </span>
      )}
      <img
        src={peca.foto}
        alt={peca.descricao}
        className={`h-56 w-full bg-white object-contain ${reservada ? 'opacity-70' : ''}`}
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase text-emerald-700">{peca.categoria.nome}</span>
        <h3 className="line-clamp-2 font-semibold text-gray-800">{peca.descricao}</h3>
        <span className="text-sm text-gray-500">Tam. {peca.tamanho}</span>
        <span className="text-xs text-gray-500">
          Vendedor: {peca.vendedor?.nome ?? NOME_DA_CASA}
        </span>
        <span className="mt-auto text-lg font-bold text-gray-900">
          R$ {Number(peca.preco).toFixed(2)}
        </span>
      </div>
    </Link>
  )
}
