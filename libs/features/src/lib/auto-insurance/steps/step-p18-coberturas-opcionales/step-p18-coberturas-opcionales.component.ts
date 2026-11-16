import { Component, computed, inject, signal } from '@angular/core';
import {
	BalButton,
	BalCard,
	BalCardContent,
	BalCheckbox,
	BalHeading,
	BalIcon,
	BalTooltip,
	parseCustomEvent
} from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	CoberturaOpcional,
	ContratacionStore,
	CotizacionService,
	P18CoberturasOpcionalesService,
	VehiculoStore
} from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p18-coberturas-opcionales',
	imports: [
		BalButton,
		BalCard,
		BalCardContent,
		BalCheckbox,
		BalHeading,
		BalIcon,
		BalTooltip,
		VehiclePriceSummaryComponent,
		TranslocoDirective
	],
	templateUrl: './step-p18-coberturas-opcionales.component.html',
	host: { class: 'w-full' }
})
export class Step18CoberturasOpcionales {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly contratacionStore = inject(ContratacionStore);
	protected readonly vehiculoStore = inject(VehiculoStore);
	private readonly coberturasService = inject(P18CoberturasOpcionalesService);
	private readonly cotizacionService = inject(CotizacionService);

	protected readonly coberturas = this.coberturasService.coberturas;
	protected readonly seleccionadas = this.coberturasService.seleccionadas;

	private readonly coberturasTarificadas = signal<string[]>([]);
	private readonly precioTarificado = signal<number | null>(null);

	protected readonly recalculando = signal(false);
	protected readonly coberturaExpandida = signal<string | null>(null);

	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);

	protected readonly requiereRecalculo = computed(() => {
		const current = [...this.seleccionadas()].sort().join('|');
		const calculated = [...this.coberturasTarificadas()].sort().join('|');
		return current !== calculated;
	});

	protected readonly precio = computed(() => this.precioTarificado() ?? this.modalidad()?.primaTotal ?? 0);
	protected readonly literalBoton = computed(() =>
		this.recalculando() ? 'Recalculando...' : this.requiereRecalculo() ? 'Recalcular' : 'Siguiente'
	);

	constructor() {
		const contratacion = this.contratacionStore.state();
		let initiallySelected = contratacion.coberturasOpcionalesSeleccionadas;

		if (!initiallySelected || initiallySelected.length === 0) {
			const escenario = contratacion.cotizacion?.escenarios.find(
				(item) => item.codigo === contratacion.modalidadSeleccionada?.codigo
			);

			initiallySelected = (escenario?.coberturasOpcionales ?? [])
				.filter((cobertura) => cobertura.contratada)
				.map((cobertura) => cobertura.codigo);
		}

		this.coberturasService.cargarCoberturas(initiallySelected);
		this.coberturasTarificadas.set([...initiallySelected]);
	}

	protected cambiarCobertura(cobertura: CoberturaOpcional, event: Event): void {
		const marcada = Boolean(parseCustomEvent(event));
		this.coberturasService.cambiarSeleccion(cobertura.codigo, marcada);

		const codigoEscenario = this.modalidad()?.codigo;
		const porEscenario = this.contratacionStore.state().coberturasOpcionalesPorEscenario ?? {};

		const updatedEscenarioMap = codigoEscenario
			? { ...porEscenario, [codigoEscenario]: this.seleccionadas() }
			: porEscenario;

		this.contratacionStore.guardarSeleccionCoberturasYEscenarios(this.seleccionadas(), updatedEscenarioMap);
	}

	protected estaSeleccionada(cobertura: CoberturaOpcional): boolean {
		return this.coberturasService.estaSeleccionada(cobertura.codigo);
	}

	protected estaExpandida(cobertura: CoberturaOpcional): boolean {
		return this.coberturaExpandida() === cobertura.codigo;
	}

	protected alternarDetalle(cobertura: CoberturaOpcional): void {
		this.coberturaExpandida.update((actual) => (actual === cobertura.codigo ? null : cobertura.codigo));
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected gestionarAccionPrincipal(): void {
		if (this.recalculando()) return;

		if (this.requiereRecalculo()) {
			this.recalcular();
		} else {
			this.avanzar();
		}
	}

	private recalcular(): void {
		this.recalculando.set(true);
		this.cotizacionService.cotizar().subscribe({
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

				this.coberturasTarificadas.set([...this.seleccionadas()]);
				this.recalculando.set(false);
			},
			error: () => this.recalculando.set(false)
		});
	}

	protected avanzar(): void {
		this.navigation.next();
	}

	protected tituloVehiculo(): string {
		const vehiculoData = this.vehiculoStore.state();
		const version = vehiculoData.versionSeleccionada;
		return version
			? `${version.marca.nombre} ${version.modelo.nombre}`
			: [vehiculoData.marcaSeleccionada?.nombre, vehiculoData.modeloSeleccionado?.nombre].filter(Boolean).join(' ') ||
					'Vehículo seleccionado';
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
}
