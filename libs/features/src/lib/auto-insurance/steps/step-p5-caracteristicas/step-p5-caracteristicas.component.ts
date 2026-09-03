import { Component, computed, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { ElementoGrid } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p5-caracteristicas',
	imports: [BalButton, TranslocoPipe],
	templateUrl: './step-p5-caracteristicas.component.html',
	styleUrl: './step-p5-caracteristicas.component.scss'
})
export class StepP5CaracteristicasComponent {
	private readonly stateService = inject(InsuranceStateService);
	protected readonly navigation = inject(InsuranceNavigationService);

	// GDCARTPROY-4468 | Listas fijas
	private readonly _COMBUSTIBLES = ["Diesel", "Gasolina", "Otro"];
	private readonly _PUERTAS = ["2", "3", "4", "5", "No estoy seguro"];
	private readonly _PLAZAS = ["4", "5", "7", "No estoy seguro"];

	// Listados de opciones seleccionables
	protected readonly fuels = signal<ElementoGrid[]>([]);
	protected readonly doors = signal<ElementoGrid[]>([]);
	protected readonly seats = signal<ElementoGrid[]>([]);

	// Identificadores de opciones seleccionadas
	protected readonly selectedFuelId = signal<string>('');
	protected readonly selectedDoorId = signal<string>('');
	protected readonly selectedSeatId = signal<string>('');

	// Indica si se han seleccionado todas las características obligatorias
	protected readonly isStepComplete = computed(() =>
		!!this.selectedFuelId() &&
		!!this.selectedDoorId() &&
		!!this.selectedSeatId()
	);

	constructor() {
		// GDCARTPROY-4468: Carga listas fijas
		this.fuels.set(this.optionsMapper([...this._COMBUSTIBLES]))
		this.doors.set(this.optionsMapper([...this._PUERTAS]))
		this.seats.set(this.optionsMapper([...this._PLAZAS]))

		const { combustible, numeroPuertas, numeroPlazas } = this.stateService.formData()

		this.selectedFuelId.set(combustible ?? '')
		this.selectedDoorId.set(numeroPuertas ?? '')
		this.selectedSeatId.set(numeroPlazas ?? '')
	}

	/**
	 * Actualiza la opción seleccionada según el tipo de filtro indicado.
	 *
	 * @param optionSelected Identificador de la opción seleccionada.
	 * @param type Tipo de filtro: 'fuel', 'door' o 'seat'.
	 */
	onClick(optionSelected: string, type: 'fuel' | 'door' | 'seat') {
		switch (type) {
			case 'fuel':
				this.selectedFuelId.set(optionSelected);
				break;
			case 'door':
				this.selectedDoorId.set(optionSelected);
				break;
			case 'seat':
				this.selectedSeatId.set(optionSelected);
				break;
		}

		this.saveIfComplete();
	}

	/**
	 * Persiste las características seleccionadas cuando el paso
	 * dispone de toda la información requerida.
	 */
	private saveIfComplete(): void {
		if (!this.isStepComplete()) {
			return;
		}

		this.stateService.saveData({
			combustible: this.selectedFuelId(),
			numeroPuertas: this.selectedDoorId(),
			numeroPlazas: this.selectedSeatId()
		});
	}


	/**
	 * Convierte una lista de nombres en elementos de grid usando la primera
	 * letra de cada nombre (en mayúscula) como identificador.
	 *
	 * @param options Lista de nombres.
	 * @returns Elementos de tipo `ElementoGrid`.
	 */
	private optionsMapper(options: string[]): ElementoGrid[] {
		return options.map(nombre => ({
			id: nombre.charAt(0).toUpperCase(),
			nombre
		}));
	}
}
