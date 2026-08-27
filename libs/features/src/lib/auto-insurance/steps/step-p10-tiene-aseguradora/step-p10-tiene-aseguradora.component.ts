import { Component, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p10-tiene-aseguradora',
	imports: [BalButton, TranslocoDirective],
	templateUrl: './step-p10-tiene-aseguradora.component.html',
	styleUrl: './step-p10-tiene-aseguradora.component.scss'
})
export class StepP10TieneAseguradoraComponent {
	private readonly stateService = inject(InsuranceStateService);

	protected readonly respuestaSeleccionada = signal<boolean | null>(null);

	constructor() {
		this.respuestaSeleccionada.set(this.stateService.formData().tieneAseguradora ?? null);
	}

	protected seleccionarRespuesta(tieneAseguradora: boolean): void {
		this.respuestaSeleccionada.set(tieneAseguradora);
		this.stateService.saveData({ tieneAseguradora });
	}
}
