import { ChamadoOutput } from "../chamado/chamadoOutput";

export interface TransferenciaOutput {
  id: number;
  chamado: ChamadoOutput;
  motivo: string;
  dataSolicitacao: string;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA';
}