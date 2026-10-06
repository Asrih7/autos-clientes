import { Component, inject } from '@angular/core';
import { BalNotification } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p16-sin-precio',
	host: { class: 'flex w-full' },
	imports: [BalNotification, TranslocoDirective],
	templateUrl: './step-p16-sin-precio.component.html',
	styleUrl: './step-p16-sin-precio.component.scss'
})
export class StepP16SinPrecioComponent {
	private readonly navigation = inject(InsuranceNavigationService);

	constructor() {
		this.navigation.setStepFromGuard('sin-precio');
	}
}
