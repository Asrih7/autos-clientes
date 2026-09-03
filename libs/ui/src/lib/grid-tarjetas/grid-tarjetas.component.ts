import { Component, input, output } from '@angular/core';
import { BalCard, BalCardContent } from '@baloise/ds-angular';

export interface ElementoGrid {
	id: string;
	nombre: string;
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

	elementoClick = output<ElementoGrid>();

	protected onCardClick(elemento: ElementoGrid): void {
		this.elementoClick.emit(elemento);
	}
}
