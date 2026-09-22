import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceApiService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { DatosPersona } from '@mnv-autos-clientes/shared';
import { StepP15DatosPersonalesV2Component } from './step-p15-datos-personales-v2.component';

describe('StepP15DatosPersonalesV2Component', () => {
	let stateService: InsuranceStateService;
	let navigation: { next: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		sessionStorage.clear();
		navigation = { next: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [
				StepP15DatosPersonalesV2Component,
				TranslocoTestingModule.forRoot({
					langs: { es: translations() },
					translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
					preloadLangs: true
				})
			],
			providers: [
				{ provide: InsuranceNavigationService, useValue: navigation },
				{ provide: AutoInsuranceApiService, useValue: { limpiarCache: vi.fn() } }
			]
		}).compileComponents();

		stateService = TestBed.inject(InsuranceStateService);
	});

	it('configures contact fields and restores old combined E.164 data', () => {
		stateService.saveData({ email: 'persona@example.com', telefono: '+34657747576', privacidadAceptada: true });
		const { access, fixture } = createComponent();

		expect(access.camposVisibles).toEqual(['telefonoMovil', 'email', 'privacidadAceptada']);
		expect(access.datos()).toMatchObject({
			paisTelefono: 'ESP',
			prefijoTelefono: '+34',
			telefonoMovil: '657747576',
			email: 'persona@example.com',
			privacidadAceptada: true
		});
		expect(fixture.nativeElement.querySelector('bal-select').value).toBe('ESP');
	});

	it('persists separate phone parts and the compatible combined phone', () => {
		const { access } = createComponent();
		access.actualizarDatos({
			...access.datos(),
			paisTelefono: 'FRA',
			prefijoTelefono: '+33',
			telefonoMovil: '612345678',
			email: 'persona@example.com',
			privacidadAceptada: true
		});

		expect(stateService.formData()).toMatchObject({
			paisTelefono: 'FRA',
			prefijoTelefono: '+33',
			telefonoMovil: '612345678',
			telefono: '+33612345678'
		});
	});

	it.each([
		['email inválido', { email: 'persona', telefonoMovil: '657747576', privacidadAceptada: true }],
		['teléfono corto', { email: 'persona@example.com', telefonoMovil: '123', privacidadAceptada: true }],
		['privacidad sin aceptar', { email: 'persona@example.com', telefonoMovil: '657747576', privacidadAceptada: false }]
	])('blocks navigation with %s', (_scenario, changes) => {
		const { access } = createComponent();
		access.actualizarDatos({ ...access.datos(), ...changes });

		access.avanzar();

		expect(navigation.next).not.toHaveBeenCalled();
	});

	it('navigates with valid contact data and privacy acceptance', () => {
		const { access } = createComponent();
		access.actualizarDatos({
			...access.datos(),
			telefonoMovil: '657747576',
			email: 'persona@example.com',
			privacidadAceptada: true
		});

		access.avanzar();

		expect(navigation.next).toHaveBeenCalledOnce();
	});

	function createComponent(): {
		fixture: ComponentFixture<StepP15DatosPersonalesV2Component>;
		access: {
			camposVisibles: readonly string[];
			datos: () => DatosPersona;
			actualizarDatos: (datos: DatosPersona) => void;
			avanzar: () => void;
		};
	} {
		const fixture = TestBed.createComponent(StepP15DatosPersonalesV2Component);
		fixture.detectChanges();
		const access = fixture.componentInstance as unknown as {
			camposVisibles: readonly string[];
			datos: () => DatosPersona;
			actualizarDatos: (datos: DatosPersona) => void;
			avanzar: () => void;
		};
		return { fixture, access };
	}
});

function translations(): Record<string, unknown> {
	return {
		tarificacion: {
			p15: { next: 'Siguiente' },
			datosPersona: {
				telefono: { prefijo: 'Prefijo', label: 'Móvil', placeholder: '', sinResultados: 'Sin resultados' },
				email: { label: 'Email', placeholder: '' },
				privacidad: { label: 'Privacidad' },
				errors: { telefono: 'Móvil inválido', email: 'Email inválido', privacidad: 'Privacidad obligatoria' }
			}
		}
	};
}
