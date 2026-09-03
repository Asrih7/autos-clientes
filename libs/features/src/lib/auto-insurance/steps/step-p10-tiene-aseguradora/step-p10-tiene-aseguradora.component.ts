import { Component, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p10-tiene-aseguradora',
	host: { class: 'w-full' },
	imports: [BalButton],
	templateUrl: './step-p10-tiene-aseguradora.component.html',
	styleUrl: './step-p10-tiene-aseguradora.component.scss'
})
export class StepP10TieneAseguradoraComponent {
	private readonly stateService = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly respuestaSeleccionada = signal<boolean | null>(null);

	constructor() {
		this.respuestaSeleccionada.set(this.stateService.formData().tieneAseguradora ?? null);
	}

	protected seleccionarRespuesta(tieneAseguradora: boolean): void {
		this.respuestaSeleccionada.set(tieneAseguradora);
		this.stateService.saveData({ tieneAseguradora });
		this.navigation.next();
	}
}
