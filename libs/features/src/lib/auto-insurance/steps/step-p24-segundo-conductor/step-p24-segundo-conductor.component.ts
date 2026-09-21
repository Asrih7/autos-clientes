import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalHeading, BalIcon, BalTooltip } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective } from '@jsverse/transloco';


@Component({
	selector: 'lib-step-p24-segundo-conductor',
	imports: [BalButton, BalHeading, BalIcon, BalTooltip, VehiclePriceSummaryComponent,TranslocoDirective],
	templateUrl: './step-p24-segundo-conductor.component.html',
	host: { class: 'w-full' }
})
export class StepP24SegundoConductorComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly state = inject(InsuranceStateService);
	protected readonly respuestaSeleccionada = signal<boolean | null>(this.state.formData().quiereSegundoConductor ?? null);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);

	protected seleccionarRespuesta(respuesta: boolean): void {
		this.respuestaSeleccionada.set(respuesta);
		this.state.saveData({ quiereSegundoConductor: respuesta });
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected continuar(): void {
		if (this.respuestaSeleccionada() === null) return;
		this.navigation.next();
	}

	protected tituloVehiculo(): string {
		const data = this.state.formData();
		const version = data.versionSeleccionada;
		if (version) return `${version.marca.nombre} ${version.modelo.nombre}`;

		const versionMatricula = data.vehiculo?.versiones.find((item) => item.version.id === data.versionId) ?? data.vehiculo?.versiones[0];
		return [versionMatricula?.marca.nombre, versionMatricula?.modelo.nombre, data.marcaSeleccionada?.nombre, data.modeloSeleccionado?.nombre]
			.filter(Boolean)
			.slice(0, 2)
			.join(' ') || 'Vehículo seleccionado';
	}

	protected detalleVehiculo(): string {
		const version = this.state.formData().versionSeleccionada;
		return version
			? [version.version.nombre, `${version.cilindradaCc}cc`, `${version.potenciaCv}CV`, `${version.numeroPuertas} puertas`, `(${version.anioLanzamiento})`].join(', ')
			: '';
	}
}
