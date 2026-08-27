import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p10-tiene-aseguradora',
	imports: [BalButton],
	templateUrl: './step-p10-tiene-aseguradora.component.html',
	styleUrl: './step-p10-tiene-aseguradora.component.scss'
})
export class StepP10TieneAseguradoraComponent {
	private stateService = inject(InsuranceStateService);
	private navigation = inject(InsuranceNavigationService);

responderSi() {
  this.stateService.saveData({ tieneAseguradora: true });
  this.navigation.next();
}

responderNo() {
  this.stateService.saveData({ tieneAseguradora: false });
  this.navigation.next();
}
}
