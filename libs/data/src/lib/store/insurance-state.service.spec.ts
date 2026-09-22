import { TestBed } from '@angular/core/testing';

import { DATOS_PERSONA_VACIOS } from '@mnv-autos-clientes/shared';
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

	it('should expose the relationship step before policyholder as the final active step', () => {
		expect(service.activeStepsMap().at(-2)).toBe('propietario-conductor');
		expect(service.activeStepsMap().at(-1)).toBe('tomador');
	});

	it('should require and retain both policyholder relationship answers', () => {
		expect(service.isRelacionTomadorConductorPropietarioValida()).toBe(false);
		expect(service.canContinueFromStep('propietario-conductor')).toBe(false);

		service.saveData({
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true
		});
		TestBed.flushEffects();

		expect(service.formData()).toMatchObject({
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true
		});
		expect(JSON.parse(sessionStorage.getItem('auto_insurance_wizard_draft') ?? '{}')).toMatchObject({
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true
		});
		expect(service.isRelacionTomadorConductorPropietarioValida()).toBe(true);
		expect(service.canContinueFromStep('propietario-conductor')).toBe(true);
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

	it('should prefill a separate policyholder and convert the captured birth date to ISO', () => {
		service.saveData({
			nif: '12345678Z',
			nombre: 'Conductor',
			diaFechaNacimiento: '6',
			mesFechaNacimiento: '3',
			anioFechaNacimiento: '1989',
			direccion: 'Calle Mayor',
			numero: '6',
			email: 'conductor@example.com'
		});

		const tomadorInicial = service.getDatosTomador();
		expect(tomadorInicial).toMatchObject({
			nif: '12345678Z',
			nombre: 'Conductor',
			fechaNacimiento: '1989-03-06',
			fechaEmisionCarnet: '',
			direccion: 'Calle Mayor',
			numero: '6'
		});

		service.saveDatosTomador({ ...tomadorInicial, nombre: 'Tomador' });

		expect(service.formData().nombre).toBe('Conductor');
		expect(service.formData().datosTomador?.nombre).toBe('Tomador');
	});

	it('should validate every required policyholder field', () => {
		service.saveDatosTomador({
			...DATOS_PERSONA_VACIOS,
			nif: '12345678Z',
			nombre: 'Ana',
			primerApellido: 'García',
			sexo: 'MUJER',
			fechaNacimiento: '1989-03-06',
			fechaEmisionCarnet: '2007-03-06',
			direccion: 'Calle Mayor',
			numero: '6',
			telefonoMovil: '657747576',
			email: 'ana@example.com',
			privacidadAceptada: true
		});

		expect(service.isDatosTomadorValido()).toBe(true);
		expect(service.canContinueFromStep('tomador')).toBe(true);

		service.saveDatosTomador({ ...service.getDatosTomador(), nombre: '' });
		expect(service.isDatosTomadorValido()).toBe(false);
	});

	it('should keep owner, vehicle driver and second driver in independent empty drafts', () => {
		service.saveData({ nif: '12345678Z', nombre: 'Conductor principal' });

		expect(service.getDatosPersonaRol('propietario')).toEqual(DATOS_PERSONA_VACIOS);
		expect(service.getDatosPersonaRol('conductorVehiculo')).toEqual(DATOS_PERSONA_VACIOS);
		expect(service.getDatosPersonaRol('segundoConductor')).toEqual(DATOS_PERSONA_VACIOS);

		service.saveDatosPersonaRol('propietario', { ...DATOS_PERSONA_VACIOS, nombre: 'Propietario' });
		service.saveDatosPersonaRol('conductorVehiculo', { ...DATOS_PERSONA_VACIOS, nombre: 'Conductor' });
		service.saveDatosPersonaRol('segundoConductor', { ...DATOS_PERSONA_VACIOS, nombre: 'Segundo' });

		expect(service.formData()).toMatchObject({
			nombre: 'Conductor principal',
			datosPropietario: { nombre: 'Propietario' },
			datosConductorVehiculo: { nombre: 'Conductor' },
			datosSegundoConductor: { nombre: 'Segundo' }
		});
		expect(service.hasDatosPersonaRol('tomador')).toBe(false);
		expect(service.hasDatosPersonaRol('propietario')).toBe(true);
	});
});
