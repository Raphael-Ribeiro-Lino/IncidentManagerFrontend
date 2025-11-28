export interface TransferenciaDetalhadaOutput {
  id: number;
  
  chamadoId: number;
  chamadoProtocolo: string;
  chamadoTitulo: string;
  chamadoDescricao: string;
  chamadoPrioridade: string;
  chamadoStatus: string;
  chamadoDataCriacao: string;

  tecnicoDestinoId: number;
  tecnicoDestinoNome: string;
  
  motivo: string;
  dataSolicitacao: string;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CANCELADA';
  motivoRecusa?: string;
  dataResposta?: string;
}