import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BalButton, BalCard, BalCardContent, BalHeading, BalIcon, BalProgressBar, BalSpinner, BalTag, BalTagGroup, BalTooltip } from '@baloise/ds-angular';
import { AutoInsuranceApiService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService, LoadingService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-auto-tarificacion',
	imports: [RouterOutlet, BalButton, BalIcon, BalProgressBar, BalSpinner, BalTagGroup, 
		BalTag, BalTooltip, TranslocoDirective, BalCard, BalCardContent, BalSpinner, BalHeading],
	templateUrl: './auto-tarificacion.component.html',
	styleUrl: './auto-tarificacion.component.scss'
})
export class AutoTarificacionComponent {
	protected navigation = inject(InsuranceNavigationService);
	protected apiService = inject(AutoInsuranceApiService);
	private stateService = inject(InsuranceStateService);
	private readonly loadingService = inject(LoadingService);

	protected readonly isLoading = this.loadingService.isLoading;

	progressPercentage = computed(() => {
		const current = this.navigation.currentStep();
		const activeMap = this.stateService.activeStepsMap();

		const currentIndex = activeMap.indexOf(current);
		if (currentIndex === -1) return 0;

		return ((currentIndex + 1) / activeMap.length) * 100;
	});

	showStepTooltip = computed(
		() => this.navigation.currentStep() === 'fecha-matriculacion'
	);

	tooltipText = computed(() => {
		switch (this.navigation.currentStep()) {
			case 'fecha-matriculacion':
				return 'tarificacion.tooltips.fecha-matriculacion';

			default:
				return null;
		}
	});
}
