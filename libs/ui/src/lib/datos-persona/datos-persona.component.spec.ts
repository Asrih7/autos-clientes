import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { DATOS_PERSONA_VACIOS, DatosPersona, DatosPersonaField } from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent } from './datos-persona.component';

describe('DatosPersonaComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				DatosPersonaComponent,
				TranslocoTestingModule.forRoot({
					langs: { es: { tarificacion: { datosPersona: getTranslations() } } },
					translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
					preloadLangs: true
				})
			]
		}).compileComponents();
	});

	it('renders only the configured fields in their generic order', () => {
		const { fixture } = createComponent(['nif', 'direccion', 'numero', 'email']);
		const ids = [...fixture.nativeElement.querySelectorAll('bal-input')].map((input: Element) => input.id);

		expect(ids).toEqual(['nif', 'direccion', 'numero', 'email']);
		expect(fixture.nativeElement.querySelector('bal-checkbox')).toBeNull();
	});

	it('keeps hidden values and defaults the searchable country selector to Spain', () => {
		const datos = { ...DATOS_PERSONA_VACIOS, nombre: 'Ana' };
		const { component, fixture } = createComponent(['telefonoMovil'], datos);
		const select = fixture.nativeElement.querySelector('bal-select');

		expect(select.value).toBe('ESP');
		expect(select.filter).toBe(true);
		expect(fixture.nativeElement.textContent).toContain('+34 (ESP)');

		fixture.componentRef.setInput('camposVisibles', []);
		fixture.detectChanges();
		expect(component.datos().nombre).toBe('Ana');
	});

	it('renders sex as a two-option button group', () => {
		const { fixture } = createComponent(['sexo']);
		const group = fixture.nativeElement.querySelector('bal-radio-group');

		expect(group.interface).toBe('button');
		expect(group.columns).toBe(2);
		expect(fixture.nativeElement.querySelectorAll('bal-radio')).toHaveLength(2);
	});

	it('shows accessible errors on submit and emits data and validity changes', () => {
		const { component, fixture } = createComponent(['email'], DATOS_PERSONA_VACIOS, true);
		const validity = vi.fn();
		component.validezChange.subscribe(validity);
		const access = component as unknown as { actualizarTexto: (field: 'email', event: Event) => void };

		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Correo inválido');

		access.actualizarTexto('email', new CustomEvent('balInput', { detail: 'persona@example.com' }));
		fixture.detectChanges();

		expect(component.datos().email).toBe('persona@example.com');
		expect(validity).toHaveBeenLastCalledWith(true);
		expect(fixture.nativeElement.querySelector('bal-field-message')).toBeNull();
	});

	function createComponent(
		camposVisibles: readonly DatosPersonaField[],
		datos: DatosPersona = DATOS_PERSONA_VACIOS,
		mostrarErrores = false
	): { component: DatosPersonaComponent; fixture: ComponentFixture<DatosPersonaComponent> } {
		const fixture = TestBed.createComponent(DatosPersonaComponent);
		fixture.componentRef.setInput('datos', datos);
		fixture.componentRef.setInput('camposVisibles', camposVisibles);
		fixture.componentRef.setInput('mostrarErrores', mostrarErrores);
		fixture.detectChanges();
		return { component: fixture.componentInstance, fixture };
	}
});

function getTranslations(): Record<string, unknown> {
	return {
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
	};
}
