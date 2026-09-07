import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalCard, BalCardContent, BalIcon, BalInput, BalTooltip, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p17-contratacion',
	imports: [BalButton, BalCard, BalCardContent, BalIcon, BalInput, BalTooltip, DecimalPipe],
	templateUrl: './step-p17-contratacion.component.html',
	host: { class: 'w-full' }
})
export class StepP17ContratacionComponent {
	private readonly state = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);
	protected readonly poliza = signal(this.state.formData().ultimosDigitosPoliza ?? '');
	protected readonly requiereRecalculo = signal(false);
	protected readonly error = computed(() => this.poliza().length > 0 && this.poliza().length !== 5);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);
	protected readonly literalBoton = computed(() => this.requiereRecalculo() ? 'Recalcular' : 'Siguiente');


	protected actualizarPoliza(event: Event): void {
		const value = (parseCustomEvent(event)?.toString() ?? '').replace(/\D/g, '').slice(0, 5);
		this.poliza.set(value);
		this.state.saveData({ ultimosDigitosPoliza: value });
	}

	protected alPerderFoco(): void {
		if (this.poliza().length === 5) this.requiereRecalculo.set(true);
	}

	protected continuar(): void {
		if (this.error() || this.poliza().length !== 5) return;
		if (this.requiereRecalculo()) {
			// El endpoint de retarificación se conectará aquí cuando BO publique su contrato.
			this.requiereRecalculo.set(false);
			return;
		}
		this.navigation.next();
	}

	protected volver(): void {
		this.navigation.back();
	}
}
