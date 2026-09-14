import { TestBed } from '@angular/core/testing';

import { AutoInsuranceApiService } from '../services/auto-insurance-api.service';
import { InsuranceStateService } from './insurance-state.service';

describe('InsuranceStateService', () => {
	let service: InsuranceStateService;

	beforeEach(() => {
		sessionStorage.clear();
		TestBed.configureTestingModule({
			providers: [{ provide: AutoInsuranceApiService, useValue: { limpiarCache: vi.fn() } }]
		});
		service = TestBed.inject(InsuranceStateService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it.each(['12345678Z', 'X1234567L'])('should accept a valid NIF or NIE: %s', (identifier) => {
		expect(service.isNifNieValido(identifier)).toBe(true);
	});

	it.each(['12345678A', 'X1234567A', 'A12345678', ''])('should reject an invalid NIF or NIE: %s', (identifier) => {
		expect(service.isNifNieValido(identifier)).toBe(false);
	});

	it('should require only NIF, address and number for personal data', () => {
		service.saveData({ nif: '12345678Z', direccion: 'Calle Mayor', numero: '6' });

		expect(service.isDatosPersonalesValidos()).toBe(true);
		expect(service.canContinueFromStep('datos-personales')).toBe(true);

		service.saveData({ numero: ' ' });

		expect(service.isDatosPersonalesValidos()).toBe(false);
	});

	it('should normalize and validate an international phone number', () => {
		expect(service.normalizarTelefono('+34 657747576')).toBe('+34657747576');
		expect(service.isTelefonoValido('+34 657747576')).toBe(true);
		expect(service.isTelefonoValido('657747576')).toBe(false);
	});

	it('should require valid contact details and privacy acceptance', () => {
		service.saveData({
			email: 'persona@example.com',
			telefono: '+34657747576',
			privacidadAceptada: false
		});

		expect(service.isDatosContactoValidos()).toBe(false);

		service.saveData({ privacidadAceptada: true });

		expect(service.isDatosContactoValidos()).toBe(true);
		expect(service.canContinueFromStep('datos-contacto')).toBe(true);
	});
});
