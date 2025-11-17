import { PerfilEnum } from "./PerfilEnum";


export interface UsuarioInput {
  nome: string;       
  email: string;      
  telefone: string;   
  ativo: boolean;     
  perfil: PerfilEnum;
  empresa: number;
}
