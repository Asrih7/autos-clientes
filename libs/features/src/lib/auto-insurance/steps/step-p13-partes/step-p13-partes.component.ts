import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p13-partes',
	imports: [BalButton],
	templateUrl: './step-p13-partes.component.html',
	styleUrl: './step-p13-partes.component.scss'
})
export class StepP13PartesComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
