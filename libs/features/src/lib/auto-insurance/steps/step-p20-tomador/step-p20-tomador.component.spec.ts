import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceApiService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { DATOS_PERSONA_VACIOS, DatosPersona, DatosPersonaField } from '@mnv-autos-clientes/shared';
import { GooglePlacesAutocompleteService, VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { StepDatosPersonaRolComponent } from '../shared/step-datos-persona-rol/step-datos-persona-rol.component';
import { StepP20TomadorComponent } from './step-p20-tomador.component';

describe('StepP20TomadorComponent', () => {
	let stateService: InsuranceStateService;
	let navigation: { back: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		sessionStorage.clear();
		navigation = { back: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [
				StepP20TomadorComponent,
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

	it('shows every field, prefills previous data and locks valid NIF and the complete address group', () => {
		stateService.saveData({
			nif: '12345678Z',
			nombre: 'Ana',
			diaFechaNacimiento: '6',
			mesFechaNacimiento: '3',
			anioFechaNacimiento: '1989',
			direccion: 'Calle Mayor',
			numero: '6',
			piso: '3',
			bloque: 'B',
			letra: 'A',
			matricula: '1234ABC'
		});

		const { access, fixture } = createComponent();
		const summary = fixture.debugElement.query(By.directive(VehiclePriceSummaryComponent))
			.componentInstance as VehiclePriceSummaryComponent;

		expect(access.camposVisibles).toHaveLength(15);
		expect(access.camposBloqueados()).toEqual(['nif', 'direccion', 'numero', 'piso', 'bloque', 'letra']);
		expect(access.datos()).toMatchObject({
			nif: '12345678Z',
			fechaNacimiento: '1989-03-06',
			fechaEmisionCarnet: '',
			direccion: 'Calle Mayor',
			numero: '6',
			piso: '3',
			bloque: 'B',
			letra: 'A'
		});
		expect(summary.registration()).toBe('1234ABC');
		expect(fixture.nativeElement.textContent).toContain('Introduce los datos del tomador');
		expect(
			fixture.nativeElement.querySelectorAll('bal-input, bal-radio-group, bal-date, bal-checkbox').length
		).toBeGreaterThanOrEqual(15);
	});

	it('keeps the whole address group editable when the previous address is incomplete', () => {
		stateService.saveData({ nif: '12345678Z', direccion: 'Calle Mayor', numero: '' });

		const { access } = createComponent();

		expect(access.camposBloqueados()).toEqual(['nif']);
		expect(access.camposBloqueados()).not.toContain('direccion');
		expect(access.camposBloqueados()).not.toContain('numero');
	});

	it('persists policyholder changes without modifying the main driver', () => {
		stateService.saveData({ nombre: 'Conductor' });
		const { access } = createComponent();

		access.actualizarDatos({ ...access.datos(), nombre: 'Tomador' });

		expect(stateService.formData().nombre).toBe('Conductor');
		expect(stateService.formData().datosTomador?.nombre).toBe('Tomador');
	});

	it('shows errors for incomplete data and confirms completion only with a valid policyholder', () => {
		const { access, fixture } = createComponent();

		access.finalizar();
		fixture.detectChanges();

		expect(access.mostrarErrores()).toBe(true);
		expect(access.finalizado()).toBe(false);
		expect(fixture.nativeElement.textContent).not.toContain('Datos guardados correctamente');

		access.actualizarDatos(validPolicyholder());
		access.finalizar();
		fixture.detectChanges();

		expect(access.finalizado()).toBe(true);
		expect(stateService.isDatosTomadorValido()).toBe(true);
		expect(fixture.nativeElement.textContent).toContain('Datos guardados correctamente');
	});

	it('returns to the previous step', () => {
		const { access } = createComponent();

		access.volver();

		expect(navigation.back).toHaveBeenCalledOnce();
	});

	function createComponent(): {
		fixture: ComponentFixture<StepP20TomadorComponent>;
		access: {
			camposVisibles: readonly DatosPersonaField[];
			camposBloqueados: () => readonly DatosPersonaField[];
			datos: () => DatosPersona;
			mostrarErrores: () => boolean;
			finalizado: () => boolean;
			actualizarDatos: (datos: DatosPersona) => void;
			finalizar: () => void;
			volver: () => void;
		};
	} {
		const fixture = TestBed.createComponent(StepP20TomadorComponent);
		fixture.detectChanges();
		const roleComponent = fixture.debugElement.query(By.directive(StepDatosPersonaRolComponent))
			.componentInstance as StepDatosPersonaRolComponent;
		const access = roleComponent as unknown as {
			camposVisibles: readonly DatosPersonaField[];
			camposBloqueados: () => readonly DatosPersonaField[];
			datos: () => DatosPersona;
			mostrarErrores: () => boolean;
			finalizado: () => boolean;
			actualizarDatos: (datos: DatosPersona) => void;
			finalizar: () => void;
			volver: () => void;
		};
		return { fixture, access };
	}
});

function validPolicyholder(): DatosPersona {
	return {
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
	};
}

function translations(): Record<string, unknown> {
	return {
		tarificacion: {
			p20: {
				title: 'Datos del tomador',
				subtitle: 'Completa sus datos',
				form_title: 'Introduce los datos del tomador',
				registration: 'Matrícula',
				modality: 'Modalidad',
				finish: 'Finalizar',
				success: 'Datos guardados correctamente'
			},
			datosPersona: {
				nif: { label: 'NIF', placeholder: '' },
				nombre: { label: 'Nombre' },
				primerApellido: { label: 'Primer apellido' },
				segundoApellido: { label: 'Segundo apellido' },
				sexo: { label: 'Sexo', hombre: 'Hombre', mujer: 'Mujer' },
				fechaNacimiento: { label: 'Nacimiento' },
				fechaEmisionCarnet: { label: 'Carné' },
				direccion: { label: 'Dirección', placeholder: '' },
				numero: { label: 'Número' },
				piso: { label: 'Piso' },
				bloque: { label: 'Bloque' },
				letra: { label: 'Letra' },
				telefono: { prefijo: 'Prefijo', label: 'Móvil', placeholder: '', sinResultados: 'Sin resultados' },
				email: { label: 'Email', placeholder: '' },
				privacidad: { label: 'Privacidad' },
				errors: {
					required: 'Obligatorio',
					nif: 'NIF inválido',
					fechaNacimiento: 'Nacimiento inválido',
					fechaEmisionCarnet: 'Carné inválido',
					telefono: 'Móvil inválido',
					email: 'Correo inválido',
					privacidad: 'Privacidad obligatoria'
				}
			}
		}
	};
}
