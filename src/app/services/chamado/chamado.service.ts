import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChamadoInput } from '../../models/chamado/chamadoInput';
import { AnexoInput } from '../../models/anexo/anexoInput';
import { Observable } from 'rxjs';
import { ChamadoOutput } from '../../models/chamado/chamadoOutput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';

const API_URL = environment.URL_API + '/chamado';

@Injectable({
  providedIn: 'root',
})
export class ChamadoService {
  constructor(private httpClient: HttpClient) {}

  private buildFormData(chamado: ChamadoInput): FormData {
    const formData = new FormData();

    formData.append('titulo', chamado.titulo);
    formData.append('descricao', chamado.descricao);
    formData.append('prioridade', chamado.prioridade);

    if (chamado.anexos && chamado.anexos.length > 0) {
      chamado.anexos.forEach((anexo: AnexoInput, index: number) => {
        formData.append(
          `anexos[${index}].arquivo`,
          anexo.arquivo,
          anexo.arquivo.name
        );
        formData.append(`anexos[${index}].nomeArquivo`, anexo.nomeArquivo);
        formData.append(
          `anexos[${index}].tamanhoBytes`,
          anexo.tamanhoBytes.toString()
        );
        formData.append(`anexos[${index}].tipo`, anexo.tipo);
      });
    }

    return formData;
  }

  cadastrar(
    token: string,
    chamadoInput: ChamadoInput
  ): Observable<ChamadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const formData = this.buildFormData(chamadoInput);
    return this.httpClient.post<ChamadoOutput>(API_URL, formData, {
      headers,
    });
  }

  listar(
    token: string,
    numPage: number,
    searchTerm: string = '',
    selectedPriority: string = ''
  ): Observable<PaginationOutput<ChamadoOutput>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    let params = new HttpParams().set('page', numPage.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    return this.httpClient.get<PaginationOutput<ChamadoOutput>>(
      API_URL + '/lista',
      {
        headers,
        params,
      }
    );
  }

  buscarPorId(token: string, id: number): Observable<ChamadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.get<ChamadoOutput>(API_URL + `/${id}`, {
      headers,
    });
  }
}
