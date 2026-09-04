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

	canAdvanceCurrentStep = computed(() => {
		const currentStep = this.navigation.currentStep();
		if (currentStep === 'fecha-nacimiento' || currentStep === 'anos-carnet') {
			return this.stateService.canContinueFromStep(currentStep);
		}

		return currentStep !== 'tiene-aseguradora' || this.stateService.formData().tieneAseguradora !== undefined;
	});

	tooltipText = computed(() => {
		switch (this.navigation.currentStep()) {
			case 'fecha-matriculacion':
				return 'tooltips.fecha-matriculacion';
			case 'fecha-nacimiento':
				return 'tooltips.fecha-nacimiento';
			case 'anos-carnet':
				return 'tooltips.anos-carnet';
			case 'tiene-aseguradora':
				return 'tooltips.tiene-aseguradora';
			case 'fecha-primera-matriculacion':
				return 'tooltips.fecha-primera-matriculacion';
			case 'anos-asegurado':
				return 'tooltips.anos-asegurado';
			case 'historial-partes':
				return 'tooltips.historial-partes';

			default:
				return null;
		}
	});
}
