import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RelatorioFiltroInput } from '../../models/relatorio/relatorioFiltroInput';
import { Observable } from 'rxjs';
import { PaginationOutput } from '../../models/pagination/paginationOutput';
import { ChamadoOutput } from '../../models/chamado/chamadoOutput';


const API_URL = environment.URL_API + "/relatorio";
@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  constructor(private httpClient: HttpClient) { }

   buscarDados(
    filtro: RelatorioFiltroInput, 
    page: number = 0, 
    size: number = 10
  ): Observable<PaginationOutput<ChamadoOutput>> {
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    
    let params = this.montarParams(filtro)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'dataCriacao,desc');

    return this.httpClient.get<PaginationOutput<ChamadoOutput>>(
      `${API_URL}/dados`, 
      { headers, params }
    );
  }

  private montarParams(filtro: RelatorioFiltroInput): HttpParams {
    let params = new HttpParams();

    Object.keys(filtro).forEach((key) => {
      const value = (filtro as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  exportarExcel(filtro: RelatorioFiltroInput): Observable<Blob> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    const params = this.montarParams(filtro);

    return this.httpClient.get(`${API_URL}/exportar/excel`, {
      headers,
      params,
      responseType: 'blob'
    });
  }

  exportarPdf(filtro: RelatorioFiltroInput): Observable<Blob> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });
    const params = this.montarParams(filtro);

    return this.httpClient.get(`${API_URL}/exportar/pdf`, {
      headers,
      params,
      responseType: 'blob'
    });
  }
}
