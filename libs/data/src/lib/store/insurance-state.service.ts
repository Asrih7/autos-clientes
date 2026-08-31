import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { AutoInsuranceApiService } from '../services/auto-insurance-api.service';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';
import { Marca } from '../models/marca.model';
import { Modelo } from '../models/modelo.model';

export interface AutoInsuranceData {
	tipoFlujo?: 'MATRICULA' | 'MANUAL';
	vehiculo?: BusquedaVehiculo;
	marcaSeleccionada?: Marca;
	modeloSeleccionado?: Modelo;
	versionId?: string;
	tieneAseguradora?: boolean;
	mesPrimerMatricula?: string;
	anioPrimerMatricula?: string;
	combustible?: string;
	numeroPuertas?: string;
	numeroPlazas?: string;
}

@Injectable({ providedIn: 'root' })
export class InsuranceStateService {
	private readonly STORAGE_KEY = 'auto_insurance_wizard_draft';
	private readonly apiService = inject(AutoInsuranceApiService);

	private _formData = signal<AutoInsuranceData>({});
	formData = computed(() => this._formData());

	activeStepsMap = computed<WizardStep[]>(() => {
		const data = this._formData();
		const steps: WizardStep[] = ['busqueda'];

		if (data.tipoFlujo === 'MANUAL') {
			steps.push('marca', 'modelo', 'fecha-matriculacion', 'caracteristicas');
		}
		steps.push('versiones');
		if (data.tipoFlujo === 'MANUAL') {
			steps.push('fecha-primera-matriculacion');
		}
		steps.push('fecha-nacimiento', 'anos-carnet', 'tiene-aseguradora');
		if (data.tieneAseguradora) {
			steps.push('lista-aseguradoras', 'anos-asegurado', 'historial-partes');
		}
		steps.push('datos-personales', 'datos-contacto', 'precios');
		return steps;
	});

	constructor() {
		this.loadFromStorage();

		effect(() => {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._formData()));
		});
	}

	saveData(data: Partial<AutoInsuranceData>) {
		this._formData.update((current) => ({ ...current, ...data }));
	}

	clearAll() {
		sessionStorage.removeItem(this.STORAGE_KEY);
		this._formData.set({});
		this.apiService.limpiarCache();
	}

	private loadFromStorage() {
		try {
			const saved = sessionStorage.getItem(this.STORAGE_KEY);
			if (saved) {
				this._formData.set(JSON.parse(saved));
			}
		} catch (e) {
			console.error('Error recuperando sesión de datos', e);
		}
	}
}
