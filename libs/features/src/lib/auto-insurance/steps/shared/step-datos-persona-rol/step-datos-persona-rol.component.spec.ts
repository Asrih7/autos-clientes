import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceApiService, DatosPersonaRol, InsuranceStateService } from '@mnv-autos-clientes/data';
import { DATOS_PERSONA_VACIOS, DatosPersona, DatosPersonaField } from '@mnv-autos-clientes/shared';
import { GooglePlacesAutocompleteService, VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { StepP27PropietarioComponent } from '../../step-p27-propietario/step-p27-propietario.component';
import { StepP28ConductorComponent } from '../../step-p28-conductor/step-p28-conductor.component';
import { StepP29SegundoConductorComponent } from '../../step-p29-segundo-conductor/step-p29-segundo-conductor.component';
import { StepDatosPersonaRolComponent } from './step-datos-persona-rol.component';

const ROLE_CASES: readonly {
	component: Type<unknown>;
	rol: DatosPersonaRol;
	texto: string;
}[] = [
	{
		component: StepP27PropietarioComponent,
		rol: 'propietario',
		texto: 'Introduce los datos del propietario del vehículo'
	},
	{
		component: StepP28ConductorComponent,
		rol: 'conductorVehiculo',
		texto: 'Introduce los datos del conductor del vehículo'
	},
	{
		component: StepP29SegundoConductorComponent,
		rol: 'segundoConductor',
		texto: 'Introduce los datos del segundo conductor'
	}
];

describe('Steps de datos de persona por rol', () => {
	let stateService: InsuranceStateService;

	beforeEach(async () => {
		sessionStorage.clear();

		await TestBed.configureTestingModule({
			imports: [
				StepP27PropietarioComponent,
				StepP28ConductorComponent,
				StepP29SegundoConductorComponent,
				TranslocoTestingModule.forRoot({
					langs: { es: translations() },
					translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
					preloadLangs: true
				})
			],
			providers: [
				{ provide: InsuranceNavigationService, useValue: { back: vi.fn() } },
				{ provide: AutoInsuranceApiService, useValue: { limpiarCache: vi.fn() } },
				{
					provide: GooglePlacesAutocompleteService,
					useValue: { conectarAutocomplete: vi.fn().mockResolvedValue(null) }
				}
			]
		}).compileComponents();

		stateService = TestBed.inject(InsuranceStateService);
		stateService.saveData({ nif: '12345678Z', nombre: 'Conductor principal', matricula: '1234ABC' });
	});

	for (const roleCase of ROLE_CASES) {
		it(`renders and persists ${roleCase.rol} independently`, () => {
			const fixture = TestBed.createComponent(roleCase.component);
			fixture.detectChanges();
			const access = getRoleAccess(
				fixture.debugElement.query(By.directive(StepDatosPersonaRolComponent)).componentInstance
			);

			expect(access.camposVisibles).toHaveLength(15);
			expect(access.camposBloqueados()).toEqual([]);
			expect(access.datos()).toEqual(DATOS_PERSONA_VACIOS);
			expect(fixture.nativeElement.textContent).toContain(roleCase.texto);
			expect(fixture.debugElement.query(By.directive(VehiclePriceSummaryComponent))).toBeTruthy();

			access.actualizarDatos({ ...DATOS_PERSONA_VACIOS, nombre: roleCase.rol });

			expect(stateService.getDatosPersonaRol(roleCase.rol).nombre).toBe(roleCase.rol);
			expect(stateService.formData().nombre).toBe('Conductor principal');
			expect(stateService.formData().datosTomador).toBeUndefined();

			fixture.destroy();
			const restoredFixture = TestBed.createComponent(roleCase.component);
			restoredFixture.detectChanges();
			const restoredAccess = getRoleAccess(
				restoredFixture.debugElement.query(By.directive(StepDatosPersonaRolComponent)).componentInstance
			);
			expect(restoredAccess.datos().nombre).toBe(roleCase.rol);
		});
	}

	it('validates completion through the shared role form', () => {
		const fixture = TestBed.createComponent(StepP27PropietarioComponent);
		fixture.detectChanges();
		const access = getRoleAccess(
			fixture.debugElement.query(By.directive(StepDatosPersonaRolComponent)).componentInstance
		);

		access.finalizar();
		expect(access.mostrarErrores()).toBe(true);
		expect(access.finalizado()).toBe(false);

		access.actualizarDatos(validPersona());
		access.finalizar();
		fixture.detectChanges();

		expect(access.finalizado()).toBe(true);
		expect(stateService.isDatosPersonaRolValido('propietario')).toBe(true);
		expect(fixture.nativeElement.textContent).toContain('Datos guardados correctamente');
	});
});

function getRoleAccess(component: StepDatosPersonaRolComponent): {
	camposVisibles: readonly DatosPersonaField[];
	camposBloqueados: () => readonly DatosPersonaField[];
	datos: () => DatosPersona;
	mostrarErrores: () => boolean;
	finalizado: () => boolean;
	actualizarDatos: (datos: DatosPersona) => void;
	finalizar: () => void;
} {
	return component as unknown as {
		camposVisibles: readonly DatosPersonaField[];
		camposBloqueados: () => readonly DatosPersonaField[];
		datos: () => DatosPersona;
		mostrarErrores: () => boolean;
		finalizado: () => boolean;
		actualizarDatos: (datos: DatosPersona) => void;
		finalizar: () => void;
	};
}

function validPersona(): DatosPersona {
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
	const common = {
		title: 'Contratación online',
		registration: 'Matrícula',
		modality: 'Modalidad',
		finish: 'Finalizar',
		success: 'Datos guardados correctamente'
	};

	return {
		tarificacion: {
			p27: {
				...common,
				subtitle: 'Datos del propietario',
				form_title: 'Introduce los datos del propietario del vehículo'
			},
			p28: {
				...common,
				subtitle: 'Datos del conductor',
				form_title: 'Introduce los datos del conductor del vehículo'
			},
			p29: {
				...common,
				subtitle: 'Datos del segundo conductor',
				form_title: 'Introduce los datos del segundo conductor'
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
