import type { CategoriaType } from "./CategoriaType"

export type PecaType = {
    id: number
    descricao: string
    marca: string | null
    tamanho: string
    preco: number
    destaque: boolean
    foto: string
    detalhes: string | null
    createdAt: Date
    updatedAt: Date
    condicao: string
    categoriaId: number
    categoria: CategoriaType
}
