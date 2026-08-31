import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceDriverStateService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p8-fecha-nacimiento',
	host: { class: 'w-full' },
	imports: [BalInput],
	templateUrl: './step-p8-fecha-nacimiento.component.html',
	styleUrl: './step-p8-fecha-nacimiento.component.scss'
})
export class StepP8FechaNacimientoComponent implements AfterViewInit {
	private readonly stateService = inject(AutoInsuranceDriverStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly day = signal<string>('');
	protected readonly month = signal<string>('');
	protected readonly year = signal<string>('');
	protected readonly showError = signal<boolean>(false);
	protected readonly minimumBirthDate = computed(() => this.formatDate(this.stateService.getMinimumFechaNacimiento()));
	@ViewChild('dayInput') private readonly dayInput?: BalInput;
	@ViewChild('monthInput') private readonly monthInput?: BalInput;
	@ViewChild('yearInput') private readonly yearInput?: BalInput;

	protected readonly errorMessage = computed(() => {
		const data = this.getFormData();
		if (!this.stateService.isFechaNacimientoCompleta(data)) {
			return 'Introduce la fecha de nacimiento completa.';
		}
		const fechaNacimiento = this.stateService.getFechaNacimiento(data);
		if (!fechaNacimiento) {
			return 'Introduce una fecha de nacimiento válida.';
		}
		if (fechaNacimiento < this.stateService.getMinimumFechaNacimiento()) {
			return `La fecha debe ser posterior al ${this.minimumBirthDate()}.`;
		}
		if (!this.stateService.isFechaNacimientoValida(data)) {
			return 'El conductor principal debe ser mayor de 18 años.';
		}

		return null;
	});

	constructor() {
		const data = this.stateService.formData();
		this.day.set(data.diaFechaNacimiento ?? '');
		this.month.set(data.mesFechaNacimiento ?? '');
		this.year.set(data.anioFechaNacimiento ?? '');
	}

	ngAfterViewInit(): void {
		requestAnimationFrame(() => void this.dayInput?.setFocus());
	}

	protected onDayInput(event: Event): void {
		this.day.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
		if (this.day().length === 2) this.focusInput(this.monthInput);
	}

	protected onMonthInput(event: Event): void {
		this.month.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
		if (this.month().length === 2) this.focusInput(this.yearInput);
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

	private formatDate(date: Date): string {
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${day}/${month}/${date.getFullYear()}`;
	}

	private getNumericValue(event: Event): string {
		const parsedEvent = parseCustomEvent(event);
		if (!parsedEvent) return '';

		return String(parsedEvent).replace(/\D/g, '');
	}

	private focusInput(input?: BalInput): void {
		if (!input) return;

		requestAnimationFrame(() => void input.setFocus());
	}
}
