import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p3-modelos',
	imports: [BalButton],
	templateUrl: './step-p3-modelos.component.html',
	styleUrl: './step-p3-modelos.component.scss'
})
export class StepP3ModelosComponent {
  private navigation = inject(InsuranceNavigationService);

  avanzar() { 
    this.navigation.next(); 
  }
}
