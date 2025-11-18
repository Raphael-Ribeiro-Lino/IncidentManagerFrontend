import { AnexoInput } from "../anexo/anexoInput";
import { PrioridadeEnum } from "./prioridadeEnum";

export interface ChamadoInput {
    titulo: string;
    descricao: string;
    prioridade: PrioridadeEnum;
    anexos?: AnexoInput[]; 
}