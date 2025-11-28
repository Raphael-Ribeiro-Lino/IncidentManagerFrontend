import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TransferenciaOutput } from '../../models/transferencia/transferenciaOutput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';
import { ResponderTransferenciaInput } from '../../models/transferencia/responderTransferenciaInput';
import { TransferenciaDetalhadaOutput } from '../../models/transferencia/transferenciaDetalhadaOutput';

const API_URL = environment.URL_API + '/transferencia';
@Injectable({
  providedIn: 'root',
})
export class TransferenciaService {
  constructor(private httpClient: HttpClient) {}

  listarMinhasPendencias(
    token: string,
    page: number = 0,
    search: string = ''
  ): Observable<PaginationOutput<TransferenciaOutput>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    let params = new HttpParams().set('page', page.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PaginationOutput<TransferenciaOutput>>(
      `${API_URL}/minhas-pendencias`,
      { headers, params }
    );
  }

  listarMinhasSolicitacoes(
    token: string,
    page: number = 0,
    search: string = ''
  ): Observable<PaginationOutput<TransferenciaDetalhadaOutput>> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    let params = new HttpParams().set('page', page.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PaginationOutput<TransferenciaDetalhadaOutput>>(
      `${API_URL}/enviadas`,
      { headers, params }
    );
  }

  responderTransferencia(
    token: string,
    id: number,
    input: ResponderTransferenciaInput
  ): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<void>(`${API_URL}/${id}/responder`, input, {
      headers,
    });
  }

  cancelarTransferencia(token: string, id: number): Observable<void> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.httpClient.post<void>(
      `${API_URL}/${id}/cancelar`,
      {},
      { headers }
    );
  }
}
