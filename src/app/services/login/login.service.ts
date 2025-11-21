import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginOutput } from '../../models/login/loginOutput';
import { LoginInput } from '../../models/login/loginInput';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

const URL_API = environment.URL_API + '/auth';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  auth(loginInput: LoginInput): Observable<LoginOutput> {
    return this.httpClient.post<LoginOutput>(URL_API, loginInput);
  }

  logout(token: string): void {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.httpClient
      .post(`${URL_API}/logout`, {}, { headers: headers })
      .subscribe({
        next: () => {
          this.finalizarLogout();
        },
        error: (err) => {
          console.error('Erro ao realizar logout no servidor:', err);
          this.finalizarLogout();
        },
      });
  }

  private finalizarLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
