import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalHeading, BalNotification } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import {
	DatosPersona,
	DatosPersonaField,
	normalizarTelefonoMovil,
	validarDatosPersona
} from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent, VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p20-tomador',
	host: { class: 'w-full' },
	imports: [
		BalButton,
		BalHeading,
		BalNotification,
		DatosPersonaComponent,
		TranslocoDirective,
		VehiclePriceSummaryComponent
	],
	templateUrl: './step-p20-tomador.component.html'
})
export class StepP20TomadorComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly state = inject(InsuranceStateService);
	private readonly datosConductor = this.state.getDatosPersona();

	protected readonly camposVisibles = TODOS_LOS_CAMPOS_DATOS_PERSONA;
	protected readonly camposBloqueados = getCamposBloqueados(this.datosConductor, this.state);
	protected readonly datos = signal<DatosPersona>(this.inicializarDatosTomador());
	protected readonly mostrarErrores = signal(false);
	protected readonly formularioValido = signal(false);
	protected readonly finalizado = signal(false);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);

	constructor() {
		this.state.saveDatosTomador(this.datos());
	}

	protected actualizarDatos(datos: DatosPersona): void {
		this.datos.set(datos);
		this.finalizado.set(false);
		this.state.saveDatosTomador(datos);
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected finalizar(): void {
		this.mostrarErrores.set(true);
		const datosNormalizados = normalizarDatosTomador(this.datos());
		this.actualizarDatos(datosNormalizados);
		const valido = validarDatosPersona(datosNormalizados, this.camposVisibles).valido;
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

	private inicializarDatosTomador(): DatosPersona {
		const datosGuardados = this.state.formData().datosTomador
			? this.state.getDatosTomador()
			: { ...this.datosConductor };
		const nifBloqueado = this.camposBloqueados.includes('nif');
		const domicilioBloqueado = this.camposBloqueados.includes('direccion');

		return {
			...datosGuardados,
			...(nifBloqueado ? { nif: this.datosConductor.nif } : {}),
			...(domicilioBloqueado
				? {
						direccion: this.datosConductor.direccion,
						numero: this.datosConductor.numero,
						piso: this.datosConductor.piso,
						bloque: this.datosConductor.bloque,
						letra: this.datosConductor.letra
					}
				: {})
		};
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

function normalizarDatosTomador(datos: DatosPersona): DatosPersona {
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
