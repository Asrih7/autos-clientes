import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NO_ERRORS_SCHEMA, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { App } from './app';
import { NotificationListenerService } from '@mnv-autos-clientes/core';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { BalToastService, BalTokenToast } from '@baloise/ds-angular';

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

	it('should load appName and version from app-info.json', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;

		expect(app.appName).toBeTruthy();
		expect(app.version).toBeTruthy();
	});
});
