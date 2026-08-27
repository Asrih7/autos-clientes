import { Component, computed, inject, signal } from '@angular/core';
import { BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceDriverStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p8-fecha-nacimiento',
	imports: [BalInput, TranslocoDirective],
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
			return 'tarificacion.forms.birthDate.incomplete';
		}
		if (!this.stateService.getFechaNacimiento(data)) {
			return 'tarificacion.forms.birthDate.invalid';
		}
		if (!this.stateService.isFechaNacimientoValida(data)) {
			return 'tarificacion.forms.birthDate.underage';
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
		this.advanceWhenDateIsValid();
	}

	private persistValue(): void {
		this.stateService.saveData(this.getFormData());
	}

	private advanceWhenDateIsValid(): void {
		if (this.year().length !== 4) return;

		if (!this.stateService.isFechaNacimientoValida(this.getFormData())) {
			this.showError.set(true);
			return;
		}

		this.navigation.next();
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
