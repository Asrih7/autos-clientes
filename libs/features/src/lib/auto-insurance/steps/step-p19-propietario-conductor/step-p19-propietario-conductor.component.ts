import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalHeading } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p19-propietario-conductor',
	host: { class: 'w-full' },
	imports: [BalButton, BalHeading, TranslocoDirective, VehiclePriceSummaryComponent],
	templateUrl: './step-p19-propietario-conductor.component.html'
})
export class StepP19PropietarioConductorComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly state = inject(InsuranceStateService);
	protected readonly esTomadorConductorPrincipal = signal<boolean | null>(
		this.state.formData().esTomadorConductorPrincipal ?? null
	);
	protected readonly esTomadorPropietarioVehiculo = signal<boolean | null>(
		this.state.formData().esTomadorPropietarioVehiculo ?? null
	);
	protected readonly puedeContinuar = computed(
		() => this.esTomadorConductorPrincipal() !== null && this.esTomadorPropietarioVehiculo() !== null
	);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);

	protected seleccionarTomadorConductorPrincipal(respuesta: boolean): void {
		this.esTomadorConductorPrincipal.set(respuesta);
		this.state.saveData({ esTomadorConductorPrincipal: respuesta });
	}

	protected seleccionarTomadorPropietarioVehiculo(respuesta: boolean): void {
		this.esTomadorPropietarioVehiculo.set(respuesta);
		this.state.saveData({ esTomadorPropietarioVehiculo: respuesta });
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected continuar(): void {
		if (!this.puedeContinuar()) return;
		this.navigation.next();
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
