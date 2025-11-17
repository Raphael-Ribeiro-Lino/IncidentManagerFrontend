import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioOutput } from '../../models/usuario/usuarioOutput';
import { UsuarioInput } from '../../models/usuario/usuarioInput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';

const API_URL = environment.URL_API + '/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private httpClient: HttpClient) {}

  buscarPorToken(token: string): Observable<UsuarioOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.httpClient.get<UsuarioOutput>(API_URL, { headers });
  }

  cadastrar(
    token: string,
    usuarioInput: UsuarioInput
  ): Observable<UsuarioOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.httpClient.post<UsuarioOutput>(API_URL, usuarioInput, { headers });
  }

listar(token: string, numPage: number): Observable<PaginationOutput<UsuarioOutput>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const params = new HttpParams().set('page', numPage.toString());

    return this.httpClient.get<PaginationOutput<UsuarioOutput>>(API_URL, { headers, params });
  }
}
