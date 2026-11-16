import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
	BalButton,
	BalCard,
	BalCardContent,
	BalHeading,
	BalIcon,
	BalProgressBar,
	BalSpinner,
	BalTag,
	BalTagGroup,
	BalTooltip
} from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService, InsuranceFlowService, LoadingService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-auto-tarificacion',
	imports: [
		RouterOutlet,
		BalButton,
		BalIcon,
		BalProgressBar,
		BalSpinner,
		BalTagGroup,
		BalTag,
		BalTooltip,
		TranslocoDirective,
		BalCard,
		BalCardContent,
		BalSpinner,
		BalHeading
	],
	templateUrl: './auto-tarificacion.component.html',
	styleUrl: './auto-tarificacion.component.scss'
})
export class AutoTarificacionComponent {
	protected readonly navigation = inject(InsuranceNavigationService);
	private readonly flowService = inject(InsuranceFlowService);
	private readonly loadingService = inject(LoadingService);

	protected readonly isLoading = this.loadingService.isLoading;

	progressPercentage = computed(() => {
		const current = this.navigation.currentStep();
		const activeMap = this.flowService.activeStepsMap();

		const currentIndex = activeMap.indexOf(current);
		if (currentIndex === -1) return 0;

		return ((currentIndex + 1) / activeMap.length) * 100;
	});

	canAdvanceCurrentStep = computed(() => this.navigation.canGoForward());

	mostrarCabeceraPaso = computed(
		() =>
			![
				'busqueda',
				'sin-precio',
				'contratacion',
				'coberturas-opcionales',
				'matricula',
				'segundo-conductor',
				'propietario-conductor',
				'tomador',
				'conductor-vehiculo',
				'datos-segundo-conductor',
				'propietario-vehiculo',
				'datos-bancarios',
				'resumen'
			].includes(this.navigation.currentStep())
	);

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
