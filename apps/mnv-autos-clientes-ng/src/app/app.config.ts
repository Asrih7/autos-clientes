import {
	APP_INITIALIZER,
	ApplicationConfig,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { provideStoreConfigOnEnvironment } from '@archit-lib-helvetiang/core/ocp-config';
import { HeOCPSSOProvider } from '@archit-lib-helvetiang/core/ocp-sso';
import { BalConfigService, provideBaloiseDesignSystem } from '@baloise/ds-angular';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './i18n/transloco-loader';
import { initializeI18n } from './i18n/i18n.initialize';
import { API_CONFIG_TOKEN } from '@mnv-autos-clientes/shared';
import { authInterceptor, initializeAuthentication, loadingInterceptor } from '@mnv-autos-clientes/core';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideBrowserGlobalErrorListeners(),
		provideRouter(appRoutes),
		provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor])),
		HeOCPSSOProvider(),
		provideStoreConfigOnEnvironment(environment as any),
		provideBaloiseDesignSystem({
			defaults: {
				region: 'CH',
				language: 'en'
			}
		}),
		provideAppInitializer(() => initializeAuthentication()),
		provideTransloco({
			config: {
				availableLangs: ['es', 'en'],
				defaultLang: 'es',
				reRenderOnLangChange: true,
				prodMode: false
			},
			loader: TranslocoHttpLoader
		}),
		{
			provide: APP_INITIALIZER,
			useFactory: initializeI18n,
			multi: true,
			deps: [TranslocoService, BalConfigService]
		},
		{
			provide: API_CONFIG_TOKEN,
			useValue: environment
		}
	]
};
