import { AnexoOutput } from "../anexo/anexoOutput";
import { UsuarioOutput } from "../usuario/usuarioOutput";
import { PrioridadeEnum } from "./prioridadeEnum";
import { StatusEnum } from "./statusEnum";

export interface ChamadoOutput {
    id: number;
    protocolo: string;
    titulo: string;
    descricao: string;
    prioridade: PrioridadeEnum;
    status: StatusEnum;
    categoria: string;
    dataCriacao: string; 
    dataUltimaAtualizacao: string; 
    solicitante: UsuarioOutput;
    tecnicoResponsavel: UsuarioOutput;
    anexos: AnexoOutput[];
}