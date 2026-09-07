import { Component, inject } from '@angular/core';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p16-sin-precio',
	templateUrl: './step-p16-sin-precio.component.html',
	styleUrl: './step-p16-sin-precio.component.scss'
})
export class StepP16SinPrecioComponent {
	private readonly navigation = inject(InsuranceNavigationService);

	constructor() {
		this.navigation.setStepFromGuard('sin-precio');
	}
}
