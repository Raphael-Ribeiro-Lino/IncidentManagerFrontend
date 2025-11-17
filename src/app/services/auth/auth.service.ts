import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UsuarioTokenOutput } from '../../models/usuario/usuarioTokenOutput';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isTokenValid(): boolean {
    const token = this.getToken();

    if (!token) return false;
    try {
      const tokenData = jwtDecode(token);

      const currentTime = Math.floor(Date.now() / 1000);

      if (!tokenData?.exp || typeof tokenData.exp !== 'number') {
        return false;
      }
      return tokenData.exp > currentTime;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return false;
    }
  }

  getUserProfile(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.role || decoded.perfil || null;
    } catch {
      return null;
    }
  }

getUsuarioLogado(): UsuarioTokenOutput | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.id,
      nome: decoded.nome,
      email: decoded.email,
      perfil: decoded.role || decoded.perfil,
      ativo: decoded.ativo,
      empresa_id: decoded.empresa_id,
      iss: decoded.iss,
      iat: decoded.iat,
      exp: decoded.exp
    };
  } catch {
    return null;
  }
}
}
