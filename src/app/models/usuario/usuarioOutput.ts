import { EmpresaOutput } from "../empresa/empresaOutput";
import { PerfilEnum } from "./perfilEnum";

export interface UsuarioOutput{
    id: number,
    nome: string,
    email: string,
    telefone: string,
    ativo: boolean,
    empresa: EmpresaOutput,
    perfil: PerfilEnum
    podeReenviarEmail: boolean
}
