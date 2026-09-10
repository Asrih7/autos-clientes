import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { BalButton, BalStepItem, BalSteps } from '@baloise/ds-angular';
import { GlobalInsuranceStore } from '@mnv-autos/data';
import { InsuranceFlowService } from '@mnv-autos/core';

@Component({
	selector: 'lib-shell.component',
	imports: [RouterOutlet, BalSteps, BalStepItem, BalButton],
	templateUrl: './shell.component.html',
	styleUrl: './shell.component.scss'
})
export class ShellComponent {
	private router = inject(Router);
	protected store = inject(GlobalInsuranceStore); // Centralized state rules
	protected readonly flowService = inject(InsuranceFlowService);

	protected onNext(): void {
		const currentIndex = this.flowService.stepsSequence.indexOf(this.flowService.activeRouteStep());

		if (currentIndex !== -1 && currentIndex < this.flowService.stepsSequence.length - 1) {
			const nextRoute = this.flowService.stepsSequence[currentIndex + 1];
			this.router.navigate([`/${nextRoute}`]);
		}
	}

	protected onBack(): void {
		const currentIndex = this.flowService.stepsSequence.indexOf(this.flowService.activeRouteStep());

		if (currentIndex > 0) {
			const prevRoute = this.flowService.stepsSequence[currentIndex - 1];
			this.router.navigate([`/${prevRoute}`]);
		}
	}
}
