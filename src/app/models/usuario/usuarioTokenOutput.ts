export interface UsuarioTokenOutput {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  empresa_id?: number;
  iss?: string;
  iat?: number;
  exp?: number;
}
