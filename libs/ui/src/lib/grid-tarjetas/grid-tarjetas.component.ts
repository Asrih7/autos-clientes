import { Component, computed, input, output } from '@angular/core';
import { BalCard, BalCardContent } from '@baloise/ds-angular';

/** Maximum number of cards rendered by the standard 5-column, 3-row grid. */
export const GRID_TARJETAS_DEFAULT_MAX_ELEMENTOS = 15;

export interface ElementoGrid {
	id: string;
	nombre: string;
	descripcion?: string;
	logoUrl?: string;
	orden?: number
}

@Component({
	selector: 'lib-grid-tarjetas',
	imports: [BalCard, BalCardContent],
	templateUrl: './grid-tarjetas.component.html',
	styleUrl: './grid-tarjetas.component.scss'
})
export class GridTarjetasComponent {
	elementos = input.required<ElementoGrid[]>();
	idSeleccionado = input<string | number | null | undefined>(null);
	maxElementos = input(GRID_TARJETAS_DEFAULT_MAX_ELEMENTOS);

	elementoClick = output<ElementoGrid>();

	protected readonly elementosVisibles = computed(() => this.elementos().slice(0, this.maxElementos()));

	protected onCardClick(elemento: ElementoGrid): void {
		this.elementoClick.emit(elemento);
	}
}
