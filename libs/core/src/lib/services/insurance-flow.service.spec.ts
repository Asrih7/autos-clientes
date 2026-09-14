import { TestBed } from '@angular/core/testing';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { InsuranceFlowService } from './insurance-flow.service';

describe('InsuranceFlowService personal data flow', () => {
	let service: InsuranceFlowService;
	let personalDataValid: boolean;
	let contactDataValid: boolean;
	let stateService: {
		formData: ReturnType<typeof vi.fn>;
		activeStepsMap: ReturnType<typeof vi.fn>;
		isFechaNacimientoValida: ReturnType<typeof vi.fn>;
		isEdadObtencionCarnetValida: ReturnType<typeof vi.fn>;
		isDatosPersonalesValidos: ReturnType<typeof vi.fn>;
		isDatosContactoValidos: ReturnType<typeof vi.fn>;
		canContinueFromStep: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		personalDataValid = true;
		contactDataValid = true;
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
			'precios'
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
			canContinueFromStep: vi.fn((step: WizardStep) => {
				if (step === 'datos-personales') return personalDataValid;
				if (step === 'datos-contacto') return contactDataValid;
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
});
