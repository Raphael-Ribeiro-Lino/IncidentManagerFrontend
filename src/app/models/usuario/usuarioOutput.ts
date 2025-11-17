import { EmpresaOutput } from "../empresa/empresaOutput";

export interface UsuarioOutput{
    id: number,
    nome: string,
    email: string,
    telefone: string,
    ativo: boolean,
    empresa: EmpresaOutput
}