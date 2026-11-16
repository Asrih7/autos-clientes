import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
	BalButton,
	BalCard,
	BalCardContent,
	BalData,
	BalDataItem,
	BalDataLabel,
	BalDataValue,
	BalHeading,
	BalIcon,
	BalNotification
} from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	ContratacionStore,
	RolesStore,
	VehiculoStore,
	CorePersistenceStore,
	assembleDatosTomador,
	assembleDatosConductorPrincipal,
	assembleDatosPropietarioVehiculo,
	assembleDatosPersonaRol
} from '@mnv-autos-clientes/data';
import { DatosPersona } from '@mnv-autos-clientes/shared';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import {
	enmascararDocumento,
	enmascararEmail,
	enmascararIban,
	enmascararTelefono,
	formatearFechaIso
} from './resumen-display.utils';

type RolInterviniente = 'tomador' | 'conductor' | 'propietario' | 'segundoConductor';

interface IntervinienteResumen {
	readonly rol: RolInterviniente;
	readonly esTomador: boolean;
	readonly nombre: string;
	readonly documento: string;
	readonly fechaNacimiento: string;
	readonly fechaCarnet: string;
}

@Component({
	selector: 'lib-step-resumen',
	imports: [
		BalButton,
		BalCard,
		BalCardContent,
		BalData,
		BalDataItem,
		BalDataLabel,
		BalDataValue,
		BalHeading,
		BalIcon,
		BalNotification,
		DecimalPipe,
		TranslocoDirective,
		VehiclePriceSummaryComponent
	],
	templateUrl: './step-resumen.component.html',
	styleUrl: './step-resumen.component.scss',
	host: { class: 'w-full' }
})
export class StepResumenComponent {
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly rolesStore = inject(RolesStore);
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly coreStore = inject(CorePersistenceStore);

	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly contratacionSlice = this.contratacionStore.state;
	protected readonly rolesSlice = this.rolesStore.state;
	protected readonly vehiculoSlice = this.vehiculoStore.state;

	protected readonly modalidad = computed(() => this.contratacionSlice().modalidadSeleccionada ?? null);

	protected readonly tomador = computed(() => assembleDatosTomador(this.coreStore.globalSnapshot()));
	protected readonly nombre = computed(() => this.tomador().nombre.trim());
	protected readonly fechaInicio = computed(() => formatearFechaIso(this.contratacionSlice().fechaEfectoPoliza));
	protected readonly cuenta = computed(() => enmascararIban(this.contratacionSlice().iban));
	protected readonly email = computed(() => enmascararEmail(this.tomador().email));
	protected readonly telefono = computed(() =>
		enmascararTelefono(this.tomador().prefijoTelefono, this.tomador().telefonoMovil)
	);

	protected readonly coberturasIncluidas = computed(() => this.modalidad()?.coberturasIncluidas ?? []);

	protected readonly coberturasOpcionales = computed(() => {
		const contratacion = this.contratacionSlice();
		const codigoModalidad = this.modalidad()?.codigo;

		const codigosSeleccionados = codigoModalidad
			? (contratacion.coberturasOpcionalesPorEscenario?.[codigoModalidad] ??
				contratacion.coberturasOpcionalesSeleccionadas)
			: contratacion.coberturasOpcionalesSeleccionadas;

		const seleccionadas = new Set(codigosSeleccionados ?? []);
		const incluidas = new Set(this.coberturasIncluidas().map((cobertura) => cobertura.codigo));

		return (this.modalidad()?.coberturasOpcionales ?? []).filter(
			(cobertura) =>
				(seleccionadas.has(cobertura.codigo) || cobertura.contratada === true) && !incluidas.has(cobertura.codigo)
		);
	});

	protected readonly intervinientes = computed<IntervinienteResumen[]>(() => {
		const fullSnapshot = this.coreStore.globalSnapshot();
		const roles = this.rolesSlice();
		const tomador = this.tomador();

		const intervinientes: IntervinienteResumen[] = [this.resumirPersona('tomador', tomador)];

		intervinientes.push(
			this.resumirPersona(
				'conductor',
				assembleDatosConductorPrincipal(fullSnapshot),
				roles.esTomadorConductorPrincipal === true
			)
		);
		intervinientes.push(
			this.resumirPersona(
				'propietario',
				assembleDatosPropietarioVehiculo(fullSnapshot),
				roles.esTomadorPropietarioVehiculo === true
			)
		);

		if (roles.quiereSegundoConductor) {
			intervinientes.push(
				this.resumirPersona('segundoConductor', assembleDatosPersonaRol('segundoConductor', fullSnapshot))
			);
		}
		return intervinientes;
	});

	protected readonly vehiculo = computed(() => {
		const vehiculoData = this.vehiculoSlice();
		const manual = vehiculoData.versionSeleccionada;
		const encontrado =
			vehiculoData.busqueda?.versiones?.find((version) => version.version.id === vehiculoData.versionId) ??
			vehiculoData.busqueda?.versiones?.[0];

		const marca = manual?.marca?.nombre ?? encontrado?.marca?.nombre ?? vehiculoData.marcaSeleccionada?.nombre ?? '';
		const modelo =
			manual?.modelo?.nombre ?? encontrado?.modelo?.nombre ?? vehiculoData.modeloSeleccionado?.nombre ?? '';
		const version = manual?.version?.nombre ?? encontrado?.version?.nombre ?? '';
		const cilindrada = manual?.cilindradaCc ?? encontrado?.motorizacion?.cilindradaCc;
		const potencia = manual?.potenciaCv ?? encontrado?.motorizacion?.potenciaCv;
		const puertas = manual?.numeroPuertas ?? encontrado?.caracteristicas?.numeroPuertas;
		const anio = manual?.anioLanzamiento ?? encontrado?.comercial?.anioLanzamiento;

		const detalle = [
			version,
			cilindrada ? `${cilindrada} cc` : '',
			potencia ? `${potencia} CV` : '',
			anio ? `(${anio})` : ''
		]
			.filter(Boolean)
			.join(', ');

		return { marca, modelo, version, puertas, titulo: [marca, modelo].filter(Boolean).join(' '), detalle };
	});

	protected volver(): void {
		this.navigation.back();
	}

	private resumirPersona(rol: RolInterviniente, persona: DatosPersona, esTomador = false): IntervinienteResumen {
		return {
			rol,
			esTomador,
			nombre: [persona.nombre, persona.primerApellido, persona.segundoApellido].filter(Boolean).join(' '),
			documento: enmascararDocumento(persona.nif),
			fechaNacimiento: formatearFechaIso(persona.fechaNacimiento),
			fechaCarnet: formatearFechaIso(persona.fechaEmisionCarnet)
		};
	}
}
