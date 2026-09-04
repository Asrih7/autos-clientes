import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalInput } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { P6VersionesService } from '../../../../../../data/src/lib/services/p6-versiones.service';
import { CarVersion } from 'libs/data/src/lib/models/version.model';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p6-versiones',
	imports: [BalButton, BalInput, TranslocoDirective],
	templateUrl: './step-p6-versiones.component.html',
	styleUrl: './step-p6-versiones.component.scss'
})
export class StepP6VersionesComponent {
	protected readonly navigation = inject(InsuranceNavigationService);
	private readonly stateService = inject(InsuranceStateService);
	private readonly versionesService = inject(P6VersionesService);

	protected readonly selectedVersionId = signal<string | null>(null);
	protected readonly allVersions = this.versionesService.listadoVersiones;
	protected readonly versions = computed(() => {
		const filter = this.appliedFilter()
			.trim()
			.toUpperCase();

		if (!filter) {
			return this.allVersions();
		}

		return this.allVersions().filter(
			version => this.matchesFilter(version, filter)
		);

	});

	protected readonly filterValue = signal<string>('');
	protected readonly appliedFilter = signal<string>('');

	/**
	 * Inicializa las versiones y recupera la selección previa si existe.
	 */
	constructor() {
		const { tipoFlujo, modeloSeleccionado, versionId } = this.stateService.formData()

		switch (tipoFlujo) {
			case 'MANUAL':
				this.versionesService.limpiarErrores();
				this.versionesService.obtenerVersiones(String(modeloSeleccionado?.id));
				break;
			case 'MATRICULA':
				this.versionesService.cargarVersiones();
				break;
			default:
				break;
		}

		if (versionId) {
			this.selectedVersionId.set(versionId);
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
	 * Selecciona una versión, guarda su identificador y avanza al siguiente paso.
	 * @param version Versión seleccionada.
	 */
	onClickVersion(version: CarVersion): void {
		this.selectedVersionId.set(version.version.id);
		this.stateService.saveData({
			versionId: version.version.id
		});
	
		this.navigation.next()
	}
}
