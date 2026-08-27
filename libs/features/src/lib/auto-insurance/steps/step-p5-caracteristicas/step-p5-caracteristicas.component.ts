import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p5-caracteristicas',
	imports: [BalButton],
	templateUrl: './step-p5-caracteristicas.component.html',
	styleUrl: './step-p5-caracteristicas.component.scss'
})
export class StepP5CaracteristicasComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
