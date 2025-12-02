import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioOutput } from '../../models/usuario/usuarioOutput';
import { UsuarioInput } from '../../models/usuario/usuarioInput';
import { PaginationOutput } from '../../models/pagination/paginationOutput';
import { AlteraMeusDadosInput } from '../../models/usuario/alteraMeusDadosInput';
import { AlteraSenhaInput } from '../../models/usuario/alteraSenhaInput';
import { TecnicoSelecaoOutput } from '../../models/usuario/tecnicoSelecaoOutput';

const API_URL = environment.URL_API + '/usuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private httpClient: HttpClient) {}

  buscarPorToken(token: string): Observable<UsuarioOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
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
    usuarioInput;
    return this.httpClient.post<UsuarioOutput>(API_URL, usuarioInput, {
      headers,
    });
  }

  listar(
    token: string,
    numPage: number,
    searchTerm: string = '',
    ativoStr: string = ''
  ): Observable<PaginationOutput<UsuarioOutput>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams().set('page', numPage.toString());

    if (searchTerm) {
      params = params.set('search', searchTerm);
    }

    if (ativoStr === 'true') {
      params = params.set('ativo', 'true');
    } else if (ativoStr === 'false') {
      params = params.set('ativo', 'false');
    }

    return this.httpClient.get<PaginationOutput<UsuarioOutput>>(
      API_URL + '/lista',
      {
        headers,
        params,
      }
    );
  }

  buscarPorId(token: string, id: number): Observable<UsuarioOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.httpClient.get<UsuarioOutput>(API_URL + '/' + id, { headers });
  }

  alterarDados(token: string, id: number, usuarioInput: UsuarioInput) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.httpClient.put<UsuarioOutput>(
      API_URL + `/${id}/altera-dados`,
      usuarioInput,
      {
        headers,
      }
    );
  }

  alterarMeusDados(
    token: string,
    alteraMeusDadosInput: AlteraMeusDadosInput
  ): Observable<UsuarioOutput> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.httpClient.put<UsuarioOutput>(
      API_URL + '/altera-meus-dados',
      alteraMeusDadosInput,
      {
        headers,
      }
    );
  }

  alterarSenha(token: string, alteraSenhaInput: AlteraSenhaInput) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.put<void>(
      API_URL + '/altera-senha',
      alteraSenhaInput,
      { headers }
    );
  }

  reenviarEmailDefinicaoSenha(token: string, id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.httpClient.post<void>(
      API_URL + `/${id}/reenviar-email/definir-senha`,
      {},
      { headers }
    );
  }

  listarTecnicosParaTransferencia(token: string, search: string = ''): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
     let params = new HttpParams();
     if (search) {
      params = params.set('search', search);
    }
    return this.httpClient.get<any>(
      `${API_URL}/tecnicos-disponiveis-transferencia`, 
      { headers, params }
    );
  }

  pesquisarTecnicos(token: string, termo: string = ''): Observable<PaginationOutput<TecnicoSelecaoOutput>> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const params = new HttpParams()
      .set('termo', termo)
      .set('page', '0')
      .set('size', '10')
      .set('sort', 'nome,asc');

    return this.httpClient.get<PaginationOutput<TecnicoSelecaoOutput>>(
      `${API_URL}/tecnico/lista`,
      { headers, params }
    );
  }
}
