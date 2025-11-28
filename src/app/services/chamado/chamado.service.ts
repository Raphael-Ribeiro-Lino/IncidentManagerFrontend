import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChamadoInput } from '../../models/chamado/chamadoInput';
import { AnexoInput } from '../../models/anexo/anexoInput';
import { Observable } from 'rxjs';
import { ChamadoOutput } from '../../models/chamado/chamadoOutput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';
import { ChamadoDetalhadoOutput } from '../../models/chamado/chamadoDetalhadoOutput';
import { NotaInternaInput } from '../../models/chamado/notaInternaInput';
import { AlteraStatusChamadoInput } from '../../models/chamado/alteraStatusChamadoInput';
import { SolicitarTransferenciaInput } from '../../models/chamado/solicitarTransferenciaInput';
import { AvaliacaoInput } from '../../models/chamado/avaliacaoInput';

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

    // Se a lista estiver vazia, o loop não roda e nada é enviado.
    // O backend vai receber null ou lista vazia dependendo da configuração do Jackson.
    if (chamado.anexos && chamado.anexos.length > 0) {
      chamado.anexos.forEach((anexo: AnexoInput, index: number) => {
        // 1. DADOS OBRIGATÓRIOS PARA O SEU MATCHING NO BACKEND
        // O seu backend compara: Nome + Tamanho + Tipo. Se isso faltar, ele deleta o anexo.
        formData.append(`anexos[${index}].nomeArquivo`, anexo.nomeArquivo);
        formData.append(
          `anexos[${index}].tamanhoBytes`,
          anexo.tamanhoBytes.toString()
        );
        formData.append(`anexos[${index}].tipo`, anexo.tipo);

        // 2. O BINÁRIO (SÓ SE FOR NOVO UPLOAD)
        // Aqui corrigimos o erro 'Cannot read properties of null'
        if (anexo.arquivo) {
          formData.append(
            `anexos[${index}].arquivo`,
            anexo.arquivo,
            anexo.arquivo.name
          );
        }
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

  alterar(
    token: string,
    id: number,
    chamadoInput: ChamadoInput
  ): Observable<ChamadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const formData = this.buildFormData(chamadoInput);
    return this.httpClient.put<ChamadoOutput>(API_URL + `/${id}`, formData, {
      headers,
    });
  }

  listarMeusAtendimentos(
    token: string,
    page: number = 0,
    busca: string = '',
    prioridade: string = ''
  ): Observable<PaginationOutput<ChamadoOutput>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams().set('page', page.toString());
    if (busca) params = params.set('busca', busca);
    if (prioridade) params = params.set('prioridade', prioridade);
    return this.httpClient.get<PaginationOutput<ChamadoOutput>>(
      API_URL + '/tecnico',
      {
        headers,
        params,
      }
    );
  }

  buscarAtendimentoPorId(
    token: string,
    id: number
  ): Observable<ChamadoDetalhadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.httpClient.get<ChamadoDetalhadoOutput>(
      API_URL + `/${id}/tecnico`,
      {
        headers,
      }
    );
  }

  adicionarNotaInterna(
    token: string,
    id: number,
    notaInternaInput: NotaInternaInput
  ) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<void>(
      API_URL + `/${id}/nota-interna`,
      notaInternaInput,
      {
        headers,
      }
    );
  }

  atualizarStatus(
    token: string,
    id: number,
    input: AlteraStatusChamadoInput
  ): Observable<ChamadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.patch<ChamadoOutput>(
      `${API_URL}/${id}/status`,
      input,
      { headers }
    );
  }

  solicitarTransferencia(
    token: string,
    id: number,
    input: SolicitarTransferenciaInput
  ): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<void>(
      `${API_URL}/${id}/solicitar-transferencia`,
      input,
      { headers }
    );
  }

  avaliarChamado(
    token: string,
    id: number,
    avaliacao: AvaliacaoInput
  ): Observable<ChamadoOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
      return this.httpClient.post<ChamadoOutput>(
      `${API_URL}/${id}/avaliar`,
      avaliacao,
      { headers }
    );
  }
}
