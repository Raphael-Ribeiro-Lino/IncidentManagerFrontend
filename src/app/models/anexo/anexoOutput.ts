import { UsuarioOutput } from "../usuario/usuarioOutput";
import { TipoAnexoEnum } from "./tipoAnexoEnum";

export interface AnexoOutput {
    nomeArquivo: string;
    storagePath: string; 
    tipo: TipoAnexoEnum;
    uploadedAt: string; 
    enviadoPor: UsuarioOutput;
}