import {provideAppInitializer, inject, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { provideStoreConfigOnEnvironment } from '@archit-lib-helvetiang/core/ocp-config';
import { HeOCPSSOProvider } from '@archit-lib-helvetiang/core/ocp-sso';
import { BalConfigService, provideBaloiseDesignSystem } from '@baloise/ds-angular';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './i18n/transloco-loader';
import { initializeI18n } from './i18n/i18n.initialize';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideBrowserGlobalErrorListeners(),
		provideRouter(appRoutes),
		provideHttpClient(),
		HeOCPSSOProvider(),
		provideStoreConfigOnEnvironment(environment as any),
		provideBaloiseDesignSystem({
			defaults: {
				region: 'CH',
				language: 'en'
			}
		}),
		provideTransloco({
			config: {
				availableLangs: ['es', 'en'],
				defaultLang: 'es',
				reRenderOnLangChange: true,
				prodMode: false
			},
			loader: TranslocoHttpLoader
		}),
		provideAppInitializer(() =>
			initializeI18n(
				inject(TranslocoService),
				inject(BalConfigService)
			)()
		)
	]
};
