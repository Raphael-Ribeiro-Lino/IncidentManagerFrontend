import { AnexoOutput } from "../anexo/anexoOutput";

export interface ChatMensagemOutput {
  id: number;
  conteudo: string;
  enviadoEm: string;
  tipo: 'TEXTO' | 'IMAGEM' | 'ARQUIVO';
  remetenteNome: string;
  remetentePerfil: string;
  souEu: boolean;
  lidoEm?: string;
  visivelParaCliente: boolean;
  anexos: AnexoOutput[];
}