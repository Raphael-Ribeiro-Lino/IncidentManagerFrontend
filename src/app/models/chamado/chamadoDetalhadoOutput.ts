import { ChamadoOutput } from './chamadoOutput';
import { InteracaoOutput } from '../interacao/interacaoOutput';

export interface ChamadoDetalhadoOutput extends ChamadoOutput {
    historicoEventos: InteracaoOutput[];
}