import { inject } from '@angular/core';
import { tap, catchError, Observable, of } from 'rxjs';
import { AuthHttpService } from '../auth-http/auth-http.service';

export function initializeAuthentication(): Observable<unknown> {
  const authHttp = inject(AuthHttpService);

  return authHttp.loginConAplicacionOrigen().pipe(
    tap((response) => {
      const accessToken = response?._embedded?.access_token;
      const refreshToken = response?._embedded?.refresh_token;

      if (accessToken) {
        sessionStorage.setItem('mnv_autos_auth_token', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('mnv_autos_refresh_token', refreshToken);
        }
      }
    }),
    catchError((error) => {
      console.error('[Auth Initializer] Failed to acquire background token:', error);
      return of(null);
    })
  );
}
