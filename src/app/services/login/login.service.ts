import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginOutput } from '../../models/login/loginOutput';
import { LoginInput } from '../../models/login/loginInput';
import { Observable } from 'rxjs';

const URL_API = environment.URL_API + "/auth";

@Injectable({
  providedIn: 'root'
})

export class LoginService {

    constructor(private httpClient: HttpClient) { }

  auth(loginInput: LoginInput):Observable<LoginOutput>{
    return this.httpClient.post<LoginOutput>(URL_API, loginInput);
  }

}
