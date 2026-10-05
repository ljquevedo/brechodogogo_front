export type CategoriaType = {
  id: number
  nome: string
}

export type CondicaoPeca = 'NOVA' | 'SEMINOVA' | 'USADA' | 'COM_AVARIAS'

export type PecaType = {
  id: number
  descricao: string
  marca: string | null
  tamanho: string
  preco: number
  foto: string
  detalhes: string | null
  condicao: CondicaoPeca
  destaque: boolean
  materialProvavel: string | null
  dicasCuidado: string | null
  epocaEstimada: string | null
  avaliacaoIA: string | null
  categoriaId: number
  categoria: CategoriaType
  createdAt: string
  updatedAt: string
}

export type ClienteType = {
  id: string
  nome: string
  email: string
  cidade: string | null
  createdAt: string
}

export type AdminType = {
  id: number
  nome: string
  email: string
}

export type StatusProposta = 'PENDENTE' | 'ACEITA' | 'RECUSADA'

export type PropostaType = {
  id: number
  mensagem: string
  resposta: string | null
  status: StatusProposta
  pecaId: number
  peca: PecaType
  clienteId: string
  cliente?: ClienteType
  createdAt: string
  respondidoEm: string | null
}

export type OfertaVendaType = {
  id: number
  descricao: string
  marca: string | null
  tamanho: string
  precoDesejado: number
  foto: string
  detalhes: string | null
  condicao: CondicaoPeca
  resposta: string | null
  status: StatusProposta
  clienteId: string
  cliente?: ClienteType
  createdAt: string
  respondidoEm: string | null
  publicada?: boolean
}
