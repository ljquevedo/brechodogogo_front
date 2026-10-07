import { useRef, useState } from 'react'
import { toast } from 'sonner'

// Escolha de foto: envia um arquivo do computador/celular ou usa o link de uma imagem.
// O arquivo é reduzido no próprio navegador (canvas) e vira um texto "data:image/jpeg;base64,..."
// guardado no campo `foto` da peça, então não precisa de serviço de armazenamento.

const TENTATIVAS = [
  { lado: 900, qualidade: 0.8 },
  { lado: 700, qualidade: 0.65 },
  { lado: 520, qualidade: 0.5 },
]
const LIMITE_CARACTERES = 450_000 // o back-end aceita até 600 mil
const TAMANHO_MAXIMO_ARQUIVO = 15 * 1024 * 1024

function carregarImagem(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const endereco = URL.createObjectURL(arquivo)
    const imagem = new Image()
    imagem.onload = () => {
      URL.revokeObjectURL(endereco)
      resolver(imagem)
    }
    imagem.onerror = () => {
      URL.revokeObjectURL(endereco)
      rejeitar(new Error('Não foi possível ler esta imagem. Tente um arquivo JPG ou PNG.'))
    }
    imagem.src = endereco
  })
}

async function reduzirImagem(arquivo: File): Promise<string> {
  const imagem = await carregarImagem(arquivo)
  let resultado = ''
  for (const { lado, qualidade } of TENTATIVAS) {
    const escala = Math.min(1, lado / Math.max(imagem.width, imagem.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(imagem.width * escala))
    canvas.height = Math.max(1, Math.round(imagem.height * escala))
    const contexto = canvas.getContext('2d')
    if (!contexto) throw new Error('Seu navegador não conseguiu processar a imagem.')
    contexto.fillStyle = '#ffffff' // PNG com fundo transparente vira fundo branco
    contexto.fillRect(0, 0, canvas.width, canvas.height)
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height)
    resultado = canvas.toDataURL('image/jpeg', qualidade)
    if (resultado.length <= LIMITE_CARACTERES) return resultado
  }
  throw new Error('A imagem ficou grande demais. Escolha uma foto menor.')
}

type Props = {
  valor: string
  aoMudar: (novoValor: string) => void
  erro?: string
}

export default function CampoFoto({ valor, aoMudar, erro }: Props) {
  const seletor = useRef<HTMLInputElement>(null)
  const [processando, setProcessando] = useState(false)

  const ehArquivo = valor.startsWith('data:image/')
  const kb = ehArquivo ? Math.round((valor.length * 3) / 4 / 1024) : 0

  async function aoEscolher(evento: { target: HTMLInputElement }) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem (JPG, PNG...)')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
      toast.error('A imagem tem mais de 15 MB. Escolha uma menor.')
      return
    }
    setProcessando(true)
    try {
      aoMudar(await reduzirImagem(arquivo))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Não foi possível usar esta imagem')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => seletor.current?.click()}
          disabled={processando}
          className="rounded border border-emerald-700 px-3 py-2 text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
        >
          {processando ? 'Processando...' : valor ? 'Trocar foto' : 'Enviar foto do dispositivo'}
        </button>
        {valor && (
          <button
            type="button"
            onClick={() => aoMudar('')}
            className="rounded border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50"
          >
            Remover
          </button>
        )}
        <input
          ref={seletor}
          type="file"
          accept="image/*"
          onChange={aoEscolher}
          className="hidden"
        />
        {ehArquivo && <span className="text-sm text-gray-500">Foto pronta ({kb} KB)</span>}
      </div>

      {!ehArquivo && (
        <input
          type="text"
          placeholder="ou cole o link (URL) de uma imagem"
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          className="mt-2 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600"
        />
      )}

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {valor && (
        <img
          src={valor}
          alt="Pré-visualização da foto"
          className="mt-2 h-32 rounded object-cover"
        />
      )}
    </div>
  )
}
