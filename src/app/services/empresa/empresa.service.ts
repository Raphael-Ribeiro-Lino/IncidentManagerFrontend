import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EmpresaInput } from '../../models/empresa/empresaInput';
import { Observable } from 'rxjs';
import { EmpresaOutput } from '../../models/empresa/empresaOutput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';

const API_URL = environment.URL_API + '/empresa';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  constructor(private httpClient: HttpClient) {}

  cadastrar(
    token: string,
    empresaInput: EmpresaInput
  ): Observable<EmpresaOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.httpClient.post<EmpresaOutput>(API_URL, empresaInput, {
      headers,
    });
  }

  listar(
    token: String,
    numPage: number,
    search: string = '',
    ativo: string = ''
  ): Observable<PaginationOutput<EmpresaOutput>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    let params = new HttpParams().set('page', numPage.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.httpClient.get<PaginationOutput<EmpresaOutput>>(API_URL, {
      headers,
      params,
    });
  }
}
