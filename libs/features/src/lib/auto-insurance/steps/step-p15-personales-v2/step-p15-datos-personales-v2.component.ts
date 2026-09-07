import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p15-datos-personales-v2',
	imports: [BalButton],
	templateUrl: './step-p15-datos-personales-v2.component.html',
	styleUrl: './step-p15-datos-personales-v2.component.scss'
})
export class StepP15DatosPersonalesV2Component {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
