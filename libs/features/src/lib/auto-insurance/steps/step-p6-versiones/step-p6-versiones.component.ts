import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalInput } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { P6VersionesService, CarVersion } from '@mnv-autos-clientes/data';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p6-versiones',
	imports: [BalButton, BalInput, TranslocoDirective],
	templateUrl: './step-p6-versiones.component.html',
	styleUrl: './step-p6-versiones.component.scss'
})
export class StepP6VersionesComponent {
	protected readonly navigation = inject(InsuranceNavigationService);
	private readonly versionesService = inject(P6VersionesService);

	protected readonly selectedVersionId = signal<string | null>(null);
	protected readonly allVersions = this.versionesService.listadoVersiones;
	
	protected readonly versions = computed(() => {
		const filter = this.appliedFilter().trim().toUpperCase();
		if (!filter) {
			return this.allVersions();
		}

		return this.allVersions().filter(version => this.matchesFilter(version, filter));
	});

	protected readonly filterValue = signal<string>('');
	protected readonly appliedFilter = signal<string>('');

	constructor() {
		const vehiculoState = this.versionesService.vehiculoSlices();
		const tipoFlujo = this.versionesService.tipoFlujo();

		switch (tipoFlujo) {
			case 'MANUAL':
				this.versionesService.limpiarErrores();
				if (vehiculoState.modeloSeleccionado?.id) {
					this.versionesService.obtenerVersiones(String(vehiculoState.modeloSeleccionado.id));
				}
				break;
			case 'MATRICULA':
				this.versionesService.cargarVersiones();
				break;
			default:
				break;
		}

		if (vehiculoState.versionId) {
			this.selectedVersionId.set(vehiculoState.versionId);
		}
	}

	/**
	 * Actualiza el valor del filtro introducido por el usuario.
	 * @param ev Evento emitido por el campo de entrada.
	 */
	onInputUpdate(ev: CustomEvent): void {
		this.filterValue.set(String(ev.detail));
	}

	/**
	 * Aplica el filtro actual al listado de versiones.
	 */
	applyFilter(): void {
		this.appliedFilter.set(this.filterValue());
	}

	/**
	 * Comprueba si una versión coincide con el texto filtrado.
	 * @param version Versión a evaluar.
	 * @param filter Texto de búsqueda normalizado.
	 * @returns true si la versión coincide con el filtro.
	 */
	private matchesFilter(version: CarVersion, filter: string): boolean {
		const searchableText = [
			version.marca.nombre,
			version.modelo.nombre,
			version.version.nombre,
			version.cilindradaCc.toString(),
			version.potenciaCv.toString(),
			version.numeroPuertas,
			version.anioLanzamiento,
		]
			.join(' ')
			.toUpperCase();

		return searchableText.includes(filter);
	}

	/**
	 * Selecciona una versión, delega la mutación de estado de forma pura y avanza.
	 * @param version Versión seleccionada.
	 */
	onClickVersion(version: CarVersion): void {
		this.selectedVersionId.set(version.version.id);
		
		this.versionesService.seleccionarVersion(version.version.id, version.anioLanzamiento);
	
		this.navigation.next();
	}
}
