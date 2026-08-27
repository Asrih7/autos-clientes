import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError, switchMap } from 'rxjs';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';
import { AuthHttpService } from '../auth-http/auth-http.service';
import { isTokenExpired } from '../utils/jwt.helper';
import { ApiAuthResponse } from '../models/auth.model';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthHttpService);
  const token = sessionStorage.getItem('mnv_autos_auth_token');
  const config = inject(API_CONFIG_TOKEN);

  if (req.url.includes(config.apiPaths.login)) {
    return next(req); 
  }

  const evictAuthSession = (): void => {
    sessionStorage.removeItem('mnv_autos_auth_token');
    sessionStorage.removeItem('mnv_autos_refresh_token');
  };

  const cloneWithToken = (request: HttpRequest<unknown>, tokenStr: string): HttpRequest<unknown> => {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${tokenStr}`)
    });
  };

  // ESTRATEGIA 1: SILENT REFRESH PROACTIVO (Antes de enviar la petición al servidor)
  if (token && isTokenExpired(token)) {
    console.warn('[Auth Interceptor] Proactive check: Token expired. Requesting fresh technical token...');
    
    return authService.loginConAplicacionOrigen().pipe(
      switchMap((response: ApiAuthResponse) => {
        const newToken = response?._embedded?.access_token;
        const newRefresh = response?._embedded?.refresh_token;

        if (newToken) {
          sessionStorage.setItem('mnv_autos_auth_token', newToken);
          if (newRefresh) sessionStorage.setItem('mnv_autos_refresh_token', newRefresh);
          
          return next(cloneWithToken(req, newToken));
        }
        
        evictAuthSession();
        return throwError(() => new Error('auth.errors.silentRefreshFailed'));
      }),
      catchError((refreshErr) => {
        console.error('[Auth Interceptor] Critical proactive authentication failure:', refreshErr);
        evictAuthSession();
        return throwError(() => refreshErr);
      })
    );
  }

  if (!token) {
    return next(req);
  }

  // ESTRATEGIA 2: SILENT REFRESH REACTIVO (Captura errores 401 en pleno vuelo)
  return next(cloneWithToken(req, token)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('[Auth Interceptor] Reactive check: Caught 401. Re-authenticating system account...');

        return authService.loginConAplicacionOrigen().pipe(
          switchMap((response: ApiAuthResponse) => {
            const newToken = response?._embedded?.access_token;
            const newRefresh = response?._embedded?.refresh_token;

            if (newToken) {
              sessionStorage.setItem('mnv_autos_auth_token', newToken);
              if (newRefresh) sessionStorage.setItem('mnv_autos_refresh_token', newRefresh);
              
              return next(cloneWithToken(req, newToken));
            }
            
            evictAuthSession();
            return throwError(() => error);
          }),
          catchError((retryErr) => {
            console.error('[Auth Interceptor] Critical reactive authentication fallback failed:', retryErr);
            evictAuthSession();
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};
