import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, importProvidersFrom } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { App } from './app';

// Servicios reales que el componente inyecta
import { NotificationListenerService } from '@mnv-autos-clientes/core';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { BalToastService, BalTokenToast } from '@baloise/ds-angular';

// Tokens y servicios que rompen el test si no se mockean
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';
import { EmisionProcesoService } from '@mnv-autos-clientes/data';
import { ConfiguracionService } from '@mnv-autos-clientes/data';

const translocoOptions: TranslocoTestingOptions = {
  langs: { es: {}, en: {} },
  translocoConfig: { defaultLang: 'es' },
  preloadLangs: true
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),

        // Mock mínimo para evitar el error NG0201
        {
          provide: API_CONFIG_TOKEN,
          useValue: {
            apiPaths: {
              autos: '' // mock mínimo requerido por BaseApiService2
            }
          }
        },

        // Mock de servicios que se ejecutan en ngOnInit
        {
          provide: EmisionProcesoService,
          useValue: {
            iniciarProceso: () => {} // evita llamadas reales
          }
        },
        {
          provide: ConfiguracionService,
          useValue: {
            cargarInicial: () => {} // evita llamadas reales
          }
        },

        importProvidersFrom(TranslocoTestingModule.forRoot(translocoOptions)),
        NotificationListenerService,
        NotificationBusService,
        BalToastService,
        { provide: BalTokenToast, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
