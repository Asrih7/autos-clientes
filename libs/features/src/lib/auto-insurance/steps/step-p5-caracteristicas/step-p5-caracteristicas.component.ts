import { Component, computed, inject, signal, effect } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { P5CaracteristicasService } from '@mnv-autos-clientes/data';
import { ElementoGrid } from '@mnv-autos-clientes/ui';

const COMBUSTIBLES: readonly ElementoGrid[] = [
	{ id: 'D', nombre: 'Diesel' },
	{ id: 'G', nombre: 'Gasolina' },
	{ id: 'O', nombre: 'Otros' }
];
const PUERTAS: readonly ElementoGrid[] = [
	{ id: '2', nombre: '2' },
	{ id: '3', nombre: '3' },
	{ id: '4', nombre: '4' },
	{ id: '5', nombre: '5' },
	{ id: 'N', nombre: 'No estoy seguro' }
];
const PLAZAS: readonly ElementoGrid[] = [
	{ id: '1', nombre: '1' },
	{ id: '2', nombre: '2' },
	{ id: '3', nombre: '3' },
	{ id: '4', nombre: '4' },
	{ id: '5', nombre: '5' },
	{ id: '6', nombre: '6' },
	{ id: '7', nombre: '7' },
	{ id: 'N', nombre: 'No estoy seguro' }
];

@Component({
	selector: 'lib-step-p5-caracteristicas',
	imports: [BalButton, TranslocoPipe],
	templateUrl: './step-p5-caracteristicas.component.html',
	styleUrl: './step-p5-caracteristicas.component.scss'
})
export class StepP5CaracteristicasComponent {
	private readonly caracteristicasService = inject(P5CaracteristicasService);
	protected readonly navigation = inject(InsuranceNavigationService);

	protected readonly fuels = computed(() =>
		filtrarOpciones(COMBUSTIBLES, this.caracteristicasService.caracteristicasDisponibles()?.combustibles)
	);
	protected readonly doors = computed(() =>
		filtrarOpciones(PUERTAS, this.caracteristicasService.caracteristicasDisponibles()?.puertas, true)
	);
	protected readonly seats = computed(() =>
		filtrarOpciones(PLAZAS, this.caracteristicasService.caracteristicasDisponibles()?.plazas, true)
	);

	protected readonly selectedFuelId = signal('');
	protected readonly selectedDoorId = signal('');
	protected readonly selectedSeatId = signal('');

	protected readonly isStepComplete = computed(() =>
		Boolean(this.selectedFuelId() && this.selectedDoorId() && this.selectedSeatId())
	);

	constructor() {
		const vehiculoState = this.caracteristicasService.vehiculoSlices();
		const detalles = this.caracteristicasService.detallesSeleccionados();

		this.selectedFuelId.set(detalles?.combustible ?? '');
		this.selectedDoorId.set(detalles?.numeroPuertas ?? '');
		this.selectedSeatId.set(detalles?.numeroPlazas ?? '');

		if (vehiculoState.modeloSeleccionado?.id) {
			this.caracteristicasService.cargarOpcionesCaracteristicas(String(vehiculoState.modeloSeleccionado.id));
		}

		effect(() => {
			const disponibles = this.caracteristicasService.caracteristicasDisponibles();
			if (!disponibles) return;

			const combustibleValido = esOpcionDisponible(this.selectedFuelId(), disponibles.combustibles);
			const puertasValidas = esOpcionDisponible(this.selectedDoorId(), disponibles.puertas, true);
			const plazasValidas = esOpcionDisponible(this.selectedSeatId(), disponibles.plazas, true);

			if (!combustibleValido || !puertasValidas || !plazasValidas) {
				this.selectedFuelId.set(combustibleValido ? this.selectedFuelId() : '');
				this.selectedDoorId.set(puertasValidas ? this.selectedDoorId() : '');
				this.selectedSeatId.set(plazasValidas ? this.selectedSeatId() : '');

				this.caracteristicasService.guardarCaracteristicas(
					combustibleValido ? this.selectedFuelId() : null,
					puertasValidas ? this.selectedDoorId() : null,
					plazasValidas ? this.selectedSeatId() : null
				);
			}
		});
	}

	protected onClick(optionSelected: string, type: 'fuel' | 'door' | 'seat'): void {
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

		if (this.isStepComplete()) {
			this.caracteristicasService.guardarCaracteristicas(
				this.selectedFuelId(),
				this.selectedDoorId(),
				this.selectedSeatId()
			);
		}
	}
}

function filtrarOpciones(
	opciones: readonly ElementoGrid[],
	disponibles: readonly string[] | undefined,
	mantenerNoSeguro = false
): readonly ElementoGrid[] {
	if (!disponibles) return opciones;
	return opciones.filter((opcion) => (mantenerNoSeguro && opcion.id === 'N') || disponibles.includes(opcion.id));
}

function esOpcionDisponible(
	opcion: string,
	disponibles: readonly string[],
	noSeguroSiempreDisponible = false
): boolean {
	return !opcion || (noSeguroSiempreDisponible && opcion === 'N') || disponibles.includes(opcion);
}
