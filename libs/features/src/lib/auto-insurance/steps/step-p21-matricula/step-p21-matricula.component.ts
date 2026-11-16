import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalDate, BalField, BalFieldControl, BalFieldLabel, BalFieldMessage, BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { ContratacionStore, CorePersistenceStore, CotizacionService, getFechaMatriculacionParaApi, VehiculoStore } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p21-matricula',
	imports: [BalButton, BalDate, BalField, BalFieldControl, BalFieldLabel, BalFieldMessage, BalInput, TranslocoDirective, VehiclePriceSummaryComponent],
	templateUrl: './step-p21-matricula.component.html',
	host: { class: 'w-full' }
})
export class StepP21MatriculaComponent {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly corePersistenceStore = inject(CorePersistenceStore);
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly cotizacion = inject(CotizacionService);

	protected readonly matricula = signal(this.vehiculoStore.state().matricula ?? '');
	protected readonly fechaMatriculacion = signal(this.fechaInicial());
	private readonly datosTarificados = signal(this.datosIniciales());
	protected readonly recalculando = signal(false);
	
	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);
	protected readonly precio = computed(() => this.modalidad()?.primaTotal ?? 0);
	protected readonly matriculaInvalida = computed(() => !this.matricula().trim());
	protected readonly fechaInvalida = computed(() => !this.parseFecha(this.fechaMatriculacion()));
	
	protected readonly datosActuales = computed(() => this.fechaMatriculacion());
	protected readonly requiereRecalculo = computed(() => !this.matriculaInvalida() && !this.fechaInvalida() && this.datosTarificados() !== this.datosActuales());
	protected readonly literalBoton = computed(() => this.recalculando() ? 'Recalculando...' : this.requiereRecalculo() ? 'Recalcular' : 'Siguiente');

	protected actualizarMatricula(event: Event): void {
		this.matricula.set((parseCustomEvent(event)?.toString() ?? '').toUpperCase());
	}

	protected actualizarFecha(event: Event): void {
		this.fechaMatriculacion.set(parseCustomEvent(event)?.toString() ?? '');
	}

	protected volver(): void { this.navigation.back(); }

	protected continuar(): void {
		if (this.recalculando() || this.matriculaInvalida() || this.fechaInvalida()) return;
		this.guardarDatos();
		if (!this.requiereRecalculo()) {
			this.navigation.next();
			return;
		}

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
				this.datosTarificados.set(this.datosActuales());
				this.recalculando.set(false);
			},
			error: () => this.recalculando.set(false)
		});
	}

	protected tituloVehiculo(): string {
		const vehiculoData = this.vehiculoStore.state();
		const version = vehiculoData.versionSeleccionada;
		return version 
			? `${version.marca.nombre} ${version.modelo.nombre}` 
			: [vehiculoData.marcaSeleccionada?.nombre, vehiculoData.modeloSeleccionado?.nombre].filter(Boolean).join(' ') || 'Vehículo seleccionado';
	}

	protected detalleVehiculo(): string {
		const version = this.vehiculoStore.state().versionSeleccionada;
		return version ? [version.version.nombre, `${version.cilindradaCc}cc`, `${version.potenciaCv}CV`, `${version.numeroPuertas} puertas`, `(${version.anioLanzamiento})`].join(', ') : '';
	}

	private guardarDatos(): void {
		const fecha = this.parseFecha(this.fechaMatriculacion());
		if (!fecha) return;
		
		this.vehiculoStore.guardarMatriculaYFechaOriginal(this.matricula().trim().toUpperCase(), fecha.month, fecha.year);
	}

	private fechaInicial(): string {
		const fechaApi = getFechaMatriculacionParaApi(this.corePersistenceStore.globalSnapshot());
		if (!fechaApi) return '';
		const [dia, mes, anio] = fechaApi.split('/');
		return `${anio}-${mes}-${dia}`; 
	}

	private datosIniciales(): string {
		return this.fechaInicial();
	}

	private parseFecha(value: string): { month: string; year: string } | null {
		const match = /^(\d{4})-(\d{2})-01$/.exec(value);
		if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) return null;
		return { year: match[1], month: match[2] };
	}
}
