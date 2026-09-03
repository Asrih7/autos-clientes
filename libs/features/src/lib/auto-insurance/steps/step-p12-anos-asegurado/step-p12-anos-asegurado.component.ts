import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p12-anos-asegurado',
	imports: [BalButton],
	templateUrl: './step-p12-anos-asegurado.component.html',
	styleUrl: './step-p12-anos-asegurado.component.scss'
})
export class StepP12AnosAseguradoComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
