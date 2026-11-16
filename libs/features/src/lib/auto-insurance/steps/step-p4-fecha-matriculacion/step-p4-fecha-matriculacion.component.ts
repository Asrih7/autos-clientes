import { Component, inject, signal } from '@angular/core';
import { BalButton, BalDropdown, BalOption } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { VehiculoStore } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p4-fecha-matriculacion',
	imports: [BalButton, BalDropdown, BalOption],
	templateUrl: './step-p4-fecha-matriculacion.component.html',
	styleUrl: './step-p4-fecha-matriculacion.component.scss'
})
export class StepP4FechaMatriculacionComponent {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly selectedMonth = signal<number | null>(null);
	protected readonly selectedYear = signal<number | null>(null);

	protected readonly _years = Array.from({ length: 2026 - 1996 + 1 }, (_, index) => 2026 - index);
	protected readonly _months = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre'
	] as const;

	constructor() {
		const { mesPrimerMatricula, anioPrimerMatricula } = this.vehiculoStore.state();

		if (mesPrimerMatricula && anioPrimerMatricula) {
			this.selectedMonth.set(Number(mesPrimerMatricula));
			this.selectedYear.set(Number(anioPrimerMatricula));
		}
	}

	onChangeMonth(ev: CustomEvent) {
		this.selectedMonth.set(Number(ev.detail));
	}
	onChangeYear(ev: CustomEvent) {
		this.selectedYear.set(Number(ev.detail));
	}

	avanzar() {
		const mes = this.selectedMonth();
		const anio = this.selectedYear();

		if (mes && anio) {
			this.vehiculoStore.guardarFechaMatriculacion(String(mes), String(anio));
		} else {
			this.vehiculoStore.guardarFechaMatriculacion(undefined, undefined);
		}

		this.navigation.next();
	}
}
