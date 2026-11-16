import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalHeading } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { ContratacionStore, RolesStore, VehiculoStore } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p19-propietario-conductor',
	host: { class: 'w-full' },
	imports: [BalButton, BalHeading, TranslocoDirective, VehiclePriceSummaryComponent],
	templateUrl: './step-p19-propietario-conductor.component.html'
})
export class StepP19PropietarioConductorComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly rolesStore = inject(RolesStore);
	protected readonly vehiculoStore = inject(VehiculoStore);
	protected readonly contratacionStore = inject(ContratacionStore);

	protected readonly esTomadorConductorPrincipal = signal<boolean | null>(
		this.rolesStore.state().esTomadorConductorPrincipal ?? null
	);
	protected readonly esTomadorPropietarioVehiculo = signal<boolean | null>(
		this.rolesStore.state().esTomadorPropietarioVehiculo ?? null
	);
	
	protected readonly puedeContinuar = computed(
		() => this.esTomadorConductorPrincipal() !== null && this.esTomadorPropietarioVehiculo() !== null
	);
	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);

	protected seleccionarTomadorConductorPrincipal(respuesta: boolean): void {
		this.esTomadorConductorPrincipal.set(respuesta);
		this.rolesStore.guardarTomadorConductorPrincipal(respuesta);
	}

	protected seleccionarTomadorPropietarioVehiculo(respuesta: boolean): void {
		this.esTomadorPropietarioVehiculo.set(respuesta);
		this.rolesStore.guardarTomadorPropietarioVehiculo(respuesta);
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected continuar(): void {
		if (!this.puedeContinuar()) return;
		this.navigation.next();
	}

	protected tituloVehiculo(): string {
		const vehiculoData = this.vehiculoStore.state();
		const version = vehiculoData.versionSeleccionada;
		if (version) return `${version.marca.nombre} ${version.modelo.nombre}`;

		const versionMatricula =
			vehiculoData.busqueda?.versiones?.find((item) => item.version.id === vehiculoData.versionId) ?? vehiculoData.busqueda?.versiones?.[0];
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
