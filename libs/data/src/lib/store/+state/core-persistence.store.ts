import { Injectable, signal, computed, effect } from '@angular/core';
import { AutoInsuranceState, INITIAL_INSURANCE_STATE } from '../../models/insurance-state.model';

@Injectable({ providedIn: 'root' })
export class CorePersistenceStore {
	private readonly STORAGE_KEY = 'auto_insurance_wizard_draft';
	private readonly _globalState = signal<AutoInsuranceState>(INITIAL_INSURANCE_STATE);

	readonly globalSnapshot = this._globalState.asReadonly();

	readonly metadata = computed(() => this._globalState().metadata);
	readonly configuracion = computed(() => this._globalState().configuracion);
	readonly datosFormularioActivo = computed(() => this._globalState().datosFormularioActivo);

	constructor() {
		this.loadFromStorage();
		effect(() => {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._globalState()));
		});
	}

	updateGlobalSlice(updater: (state: AutoInsuranceState) => AutoInsuranceState): void {
		this._globalState.update(updater);
	}

	clearAllPersistence(): void {
		sessionStorage.removeItem(this.STORAGE_KEY);
		this._globalState.set(INITIAL_INSURANCE_STATE);
	}

	private loadFromStorage(): void {
		try {
			const saved = sessionStorage.getItem(this.STORAGE_KEY);
			if (!saved) return;
			const parsed = JSON.parse(saved) as AutoInsuranceState;
			this._globalState.set({ ...INITIAL_INSURANCE_STATE, ...parsed });
		} catch (e) {
			console.error('Error hydrating draft', e);
		}
	}
}
