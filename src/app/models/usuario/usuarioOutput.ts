import { EmpresaOutput } from "../empresa/empresaOutput";
import { PerfilEnum } from "./PerfilEnum";

export interface UsuarioOutput{
    id: number,
    nome: string,
    email: string,
    telefone: string,
    ativo: boolean,
    empresa: EmpresaOutput,
    perfil: PerfilEnum
}