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
  status: StatusAnuncio
  motivoReprovacao: string | null
  precoFinal: number | null
  vendidaEm: string | null
  vendedorId: string | null
  vendedor?: PessoaType | null
  compradorId: string | null
  comprador?: PessoaType | null
  _count?: { propostas: number }
  createdAt: string
  updatedAt: string
}

// pending = aguarda aprovação do admin; reservada = alguém comprou ou teve proposta aceita
export type StatusAnuncio = 'PENDENTE' | 'DISPONIVEL' | 'RESERVADA' | 'VENDIDA' | 'REPROVADA'

// Dados de outra pessoa. O e-mail só vem do servidor quando já existe uma venda combinada.
export type PessoaType = {
  id: string
  nome: string
  cidade: string | null
  email?: string
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
  valorOferta: number | null
  resposta: string | null
  status: StatusProposta
  pecaId: number
  peca: PecaType
  clienteId: string
  cliente?: ClienteType
  createdAt: string
  respondidoEm: string | null
}
