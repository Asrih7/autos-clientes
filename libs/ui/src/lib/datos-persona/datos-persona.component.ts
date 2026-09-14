import { ChangeDetectionStrategy, Component, computed, input, model, OnChanges, output, signal } from '@angular/core';
import {
	BalCheckbox,
	BalDate,
	BalField,
	BalFieldControl,
	BalFieldLabel,
	BalFieldMessage,
	BalInput,
	BalRadio,
	BalRadioGroup,
	BalSelect,
	BalSelectOption,
	parseCustomEvent
} from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import {
	DatosPersona,
	DatosPersonaField,
	esCampoDatosPersonaObligatorio,
	normalizarTelefonoMovil,
	PREFIJOS_TELEFONICOS,
	SexoPersona,
	validarDatosPersona
} from '@mnv-autos-clientes/shared';

@Component({
	selector: 'lib-datos-persona',
	host: { class: 'w-full' },
	imports: [
		BalCheckbox,
		BalDate,
		BalField,
		BalFieldControl,
		BalFieldLabel,
		BalFieldMessage,
		BalInput,
		BalRadio,
		BalRadioGroup,
		BalSelect,
		BalSelectOption,
		TranslocoDirective
	],
	templateUrl: './datos-persona.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatosPersonaComponent implements OnChanges {
	readonly datos = model.required<DatosPersona>();
	readonly camposVisibles = input.required<readonly DatosPersonaField[]>();
	readonly mostrarErrores = input(false);
	readonly validezChange = output<boolean>();

	protected readonly prefijosTelefonicos = PREFIJOS_TELEFONICOS;
	protected readonly camposTocados = signal<ReadonlySet<DatosPersonaField>>(new Set());
	protected readonly resultadoValidacion = computed(() => validarDatosPersona(this.datos(), this.camposVisibles()));
	protected readonly fechaNacimientoMinima = getFechaNacimientoMinima();
	protected readonly fechaNacimientoMaxima = getFechaNacimientoMaxima();
	protected readonly fechaEmisionMaxima = formatFechaIso(new Date());
	protected readonly fechaEmisionMinima = computed(() => getFechaCumpleanos18(this.datos().fechaNacimiento));

	ngOnChanges(): void {
		this.emitirValidez();
	}

	protected mostrar(campo: DatosPersonaField): boolean {
		return this.camposVisibles().includes(campo);
	}

	protected obligatorio(campo: DatosPersonaField): boolean {
		return esCampoDatosPersonaObligatorio(campo);
	}

	protected esInvalido(campo: DatosPersonaField): boolean {
		return (
			(this.mostrarErrores() || this.camposTocados().has(campo)) &&
			this.resultadoValidacion().camposInvalidos.has(campo)
		);
	}

	protected actualizarTexto(campo: CampoTextoDatosPersona, event: Event): void {
		const rawValue = parseCustomEvent(event)?.toString() ?? '';
		let value = campo === 'telefonoMovil' ? normalizarTelefonoMovil(rawValue) : rawValue;
		if (campo === 'nif' || campo === 'letra') value = value.toUpperCase();

		this.actualizarDatos({ [campo]: value });
	}

	protected actualizarSexo(event: Event): void {
		const value = parseCustomEvent(event)?.toString() ?? '';
		this.actualizarDatos({ sexo: value === 'HOMBRE' || value === 'MUJER' ? value : null });
	}

	protected actualizarFecha(campo: 'fechaNacimiento' | 'fechaEmisionCarnet', event: Event): void {
		this.actualizarDatos({ [campo]: parseCustomEvent(event)?.toString() ?? '' });
	}

	protected actualizarPaisTelefono(event: Event): void {
		const codigoPais = parseCustomEvent(event)?.toString() ?? '';
		const opcion = this.prefijosTelefonicos.find((prefijo) => prefijo.codigoPais === codigoPais);
		if (!opcion) return;

		this.actualizarDatos({ paisTelefono: opcion.codigoPais, prefijoTelefono: opcion.prefijo });
	}

	protected actualizarPrivacidad(event: Event): void {
		this.actualizarDatos({ privacidadAceptada: Boolean(parseCustomEvent(event)) });
		this.marcarComoTocado('privacidadAceptada');
	}

	protected marcarComoTocado(campo: DatosPersonaField): void {
		this.camposTocados.update((campos) => new Set(campos).add(campo));
	}

	private actualizarDatos(cambios: Partial<DatosPersona>): void {
		this.datos.update((datos) => ({ ...datos, ...cambios }));
		this.emitirValidez();
	}

	private emitirValidez(): void {
		this.validezChange.emit(validarDatosPersona(this.datos(), this.camposVisibles()).valido);
	}
}

type CampoTextoDatosPersona = Exclude<
	DatosPersonaField,
	'sexo' | 'fechaNacimiento' | 'fechaEmisionCarnet' | 'privacidadAceptada'
>;

function getFechaNacimientoMinima(hoy = new Date()): string {
	const fecha = new Date(hoy.getFullYear() - 100, hoy.getMonth(), hoy.getDate() + 1);
	return formatFechaIso(fecha);
}

function getFechaNacimientoMaxima(hoy = new Date()): string {
	return formatFechaIso(new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()));
}

function getFechaCumpleanos18(fechaNacimiento: string): string | undefined {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaNacimiento);
	if (!match) return undefined;

	const nacimiento = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	if (
		nacimiento.getFullYear() !== Number(match[1]) ||
		nacimiento.getMonth() !== Number(match[2]) - 1 ||
		nacimiento.getDate() !== Number(match[3])
	) {
		return undefined;
	}

	return formatFechaIso(new Date(nacimiento.getFullYear() + 18, nacimiento.getMonth(), nacimiento.getDate()));
}

function formatFechaIso(fecha: Date): string {
	const year = fecha.getFullYear();
	const month = String(fecha.getMonth() + 1).padStart(2, '0');
	const day = String(fecha.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
