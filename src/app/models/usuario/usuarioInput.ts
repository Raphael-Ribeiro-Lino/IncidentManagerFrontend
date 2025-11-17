import { PerfilEnum } from "./perfilEnum";


export interface UsuarioInput {
  nome: string;       
  email: string;      
  telefone: string;   
  ativo: boolean;     
  perfil: PerfilEnum;
  empresa: number;
}
