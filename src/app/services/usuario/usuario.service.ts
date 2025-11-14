import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioOutput } from '../../models/usuario/usuarioOutput';

const API_URL = environment.URL_API + "/usuario";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private httpClient: HttpClient) { }

  buscarPorToken(token: String): Observable<UsuarioOutput>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.httpClient.get<UsuarioOutput>(API_URL, {headers});
  }
}
