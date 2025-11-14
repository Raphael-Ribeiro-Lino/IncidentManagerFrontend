import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';


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
}