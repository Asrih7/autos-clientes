import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p9-anos-carnet',
	imports: [BalButton],
	templateUrl: './step-p9-anos-carnet.component.html',
	styleUrl: './step-p9-anos-carnet.component.scss'
})
export class StepP9AnosCarnetComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
