import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpOptions {
  body?: unknown;
  params?: { [key: string]: string | number | boolean | undefined | null };
  headers?: { [key: string]: string | number | boolean | undefined | null };
}

@Injectable({ providedIn: 'root' })
export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  protected readonly apiUrl = this.config.apiPaths.autos;

  protected invocarAutos<T>(method: HttpMethod, endpoint: string, options: HttpOptions = {}): Observable<T> {
    // Sanitizamos posibles dobles barras laterales duplicadas entre apiUrl y endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.apiUrl}/${cleanEndpoint}`;
    return this.invocarApi<T>(url, method, options);
  }

  private invocarApi<T>(url: string, method: HttpMethod, options: HttpOptions): Observable<T> {
    // 1. Tratamiento de Cabeceras
    let headers = new HttpHeaders().set('Content-Type', 'application/json; charset=UTF-8');
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          headers = headers.set(key, value.toString());
        }
      });
    }

    // 2. Tratamiento de Parámetros de URL (Query Params)
    let params = new HttpParams();
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    // 3. Despacho directo simplificado (Sin instanciar HttpRequest manual)
    return this.http.request<T>(method, url, {
      body: options.body,
      headers,
      params
    });
  }
}
