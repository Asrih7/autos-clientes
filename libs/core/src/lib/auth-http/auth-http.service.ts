import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';
import { ApiAuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);

  loginConAplicacionOrigen(): Observable<ApiAuthResponse> {
    const payload = {
      usuario: this.config.technicalCredentials.usuario,
      password: this.config.technicalCredentials.password
    };

    return this.http.post<ApiAuthResponse>(this.config.apiPaths.login, payload);
  }
}
