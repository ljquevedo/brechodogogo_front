import type { CondicaoPeca, StatusAnuncio, StatusProposta } from './types.ts'

export const NOME_DA_CASA = 'Brechó do Gogó'

export function moeda(valor: number | string | null | undefined) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const CONDICAO_LABEL: Record<CondicaoPeca, string> = {
  NOVA: 'Nova',
  SEMINOVA: 'Seminova',
  USADA: 'Usada',
  COM_AVARIAS: 'Com avarias',
}

export const ANUNCIO_LABEL: Record<StatusAnuncio, string> = {
  PENDENTE: 'Aguardando aprovação',
  DISPONIVEL: 'Disponível',
  RESERVADA: 'Reservada',
  VENDIDA: 'Vendida',
  REPROVADA: 'Reprovada',
}

export const ANUNCIO_COR: Record<StatusAnuncio, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  DISPONIVEL: 'bg-emerald-100 text-emerald-800',
  RESERVADA: 'bg-sky-100 text-sky-800',
  VENDIDA: 'bg-gray-200 text-gray-700',
  REPROVADA: 'bg-red-100 text-red-800',
}

export const PROPOSTA_LABEL: Record<StatusProposta, string> = {
  PENDENTE: 'Aguardando resposta',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

export const PROPOSTA_COR: Record<StatusProposta, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800',
  ACEITA: 'bg-emerald-100 text-emerald-800',
  RECUSADA: 'bg-red-100 text-red-800',
}

// Mensagem de erro vinda da API (campo "erro") ou um texto padrão
export async function mensagemDeErro(resposta: Response, padrao: string) {
  try {
    const dados = await resposta.json()
    return dados.erro ?? padrao
  } catch {
    return padrao
  }
}
