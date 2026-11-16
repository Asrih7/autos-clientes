import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { BalButton, BalHeading, BalNotification } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	ContratacionStore,
	CorePersistenceStore,
	CotizacionService,
	DatosPersonaRol,
	RolesStore,
	VehiculoStore
} from '@mnv-autos-clientes/data';
import {
	DATOS_PERSONA_VACIOS,
	DatosPersona,
	DatosPersonaField,
	esNifNieValido,
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
	private readonly cotizacion = inject(CotizacionService);

	private readonly rolesStore = inject(RolesStore);
	protected readonly vehiculoStore = inject(VehiculoStore);
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly coreStore = inject(CorePersistenceStore);

	readonly rol = input.required<DatosPersonaRol>();
	readonly prefijoTraduccion = input.required<string>();
	readonly precargarDesdeConductor = input(false);
	readonly continuarAlFinalizar = input(false);
	readonly retarificarSiempreAlFinalizar = input(false);
	readonly retarificarSiCambiaFechaCarnet = input(false);
	readonly solicitarCodigoPostalManual = input(false);

	protected readonly camposVisibles = TODOS_LOS_CAMPOS_DATOS_PERSONA;
	protected readonly camposBloqueados = signal<readonly DatosPersonaField[]>([]);
	protected readonly datos = signal<DatosPersona>({ ...DATOS_PERSONA_VACIOS });
	protected readonly mostrarErrores = signal(false);
	protected readonly formularioValido = signal(false);
	protected readonly finalizado = signal(false);
	protected readonly recalculando = signal(false);

	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);
	private datosIniciales: DatosPersona = { ...DATOS_PERSONA_VACIOS };

	ngOnInit(): void {
		const datosConductor = this.coreStore.datosFormularioActivo();
		const camposBloqueados = this.precargarDesdeConductor() ? getCamposBloqueados(datosConductor) : [];

		const datosIniciales = this.hasDatosPersonaRol(this.rol())
			? this.getDatosPersonaRol(this.rol())
			: this.precargarDesdeConductor()
				? { ...datosConductor }
				: { ...DATOS_PERSONA_VACIOS };

		this.camposBloqueados.set(camposBloqueados);
		this.datos.set(sincronizarCamposBloqueados(datosIniciales, datosConductor, camposBloqueados));
		this.datosIniciales = this.datos();

		this.rolesStore.guardarDatosPersonaRol(this.rol(), this.datos());
	}

	protected actualizarDatos(datos: DatosPersona): void {
		this.datos.set(datos);
		this.finalizado.set(false);

		this.rolesStore.guardarDatosPersonaRol(this.rol(), datos);
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected finalizar(): void {
		this.mostrarErrores.set(true);
		this.actualizarDatos(normalizarDatosPersonaRol(this.datos()));
		const valido = this.formularioValido();
		this.formularioValido.set(valido);
		this.finalizado.set(valido);
		if (!valido) return;

		const debeRetarificar =
			this.retarificarSiempreAlFinalizar() ||
			(this.retarificarSiCambiaFechaCarnet() &&
				this.datosIniciales.fechaEmisionCarnet !== this.datos().fechaEmisionCarnet);
		if (!debeRetarificar) {
			if (this.continuarAlFinalizar()) this.navigation.next();
			return;
		}

		this.recalcularPrecio();
	}

	private recalcularPrecio(): void {
		if (this.recalculando()) return;
		this.recalculando.set(true);
		this.cotizacion.cotizar().subscribe({
			next: (respuesta) => {
				const modalidadActual = this.modalidad();
				const escenario = respuesta.escenarios.find((item) => item.codigo === modalidadActual?.codigo);
				if (modalidadActual && escenario) {
					this.contratacionStore.confirmarModalidadSeleccionada({
						...modalidadActual,
						primaTotal: escenario.primaTotal,
						primerRecibo: escenario.primerRecibo,
						restoRecibos: escenario.restoRecibos,
						coberturasIncluidas: escenario.coberturasObligatorias,
						coberturasOpcionales: escenario.coberturasOpcionales
					});
				}
				this.datosIniciales = this.datos();
				this.recalculando.set(false);
				if (this.continuarAlFinalizar()) this.navigation.next();
			},
			error: () => this.recalculando.set(false)
		});
	}

	protected tituloVehiculo(): string {
		const vehiculoData = this.vehiculoStore.state();
		const version = vehiculoData.versionSeleccionada;
		if (version) return `${version.marca.nombre} ${version.modelo.nombre}`;

		const versionMatricula =
			vehiculoData.busqueda?.versiones?.find((item) => item.version.id === vehiculoData.versionId) ??
			vehiculoData.busqueda?.versiones?.[0];
		return (
			[
				versionMatricula?.marca?.nombre,
				versionMatricula?.modelo?.nombre,
				vehiculoData.marcaSeleccionada?.nombre,
				vehiculoData.modeloSeleccionado?.nombre
			]
				.filter(Boolean)
				.slice(0, 2)
				.join(' ') || 'Vehículo seleccionado'
		);
	}

	protected detalleVehiculo(): string {
		const version = this.vehiculoStore.state().versionSeleccionada;
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

	private hasDatosPersonaRol(rol: DatosPersonaRol): boolean {
		const datos = this.getDatosPersonaRol(rol);
		return !!datos && datos.nif !== '';
	}

	private getDatosPersonaRol(rol: DatosPersonaRol): DatosPersona {
		const rolesState = this.rolesStore.state();
		switch (rol) {
			case 'tomador':
				return rolesState.datosTomador ?? { ...DATOS_PERSONA_VACIOS };
			case 'propietario':
				return rolesState.datosPropietario ?? { ...DATOS_PERSONA_VACIOS };
			case 'conductorVehiculo':
				return rolesState.datosConductorVehiculo ?? { ...DATOS_PERSONA_VACIOS };
			case 'segundoConductor':
				return rolesState.datosSegundoConductor ?? { ...DATOS_PERSONA_VACIOS };
			default:
				return { ...DATOS_PERSONA_VACIOS };
		}
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

function getCamposBloqueados(datosConductor: DatosPersona): readonly DatosPersonaField[] {
	const campos: DatosPersonaField[] = [];
	if (esNifNieValido(datosConductor.nif)) campos.push('nif');
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
