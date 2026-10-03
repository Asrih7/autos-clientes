import { Component, inject } from '@angular/core';
import { BalCard, BalCardContent, BalIcon } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p16-sin-precio',
	imports: [BalCard, BalCardContent, BalIcon, TranslocoDirective],
	templateUrl: './step-p16-sin-precio.component.html',
})
export class StepP16SinPrecioComponent {
	private readonly navigation = inject(InsuranceNavigationService);

	constructor() {
		this.navigation.setStepFromGuard('sin-precio');
	}
}
