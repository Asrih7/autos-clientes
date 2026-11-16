import { AfterViewInit, Component, computed, inject, signal, viewChild } from '@angular/core';
import { BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { CorePersistenceStore, AutoInsuranceState } from '@mnv-autos-clientes/data';
import {
	formatDate,
	getNumericValue,
	isBirthDateComplete,
	isValidBirthDate,
	parseBirthDate,
	getMinimumBirthDate
} from '@mnv-autos-clientes/shared';

@Component({
	selector: 'lib-step-p8-fecha-nacimiento',
	host: { class: 'w-full' },
	imports: [BalInput],
	templateUrl: './step-p8-fecha-nacimiento.component.html',
	styleUrl: './step-p8-fecha-nacimiento.component.scss'
})
export class StepP8FechaNacimientoComponent implements AfterViewInit {
	private readonly coreStore = inject(CorePersistenceStore);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly day = signal<string>('');
	protected readonly month = signal<string>('');
	protected readonly year = signal<string>('');
	protected readonly showError = signal<boolean>(false);
	protected readonly minimumBirthDate = computed(() => formatDate(getMinimumBirthDate()));

	private readonly dayInput = viewChild<BalInput>('dayInput');
	private readonly monthInput = viewChild<BalInput>('monthInput');
	private readonly yearInput = viewChild<BalInput>('yearInput');

	protected readonly errorMessage = computed(() => {
		const data = this.getFormData();
		if (!isBirthDateComplete(data)) {
			return 'Introduce la fecha de nacimiento completa.';
		}
		const fechaNacimiento = parseBirthDate(data);
		if (!fechaNacimiento) {
			return 'Introduce una fecha de nacimiento válida.';
		}
		if (fechaNacimiento < getMinimumBirthDate()) {
			return `La fecha debe ser posterior al ${this.minimumBirthDate()}.`;
		}
		if (!isValidBirthDate(data)) {
			return 'El conductor principal debe ser mayor de 18 años.';
		}

		return null;
	});

	constructor() {
		const data = this.coreStore.globalSnapshot();
		this.day.set(data.diaFechaNacimiento ?? '');
		this.month.set(data.mesFechaNacimiento ?? '');
		this.year.set(data.anioFechaNacimiento ?? '');
	}

	ngAfterViewInit(): void {
		requestAnimationFrame(() => void this.dayInput()?.setFocus());
	}

	protected onDayInput(event: Event): void {
		this.day.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
		if (this.day().length === 2) this.focusInput(this.monthInput());
	}

	protected onMonthInput(event: Event): void {
		this.month.set(this.getNumericValue(event).slice(0, 2));
		this.persistValue();
		if (this.month().length === 2) this.focusInput(this.yearInput());
	}

	protected onYearInput(event: Event): void {
		this.year.set(this.getNumericValue(event).slice(0, 4));
		this.persistValue();
		this.advanceWhenDateIsValid();
	}

	private persistValue(): void {
		const dia = this.day();
		const mes = this.month();
		const anio = this.year();

		this.coreStore.updateGlobalSlice((state) => {
			const fechaIso =
				dia.length === 2 && mes.length === 2 && anio.length === 4
					? `${anio}-${mes}-${dia}`
					: state.datosFormularioActivo.fechaNacimiento;

			return {
				...state,
				diaFechaNacimiento: dia,
				mesFechaNacimiento: mes,
				anioFechaNacimiento: anio,
				datosFormularioActivo: {
					...state.datosFormularioActivo,
					fechaNacimiento: fechaIso
				}
			};
		});
	}

	private advanceWhenDateIsValid(): void {
		if (this.year().length !== 4) return;

		if (!isValidBirthDate(this.getFormData())) {
			this.showError.set(true);
			return;
		}

		this.navigation.next();
	}

	private getFormData(): AutoInsuranceState {
		return {
			...this.coreStore.globalSnapshot(),
			diaFechaNacimiento: this.day(),
			mesFechaNacimiento: this.month(),
			anioFechaNacimiento: this.year()
		};
	}

	private getNumericValue(event: Event): string {
		const parsedEvent = parseCustomEvent(event);
		if (!parsedEvent) return '';

		return getNumericValue(parsedEvent);
	}

	private focusInput(input: BalInput | undefined): void {
		if (!input) return;

		requestAnimationFrame(() => void input.setFocus());
	}
}
