import { TipoAnexoEnum } from "./tipoAnexoEnum";

export interface AnexoInput {
    nomeArquivo: string;
    tamanhoBytes: number;
    tipo: TipoAnexoEnum;
    arquivo: File; 
}