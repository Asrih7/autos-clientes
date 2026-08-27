import { Component, inject, signal } from '@angular/core';
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
	private readonly stateService = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly respuestaSeleccionada = signal<boolean | null>(null);
	protected readonly showError = signal<boolean>(false);

	constructor() {
		this.respuestaSeleccionada.set(this.stateService.formData().tieneAseguradora ?? null);
	}

	protected seleccionarRespuesta(tieneAseguradora: boolean): void {
		this.respuestaSeleccionada.set(tieneAseguradora);
		this.showError.set(false);
		this.stateService.saveData({ tieneAseguradora });
	}

	avanzar(): void {
		if (this.respuestaSeleccionada() === null) {
			this.showError.set(true);
			return;
		}

		this.navigation.next();
	}
}
