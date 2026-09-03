import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p7-fecha-primera-mat',
	imports: [BalButton],
	templateUrl: './step-p7-fecha-primera-mat.component.html',
	styleUrl: './step-p7-fecha-primera-mat.component.scss'
})
export class StepP7FechaPrimeraMatComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
