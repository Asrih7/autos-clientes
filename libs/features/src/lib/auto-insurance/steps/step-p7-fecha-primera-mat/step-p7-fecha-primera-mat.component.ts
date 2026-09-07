import { Component, computed, inject } from '@angular/core';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { ElementoGrid, GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p7-fecha-primera-mat',
	imports: [GridTarjetasComponent],
	templateUrl: './step-p7-fecha-primera-mat.component.html',
	styleUrl: './step-p7-fecha-primera-mat.component.scss'
})
export class StepP7FechaPrimeraMatComponent {
	private readonly stateService = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly currentYear = new Date().getFullYear();

	protected readonly years = computed(() => {
		const startYear = Number(this.stateService.formData().anioInicioFabricacionVersion);

		if (!Number.isInteger(startYear) || startYear > this.currentYear) {
			return [];
		}

		return Array.from({ length: this.currentYear - startYear + 1 }, (_, index) => {
			const year = this.currentYear - index;
			const age = this.currentYear - year;
			return {
				id: String(year),
				nombre: String(year),
				descripcion: age === 0 ? '< 1 año' : `${age} ${age === 1 ? 'año' : 'años'}`
			};
		});
	});
	protected readonly selectedYear = computed(() => this.stateService.formData().anioPrimeraMatriculacion ?? null);

	protected onCardClick(year: ElementoGrid): void {
		this.stateService.saveData({ anioPrimeraMatriculacion: year.id });
		this.navigation.next();
	}
}
