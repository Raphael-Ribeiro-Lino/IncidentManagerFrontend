import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { NotificacaoOutput } from '../../models/notificacao/notificacaoOutput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';
import { Observable } from 'rxjs';

const URL_API = environment.URL_API + '/notificacao';
@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  constructor(private http: HttpClient) {}

  listar(
    token: string,
    page: number = 0,
    size: number = 10
  ): Observable<PaginationOutput<NotificacaoOutput>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'criadoEm,desc');

    return this.http.get<PaginationOutput<NotificacaoOutput>>(
      `${URL_API}/lista`,
      { headers, params }
    );
  }

  contarNaoLidas(token: string): Observable<number> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'X-Skip-Loading': 'true',
    });

    return this.http.get<number>(`${URL_API}/nao-lidas/count`, { headers });
  }

  marcarComoLida(token: string, id: number): Observable<void> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.patch<void>(`${URL_API}/${id}/ler`, {}, { headers });
  }

  marcarTodasComoLidas(token: string): Observable<void> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<void>(`${URL_API}/ler-todas`, {}, { headers });
  }
}
