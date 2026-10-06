import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceApiService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { DatosPersona } from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent, GooglePlacesAutocompleteService } from '@mnv-autos-clientes/ui';
import { StepP14DatosPersonalesComponent } from './step-p14-datos-personales.component';

describe('StepP14DatosPersonalesComponent', () => {
	let stateService: InsuranceStateService;
	let navigation: { next: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		sessionStorage.clear();
		navigation = { next: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [
				StepP14DatosPersonalesComponent,
				TranslocoTestingModule.forRoot({
					langs: { es: translations() },
					translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
					preloadLangs: true
				})
			],
			providers: [
				{ provide: InsuranceNavigationService, useValue: navigation },
				{ provide: AutoInsuranceApiService, useValue: { limpiarCache: vi.fn() } },
				{
					provide: GooglePlacesAutocompleteService,
					useValue: { conectarAutocomplete: vi.fn().mockResolvedValue(null) }
				}
			]
		}).compileComponents();

		stateService = TestBed.inject(InsuranceStateService);
	});

	it('configures address fields including postcode and restores saved data', () => {
		stateService.saveData({ nif: '12345678Z', direccion: 'Calle Mayor', numero: '6', piso: '3' });
		const { access, fixture } = createComponent();

		expect(access.camposVisibles).toEqual(['nif', 'direccion', 'codigoPostal', 'numero', 'piso', 'bloque', 'letra']);
		expect(access.datos()).toMatchObject({
			nif: '12345678Z',
			direccion: 'Calle Mayor',
			numero: '6',
			piso: '3'
		});
		expect(fixture.nativeElement.querySelectorAll('bal-input')).toHaveLength(7);
	});

	it('persists edits through the insurance state', () => {
		const { access } = createComponent();
		access.actualizarDatos({
			...access.datos(),
			nif: '12345678Z',
			direccion: 'Calle Mayor',
			numero: '6',
			bloque: '2'
		});

		expect(stateService.formData()).toMatchObject({
			nif: '12345678Z',
			direccion: 'Calle Mayor',
			numero: '6',
			bloque: '2'
		});
	});

	it('persists an address selected from Google Places', () => {
		const { fixture } = createComponent();
		const datosPersona = fixture.debugElement.query(By.directive(DatosPersonaComponent))
			.componentInstance as unknown as {
			aplicarDireccionGoogle: (direccion: { direccion: string; numero: string; codigoPostal: string }) => void;
			actualizarTexto: (field: 'codigoPostal', event: Event) => void;
		};

		datosPersona.aplicarDireccionGoogle({ direccion: 'Calle Mayor', numero: '6', codigoPostal: '' });
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('#codigoPostal')).not.toBeNull();

		datosPersona.actualizarTexto('codigoPostal', new CustomEvent('balInput', { detail: '28013' }));

		expect(stateService.formData()).toMatchObject({
			direccion: 'Calle Mayor',
			numero: '6',
			codigoPostal: '28013',
			codigoPostalVehiculo: '28013'
		});
	});

	it('shows errors and blocks navigation when required address data is invalid', () => {
		const { access, fixture } = createComponent();

		access.avanzar();
		fixture.detectChanges();

		expect(navigation.next).not.toHaveBeenCalled();
		expect(access.mostrarErrores()).toBe(true);
		expect(fixture.nativeElement.textContent).toContain('NIF inválido');
	});

	it('navigates with valid required data while optional fields are empty', () => {
		const { access } = createComponent();
		access.actualizarDatos({
			...access.datos(),
			nif: '12345678Z',
			direccion: 'Calle Mayor',
			numero: '6',
			codigoPostal: '28013'
		});

		access.avanzar();

		expect(navigation.next).toHaveBeenCalledOnce();
	});

	it('requires the postcode before proceeding when it is missing', () => {
		const { access, fixture } = createComponent();
		access.actualizarDatos({ ...access.datos(), nif: '12345678Z', direccion: 'Calle Mayor', numero: '6' });

		access.avanzar();
		fixture.detectChanges();

		expect(fixture.nativeElement.querySelector('#codigoPostal')).not.toBeNull();
		expect(navigation.next).not.toHaveBeenCalled();

		access.actualizarDatos({ ...access.datos(), codigoPostal: '28013' });
		access.avanzar();

		expect(navigation.next).toHaveBeenCalledOnce();
	});

	function createComponent(): {
		fixture: ComponentFixture<StepP14DatosPersonalesComponent>;
		access: {
			camposVisibles: readonly string[];
			datos: () => DatosPersona;
			mostrarErrores: () => boolean;
			actualizarDatos: (datos: DatosPersona) => void;
			avanzar: () => void;
		};
	} {
		const fixture = TestBed.createComponent(StepP14DatosPersonalesComponent);
		fixture.detectChanges();
		const access = fixture.componentInstance as unknown as {
			camposVisibles: readonly string[];
			datos: () => DatosPersona;
			mostrarErrores: () => boolean;
			actualizarDatos: (datos: DatosPersona) => void;
			avanzar: () => void;
		};
		return { fixture, access };
	}
});

function translations(): Record<string, unknown> {
	return {
		tarificacion: {
			p14: { next: 'Siguiente' },
			datosPersona: {
				nif: { label: 'NIF', placeholder: '' },
				direccion: { label: 'Dirección', placeholder: '' },
				numero: { label: 'Número' },
				piso: { label: 'Piso' },
				bloque: { label: 'Bloque' },
				letra: { label: 'Letra' },
				errors: { required: 'Obligatorio', nif: 'NIF inválido' }
			}
		}
	};
}
