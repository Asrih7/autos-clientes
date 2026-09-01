import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { AutoInsuranceDriverStateService, InsuranceStateService } from '@mnv-autos-clientes/data';

@Injectable({ providedIn: 'root' })
export class InsuranceNavigationService {
	private router = inject(Router);
	private stateService = inject(InsuranceStateService);
	private driverStateService = inject(AutoInsuranceDriverStateService);
	private readonly NAV_STORAGE_KEY = 'auto_insurance_navigation_draft';

	private _currentStep = signal<WizardStep>('busqueda');
	private _navigationHistory = signal<WizardStep[]>([]);

	currentStep = computed(() => this._currentStep());
	canGoBack = computed(() => this._navigationHistory().length > 0);
	_navigationHistoryRaw = computed(() => this._navigationHistory());

	readonly canGoForward = computed<boolean>(() => {
		const step = this._currentStep();
		const formData = this.stateService.formData();

		switch (step) {
			case 'busqueda':
				return true;

			case 'marca':
				return !!formData?.marcaSeleccionada;

			case 'modelo':
				return !!formData?.modeloSeleccionado;

			case 'caracteristicas':
				return !!formData?.combustible
					&& !!formData?.numeroPuertas
					&& !!formData?.numeroPlazas;

			case 'fecha-nacimiento':
			case 'anos-carnet':
				return this.driverStateService.canContinueFromStep(step);

			case 'tiene-aseguradora':
				return formData?.tieneAseguradora !== undefined;

			default:
				return true;
		}
	});

	constructor() {
		this.loadNavigationFromStorage();

		effect(() => {
			const navBackup = {
				currentStep: this._currentStep(),
				history: this._navigationHistory()
			};
			sessionStorage.setItem(this.NAV_STORAGE_KEY, JSON.stringify(navBackup));
		});
	}

	next() {
		this.stateService.completarPaso(this._currentStep());
		this.router.navigate([`/autos/next`]);
	}

	back() {
		const history = this._navigationHistory();
		if (history.length === 0) return;

		const newHistory = [...history];
		const previousStep = newHistory.pop()!;

		this.router.navigate([`/autos/${previousStep}`]).then(() => {
			this._navigationHistory.set(newHistory);
			this._currentStep.set(previousStep);
		});
	}

	setStepFromGuard(step: WizardStep) {
		const history = this._navigationHistory();
		if (!history.includes(step) && step !== 'busqueda' && step !== this._currentStep()) {
			this._navigationHistory.update((h) => [...h, this._currentStep()]);
		}
		this._currentStep.set(step);
	}

	hydrateNavigation(current: WizardStep, history: WizardStep[]) {
		this._navigationHistory.set(history);
		this._currentStep.set(current);
	}

	resetNavigation() {
		sessionStorage.removeItem(this.NAV_STORAGE_KEY);
		this._currentStep.set('busqueda');
		this._navigationHistory.set([]);
		this.router.navigate(['/autos/busqueda']);
	}

	private loadNavigationFromStorage() {
		try {
			const savedNav = sessionStorage.getItem(this.NAV_STORAGE_KEY);
			if (savedNav) {
				const { currentStep, history } = JSON.parse(savedNav);
				if (currentStep) {
					this._currentStep.set(currentStep as WizardStep);
					this._navigationHistory.set(history || []);
				}
			}
		} catch (e) {
			console.error('Error recuperando sesión de navegación en core', e);
		}
	}
}
