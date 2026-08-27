import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceDriverStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p8-fecha-nacimiento',
	imports: [BalButton, BalInput],
	templateUrl: './step-p8-fecha-nacimiento.component.html',
	styleUrl: './step-p8-fecha-nacimiento.component.scss'
})
export class StepP8FechaNacimientoComponent {
	private readonly stateService = inject(AutoInsuranceDriverStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly day = signal<string>('');
	protected readonly month = signal<string>('');
	protected readonly year = signal<string>('');
	protected readonly showError = signal<boolean>(false);

	protected readonly errorMessage = computed(() => {
		const data = this.getFormData();
		if (!this.stateService.isFechaNacimientoCompleta(data)) {
			return 'Introduce la fecha de nacimiento completa.';
		}
		if (!this.stateService.getFechaNacimiento(data)) {
			return 'Introduce una fecha de nacimiento válida.';
		}
		if (!this.stateService.isFechaNacimientoValida(data)) {
			return 'El conductor más joven debe ser mayor de 18 años.';
		}

		return null;
	});

	constructor() {
		const data = this.stateService.formData();
		this.day.set(data.diaFechaNacimiento ?? '');
		this.month.set(data.mesFechaNacimiento ?? '');
		this.year.set(data.anioFechaNacimiento ?? '');
	}

	protected onDayInput(event: Event): void {
		this.day.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
	}

	protected onMonthInput(event: Event): void {
		this.month.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
	}

	protected onYearInput(event: Event): void {
		this.year.set(this.getNumericValue(event).slice(0, 4));
		this.persistValue();
	}

	avanzar() {
		this.showError.set(true);
		this.persistValue();
		if (!this.stateService.isFechaNacimientoValida(this.getFormData())) return;

		this.navigation.next();
	}

	private persistValue(): void {
		this.stateService.saveData(this.getFormData());
	}

	private getFormData() {
		return {
			diaFechaNacimiento: this.day(),
			mesFechaNacimiento: this.month(),
			anioFechaNacimiento: this.year()
		};
	}

	private getNumericValue(event: Event): string {
		const parsedEvent = parseCustomEvent(event);
		if (!parsedEvent) return '';

		return String(parsedEvent).replace(/\D/g, '');
	}
}
