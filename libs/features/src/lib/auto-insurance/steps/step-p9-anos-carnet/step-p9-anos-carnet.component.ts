import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalInput, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { CorePersistenceStore, AutoInsuranceState, HistorialRiesgoStore } from '@mnv-autos-clientes/data';
import { getNumericValue, parseBirthDate, isValidDrivingLicenceAge } from '@mnv-autos-clientes/shared';

@Component({
	selector: 'lib-step-p9-anos-carnet',
	host: { class: 'w-full' },
	imports: [BalButton, BalInput],
	templateUrl: './step-p9-anos-carnet.component.html',
	styleUrl: './step-p9-anos-carnet.component.scss'
})
export class StepP9AnosCarnetComponent {
	private readonly historialRiesgoStore = inject(HistorialRiesgoStore);
	private readonly coreStore = inject(CorePersistenceStore);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly edadCarnet = signal<number>(18);
	protected readonly showError = signal<boolean>(false);

	protected readonly errorMessage = computed(() => {
		const currentFullSnapshot = this.getFormData();
		
		if (!parseBirthDate(currentFullSnapshot)) {
			return 'Introduce primero una fecha de nacimiento válida.';
		}
		if (!isValidDrivingLicenceAge(currentFullSnapshot, currentFullSnapshot.historialRiesgo.edadObtencionCarnet)) {
			return 'La fecha de obtención del carné debe ser anterior a la fecha actual.';
		}

		return null;
	});

	constructor() {
		const edadGuardada = this.historialRiesgoStore.state().edadObtencionCarnet;
		
		if (edadGuardada !== undefined) {
			this.edadCarnet.set(Math.max(18, edadGuardada));
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

		const numericValue = Number(getNumericValue(parsedEvent));
		this.edadCarnet.set(Number.isNaN(numericValue) ? 0 : Math.max(18, numericValue));
		this.persistValue();
	}

	protected disminuirEdad(): void {
		this.edadCarnet.update((edad) => Math.max(18, edad - 1));
		this.persistValue();
	}

	protected aumentarEdad(): void {
		this.edadCarnet.update((edad) => edad + 1);
		this.persistValue();
	}

	avanzar(): void {
		this.showError.set(true);
		this.persistValue();
		
		if (!isValidDrivingLicenceAge(this.getFormData(), this.edadCarnet())) return;

		this.navigation.next();
	}

	private persistValue(): void {
		this.historialRiesgoStore.guardarEdadObtencionCarnet(this.edadCarnet());
	}

	private getFormData(): AutoInsuranceState {
		const baseSnapshot = this.coreStore.globalSnapshot();
		return {
			...baseSnapshot,
			historialRiesgo: {
				...baseSnapshot.historialRiesgo,
				edadObtencionCarnet: this.edadCarnet()
			}
		};
	}
}
