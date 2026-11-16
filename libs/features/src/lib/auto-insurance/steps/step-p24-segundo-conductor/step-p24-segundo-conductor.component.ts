import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalHeading, BalIcon, BalTooltip } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { ContratacionStore, RolesStore, VehiculoStore } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p24-segundo-conductor',
	imports: [BalButton, BalHeading, BalIcon, BalTooltip, VehiclePriceSummaryComponent, TranslocoDirective],
	templateUrl: './step-p24-segundo-conductor.component.html',
	host: { class: 'w-full' }
})
export class StepP24SegundoConductorComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly vehiculoStore = inject(VehiculoStore);
	protected readonly rolesStore = inject(RolesStore);
	protected readonly contratacionStore = inject(ContratacionStore);

	protected readonly respuestaSeleccionada = signal<boolean | null>(this.rolesStore.state().quiereSegundoConductor ?? null);
	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);

	protected seleccionarRespuesta(respuesta: boolean): void {
		this.respuestaSeleccionada.set(respuesta);
		this.rolesStore.guardarQuiereSegundoConductor(respuesta);
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected continuar(): void {
		if (this.respuestaSeleccionada() === null) return;
		this.navigation.next();
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
}
