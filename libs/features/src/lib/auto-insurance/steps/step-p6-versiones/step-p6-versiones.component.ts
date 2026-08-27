import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p6-versiones',
	imports: [BalButton],
	templateUrl: './step-p6-versiones.component.html',
	styleUrl: './step-p6-versiones.component.scss'
})
export class StepP6VersionesComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
