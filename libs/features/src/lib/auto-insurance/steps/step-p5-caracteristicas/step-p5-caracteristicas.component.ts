import { Component, computed, effect, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoPipe } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	CaracteristicasDisponiblesVersiones,
	InsuranceStateService,
	P6VersionesService
} from '@mnv-autos-clientes/data';
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
	private readonly stateService = inject(InsuranceStateService);
	private readonly versionesService = inject(P6VersionesService);
	protected readonly navigation = inject(InsuranceNavigationService);

	protected readonly fuels = computed(() =>
		filtrarOpciones(COMBUSTIBLES, this.versionesService.caracteristicasDisponibles()?.combustibles)
	);
	protected readonly doors = computed(() =>
		filtrarOpciones(PUERTAS, this.versionesService.caracteristicasDisponibles()?.puertas, true)
	);
	protected readonly seats = computed(() =>
		filtrarOpciones(PLAZAS, this.versionesService.caracteristicasDisponibles()?.plazas, true)
	);

	protected readonly selectedFuelId = signal('');
	protected readonly selectedDoorId = signal('');
	protected readonly selectedSeatId = signal('');
	protected readonly isStepComplete = computed(
		() => Boolean(this.selectedFuelId() && this.selectedDoorId() && this.selectedSeatId())
	);

	constructor() {
		const { combustible, numeroPuertas, numeroPlazas, modeloSeleccionado } = this.stateService.formData();
		this.selectedFuelId.set(combustible ?? '');
		this.selectedDoorId.set(numeroPuertas ?? '');
		this.selectedSeatId.set(numeroPlazas ?? '');

		if (modeloSeleccionado?.id) this.versionesService.cargarOpcionesCaracteristicas(String(modeloSeleccionado.id));

		effect(() => this.descartarSeleccionNoDisponible(this.versionesService.caracteristicasDisponibles()));
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

		this.guardarSiCompleto();
	}

	private guardarSiCompleto(): void {
		if (!this.isStepComplete()) return;

		this.stateService.saveData({
			combustible: this.selectedFuelId(),
			numeroPuertas: this.selectedDoorId(),
			numeroPlazas: this.selectedSeatId()
		});
	}

	private descartarSeleccionNoDisponible(disponibles: CaracteristicasDisponiblesVersiones | null): void {
		if (!disponibles) return;

		const combustible = esOpcionDisponible(this.selectedFuelId(), disponibles.combustibles);
		const puertas = esOpcionDisponible(this.selectedDoorId(), disponibles.puertas, true);
		const plazas = esOpcionDisponible(this.selectedSeatId(), disponibles.plazas, true);
		if (combustible && puertas && plazas) return;

		this.selectedFuelId.set(combustible ? this.selectedFuelId() : '');
		this.selectedDoorId.set(puertas ? this.selectedDoorId() : '');
		this.selectedSeatId.set(plazas ? this.selectedSeatId() : '');
		this.stateService.saveData({
			combustible: combustible ? this.selectedFuelId() : undefined,
			numeroPuertas: puertas ? this.selectedDoorId() : undefined,
			numeroPlazas: plazas ? this.selectedSeatId() : undefined
		});
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
