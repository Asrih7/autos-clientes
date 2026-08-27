import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
	selector: 'lib-step-p11-lista-aseguradoras',
	imports: [BalButton],
	templateUrl: './step-p11-lista-aseguradoras.component.html',
	styleUrl: './step-p11-lista-aseguradoras.component.scss'
})
export class StepP11ListaAseguradorasComponent {
	private navigation = inject(InsuranceNavigationService);

	avanzar() {
		this.navigation.next();
	}
}
