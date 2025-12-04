import { TipoNotificacaoEnum } from "./tipoNotificacaoEnum";

export interface NotificacaoOutput {
  id: number;
  titulo: string;
  mensagem: string;
  lido: boolean;
  criadoEm: string;
  tipo: TipoNotificacaoEnum;
  chamadoId: number;
  chamadoProtocolo: string;
}