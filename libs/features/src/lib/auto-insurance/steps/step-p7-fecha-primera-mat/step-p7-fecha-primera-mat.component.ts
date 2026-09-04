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

	protected readonly years = Array.from({ length: 8 }, (_, index) => {
		const year = this.currentYear - index;
		return { id: String(year), nombre: String(year) };
	});
	protected readonly selectedYear = computed(() => this.stateService.formData().anioPrimeraMatriculacion ?? null);

	protected onCardClick(year: ElementoGrid): void {
		this.stateService.saveData({ anioPrimeraMatriculacion: year.id });
		this.navigation.next();
	}
}
