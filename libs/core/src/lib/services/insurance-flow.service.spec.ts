import { TestBed } from '@angular/core/testing';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { InsuranceFlowService } from './insurance-flow.service';

describe('InsuranceFlowService personal data flow', () => {
	let service: InsuranceFlowService;
	let personalDataValid: boolean;
	let contactDataValid: boolean;
	let relationshipValid: boolean;
	let policyholderValid: boolean;
	let roleDataValid: boolean;
	let stateService: {
		formData: ReturnType<typeof vi.fn>;
		activeStepsMap: ReturnType<typeof vi.fn>;
		isFechaNacimientoValida: ReturnType<typeof vi.fn>;
		isEdadObtencionCarnetValida: ReturnType<typeof vi.fn>;
		isDatosPersonalesValidos: ReturnType<typeof vi.fn>;
		isDatosContactoValidos: ReturnType<typeof vi.fn>;
		isDatosTomadorValido: ReturnType<typeof vi.fn>;
		isDatosPersonaRolValido: ReturnType<typeof vi.fn>;
		isRelacionTomadorConductorPropietarioValida: ReturnType<typeof vi.fn>;
		canContinueFromStep: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		personalDataValid = true;
		contactDataValid = true;
		relationshipValid = false;
		policyholderValid = true;
		roleDataValid = true;
		const activeSteps: WizardStep[] = [
			'busqueda',
			'versiones',
			'fecha-nacimiento',
			'anos-carnet',
			'tiene-aseguradora',
			'lista-aseguradoras',
			'anos-asegurado',
			'historial-partes',
			'datos-personales',
			'datos-contacto',
			'precios',
			'propietario-conductor',
			'tomador',
			'conductor-vehiculo',
			'segundo-conductor',
			'datos-segundo-conductor',
			'propietario-vehiculo',
			'datos-bancarios'
		];

		stateService = {
			formData: vi.fn().mockReturnValue({
				tipoFlujo: 'MATRICULA',
				vehiculo: {},
				tieneAseguradora: true,
				aseguradoraSeleccionada: {},
				aniosAsegurado: '1',
				numeroSiniestros: '0'
			}),
			activeStepsMap: vi.fn().mockReturnValue(activeSteps),
			isFechaNacimientoValida: vi.fn().mockReturnValue(true),
			isEdadObtencionCarnetValida: vi.fn().mockReturnValue(true),
			isDatosPersonalesValidos: vi.fn(() => personalDataValid),
			isDatosContactoValidos: vi.fn(() => contactDataValid),
			isDatosTomadorValido: vi.fn(() => policyholderValid),
			isDatosPersonaRolValido: vi.fn(() => roleDataValid),
			isRelacionTomadorConductorPropietarioValida: vi.fn(() => relationshipValid),
			canContinueFromStep: vi.fn((step: WizardStep) => {
				if (step === 'datos-personales') return personalDataValid;
				if (step === 'datos-contacto') return contactDataValid;
				if (step === 'propietario-conductor') return relationshipValid;
				return true;
			})
		};

		TestBed.configureTestingModule({
			providers: [{ provide: InsuranceStateService, useValue: stateService }]
		});
		service = TestBed.inject(InsuranceFlowService);
	});

	it('should prevent direct access to contact data when personal data is incomplete', () => {
		personalDataValid = false;

		expect(service.getAccessRedirect('datos-contacto')).toBe('datos-personales');
	});

	it('should prevent direct access to prices when contact data is incomplete', () => {
		contactDataValid = false;

		expect(service.getAccessRedirect('precios')).toBe('datos-contacto');
	});

	it('should only continue from each form when its data is valid', () => {
		personalDataValid = false;
		contactDataValid = false;

		expect(service.canContinue('datos-personales')).toBe(false);
		expect(service.canContinue('datos-contacto')).toBe(false);

		personalDataValid = true;
		contactDataValid = true;

		expect(service.canContinue('datos-personales')).toBe(true);
		expect(service.canContinue('datos-contacto')).toBe(true);
	});

	it('should route users without a current insurer through personal data', () => {
		stateService.formData.mockReturnValue({ tipoFlujo: 'MATRICULA', vehiculo: {}, tieneAseguradora: false });
		stateService.activeStepsMap.mockReturnValue([
			'busqueda',
			'versiones',
			'fecha-nacimiento',
			'anos-carnet',
			'tiene-aseguradora',
			'datos-personales',
			'datos-contacto',
			'precios'
		]);

		expect(service.getNextStep('tiene-aseguradora')).toBe('datos-personales');
		expect(service.getAccessRedirect('datos-personales')).toBeNull();
	});

	it('should prevent skipping P19 and P20 before the driver data steps', () => {
		stateService.formData.mockReturnValue({
			tipoFlujo: 'MATRICULA',
			vehiculo: {},
			tieneAseguradora: true,
			aseguradoraSeleccionada: {},
			aniosAsegurado: '1',
			numeroSiniestros: '0',
			modalidadSeleccionada: {}
		});

		expect(service.getAccessRedirect('tomador')).toBe('propietario-conductor');

		stateService.formData.mockReturnValue({
			tipoFlujo: 'MATRICULA',
			vehiculo: {},
			tieneAseguradora: true,
			aseguradoraSeleccionada: {},
			aniosAsegurado: '1',
			numeroSiniestros: '0',
			modalidadSeleccionada: {},
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true
		});
		relationshipValid = true;

		expect(service.getAccessRedirect('tomador')).toBeNull();
		roleDataValid = false;
		expect(service.getAccessRedirect('segundo-conductor')).toBe('conductor-vehiculo');

		expect(service.canContinue('propietario-conductor')).toBe(true);
	});

	it.each([
		[true, true, false, ['propietario-conductor', 'tomador', 'segundo-conductor', 'datos-bancarios']],
		[
			true,
			true,
			true,
			['propietario-conductor', 'tomador', 'segundo-conductor', 'datos-segundo-conductor', 'datos-bancarios']
		],
		[
			true,
			false,
			false,
			['propietario-conductor', 'tomador', 'segundo-conductor', 'propietario-vehiculo', 'datos-bancarios']
		],
		[
			true,
			false,
			true,
			[
				'propietario-conductor',
				'tomador',
				'segundo-conductor',
				'datos-segundo-conductor',
				'propietario-vehiculo',
				'datos-bancarios'
			]
		],
		[
			false,
			true,
			false,
			['propietario-conductor', 'tomador', 'conductor-vehiculo', 'segundo-conductor', 'datos-bancarios']
		],
		[
			false,
			true,
			true,
			[
				'propietario-conductor',
				'tomador',
				'conductor-vehiculo',
				'segundo-conductor',
				'datos-segundo-conductor',
				'datos-bancarios'
			]
		],
		[
			false,
			false,
			false,
			[
				'propietario-conductor',
				'tomador',
				'conductor-vehiculo',
				'segundo-conductor',
				'propietario-vehiculo',
				'datos-bancarios'
			]
		],
		[
			false,
			false,
			true,
			[
				'propietario-conductor',
				'tomador',
				'conductor-vehiculo',
				'segundo-conductor',
				'datos-segundo-conductor',
				'propietario-vehiculo',
				'datos-bancarios'
			]
		]
	])(
		'should resolve the complete flow for driver=%s, owner=%s and second driver=%s',
		(esTomadorConductorPrincipal, esTomadorPropietarioVehiculo, quiereSegundoConductor, expectedSteps) => {
			relationshipValid = true;
			stateService.formData.mockReturnValue({
				tipoFlujo: 'MATRICULA',
				vehiculo: {},
				tieneAseguradora: true,
				aseguradoraSeleccionada: {},
				aniosAsegurado: '1',
				numeroSiniestros: '0',
				esTomadorConductorPrincipal,
				esTomadorPropietarioVehiculo,
				quiereSegundoConductor
			});

			const resolvedSteps: WizardStep[] = ['propietario-conductor'];
			while (resolvedSteps.at(-1) !== 'datos-bancarios') {
				resolvedSteps.push(service.getNextStep(resolvedSteps.at(-1)!));
			}

			expect(resolvedSteps).toEqual(expectedSteps);
		}
	);

	it('should resolve dynamic back navigation without reintroducing skipped roles', () => {
		stateService.formData.mockReturnValue({
			esTomadorConductorPrincipal: true,
			esTomadorPropietarioVehiculo: true,
			quiereSegundoConductor: false
		});

		expect(service.getPreviousStep('segundo-conductor')).toBe('tomador');
		expect(service.getPreviousStep('datos-bancarios')).toBe('segundo-conductor');

		stateService.formData.mockReturnValue({
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: false,
			quiereSegundoConductor: true
		});

		expect(service.getPreviousStep('segundo-conductor')).toBe('conductor-vehiculo');
		expect(service.getPreviousStep('propietario-vehiculo')).toBe('datos-segundo-conductor');
		expect(service.getPreviousStep('datos-bancarios')).toBe('propietario-vehiculo');
	});

	it('should place the second-driver decision before the final owner and bank-data steps', () => {
		stateService.formData.mockReturnValue({
			esTomadorConductorPrincipal: true,
			esTomadorPropietarioVehiculo: true,
			quiereSegundoConductor: false
		});

		expect(service.getNextStep('coberturas-opcionales')).toBe('propietario-conductor');
		expect(service.getNextStep('tomador')).toBe('segundo-conductor');
		expect(service.getNextStep('segundo-conductor')).toBe('datos-bancarios');
	});

	it('should place manual registration after the policyholder and return to it from driver data', () => {
		stateService.formData.mockReturnValue({
			tipoFlujo: 'MANUAL',
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true
		});

		expect(service.getNextStep('tomador')).toBe('matricula');
		expect(service.getNextStep('matricula')).toBe('conductor-vehiculo');
		expect(service.getPreviousStep('matricula')).toBe('tomador');
		expect(service.getPreviousStep('conductor-vehiculo')).toBe('matricula');
	});
});
