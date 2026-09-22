import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { BalButton, BalHeading, BalNotification } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { DatosPersonaRol, InsuranceStateService } from '@mnv-autos-clientes/data';
import {
	DATOS_PERSONA_VACIOS,
	DatosPersona,
	DatosPersonaField,
	normalizarTelefonoMovil
} from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent, VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-datos-persona-rol',
	host: { class: 'flex w-full' },
	imports: [
		BalButton,
		BalHeading,
		BalNotification,
		DatosPersonaComponent,
		TranslocoDirective,
		VehiclePriceSummaryComponent
	],
	templateUrl: './step-datos-persona-rol.component.html'
})
export class StepDatosPersonaRolComponent implements OnInit {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly state = inject(InsuranceStateService);

	readonly rol = input.required<DatosPersonaRol>();
	readonly prefijoTraduccion = input.required<string>();
	readonly precargarDesdeConductor = input(false);

	protected readonly camposVisibles = TODOS_LOS_CAMPOS_DATOS_PERSONA;
	protected readonly camposBloqueados = signal<readonly DatosPersonaField[]>([]);
	protected readonly datos = signal<DatosPersona>({ ...DATOS_PERSONA_VACIOS });
	protected readonly mostrarErrores = signal(false);
	protected readonly formularioValido = signal(false);
	protected readonly finalizado = signal(false);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);

	ngOnInit(): void {
		const datosConductor = this.state.getDatosPersona();
		const camposBloqueados = this.precargarDesdeConductor() ? getCamposBloqueados(datosConductor, this.state) : [];
		const datosIniciales = this.state.hasDatosPersonaRol(this.rol())
			? this.state.getDatosPersonaRol(this.rol())
			: this.precargarDesdeConductor()
				? { ...datosConductor }
				: { ...DATOS_PERSONA_VACIOS };

		this.camposBloqueados.set(camposBloqueados);
		this.datos.set(sincronizarCamposBloqueados(datosIniciales, datosConductor, camposBloqueados));
		this.state.saveDatosPersonaRol(this.rol(), this.datos());
	}

	protected actualizarDatos(datos: DatosPersona): void {
		this.datos.set(datos);
		this.finalizado.set(false);
		this.state.saveDatosPersonaRol(this.rol(), datos);
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected finalizar(): void {
		this.mostrarErrores.set(true);
		this.actualizarDatos(normalizarDatosPersonaRol(this.datos()));
		const valido = this.state.isDatosPersonaRolValido(this.rol());
		this.formularioValido.set(valido);
		this.finalizado.set(valido);
	}

	protected tituloVehiculo(): string {
		const data = this.state.formData();
		const version = data.versionSeleccionada;
		if (version) return `${version.marca.nombre} ${version.modelo.nombre}`;

		const versionMatricula =
			data.vehiculo?.versiones.find((item) => item.version.id === data.versionId) ?? data.vehiculo?.versiones[0];
		return (
			[
				versionMatricula?.marca.nombre,
				versionMatricula?.modelo.nombre,
				data.marcaSeleccionada?.nombre,
				data.modeloSeleccionado?.nombre
			]
				.filter(Boolean)
				.slice(0, 2)
				.join(' ') || 'Vehículo seleccionado'
		);
	}

	protected detalleVehiculo(): string {
		const version = this.state.formData().versionSeleccionada;
		return version
			? [
					version.version.nombre,
					`${version.cilindradaCc}cc`,
					`${version.potenciaCv}CV`,
					`${version.numeroPuertas} puertas`,
					`(${version.anioLanzamiento})`
				].join(', ')
			: '';
	}
}

const TODOS_LOS_CAMPOS_DATOS_PERSONA: readonly DatosPersonaField[] = [
	'nif',
	'nombre',
	'primerApellido',
	'segundoApellido',
	'sexo',
	'fechaNacimiento',
	'fechaEmisionCarnet',
	'direccion',
	'numero',
	'piso',
	'bloque',
	'letra',
	'telefonoMovil',
	'email',
	'privacidadAceptada'
];

const CAMPOS_DOMICILIO: readonly DatosPersonaField[] = ['direccion', 'numero', 'piso', 'bloque', 'letra'];

function getCamposBloqueados(datosConductor: DatosPersona, state: InsuranceStateService): readonly DatosPersonaField[] {
	const campos: DatosPersonaField[] = [];
	if (state.isNifNieValido(datosConductor.nif)) campos.push('nif');
	if (datosConductor.direccion.trim() && datosConductor.numero.trim()) campos.push(...CAMPOS_DOMICILIO);
	return campos;
}

function sincronizarCamposBloqueados(
	datos: DatosPersona,
	datosConductor: DatosPersona,
	camposBloqueados: readonly DatosPersonaField[]
): DatosPersona {
	return {
		...datos,
		...(camposBloqueados.includes('nif') ? { nif: datosConductor.nif } : {}),
		...(camposBloqueados.includes('direccion')
			? {
					direccion: datosConductor.direccion,
					numero: datosConductor.numero,
					piso: datosConductor.piso,
					bloque: datosConductor.bloque,
					letra: datosConductor.letra
				}
			: {})
	};
}

function normalizarDatosPersonaRol(datos: DatosPersona): DatosPersona {
	return {
		...datos,
		nif: datos.nif.replace(/[\s-]/g, '').toUpperCase(),
		nombre: datos.nombre.trim(),
		primerApellido: datos.primerApellido.trim(),
		segundoApellido: datos.segundoApellido.trim(),
		direccion: datos.direccion.trim(),
		numero: datos.numero.trim(),
		piso: datos.piso.trim(),
		bloque: datos.bloque.trim(),
		letra: datos.letra.trim().toUpperCase(),
		telefonoMovil: normalizarTelefonoMovil(datos.telefonoMovil),
		email: datos.email.trim()
	};
}
