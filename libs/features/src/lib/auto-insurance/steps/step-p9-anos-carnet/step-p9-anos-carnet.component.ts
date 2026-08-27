import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceDriverStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p9-anos-carnet',
	imports: [BalButton, BalInput, TranslocoDirective],
	templateUrl: './step-p9-anos-carnet.component.html',
	styleUrl: './step-p9-anos-carnet.component.scss'
})
export class StepP9AnosCarnetComponent {
	private readonly stateService = inject(AutoInsuranceDriverStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly edadCarnet = signal<number>(18);
	protected readonly showError = signal<boolean>(false);

	protected readonly errorMessage = computed(() => {
		if (!this.stateService.getFechaNacimiento()) {
			return 'tarificacion.forms.licenseAge.birthDateRequired';
		}
		if (!this.stateService.isEdadObtencionCarnetValida()) {
			return 'tarificacion.forms.licenseAge.invalid';
		}

		return null;
	});

	constructor() {
		const edadGuardada = this.stateService.formData().edadObtencionCarnet;
		if (edadGuardada !== undefined) {
			this.edadCarnet.set(edadGuardada);
		} else {
			this.persistValue();
		}
	}

	protected onAgeInput(event: Event): void {
		const parsedEvent = parseCustomEvent(event);
		if (!parsedEvent) {
			this.edadCarnet.set(0);
			this.persistValue();
			return;
		}

		const numericValue = Number(String(parsedEvent).replace(/\D/g, ''));
		this.edadCarnet.set(Number.isNaN(numericValue) ? 0 : numericValue);
		this.persistValue();
	}

	protected disminuirEdad(): void {
		this.edadCarnet.update((edad) => Math.max(0, edad - 1));
		this.persistValue();
	}

	protected aumentarEdad(): void {
		this.edadCarnet.update((edad) => edad + 1);
		this.persistValue();
	}

	avanzar(): void {
		this.showError.set(true);
		this.persistValue();
		if (!this.stateService.isEdadObtencionCarnetValida()) return;

		this.navigation.next();
	}

	private persistValue(): void {
		this.stateService.saveData({ edadObtencionCarnet: this.edadCarnet() });
	}
}
