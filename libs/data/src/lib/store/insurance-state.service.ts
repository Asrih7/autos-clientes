import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
	BirthDateParts,
	getMinimumBirthDate,
	isBirthDateComplete,
	isValidBirthDate,
	isValidDrivingLicenceAge,
	parseBirthDate,
	WizardStep
} from '@mnv-autos-clientes/shared';
import { AutoInsuranceApiService } from '../services/auto-insurance-api.service';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';
import { Marca } from '../models/marca.model';
import { Aseguradora } from '../models/aseguradora.model';
import { Modelo } from '../models/modelo.model';

export interface AutoInsuranceData extends BirthDateParts {
	tipoFlujo?: 'MATRICULA' | 'MANUAL';
	vehiculo?: BusquedaVehiculo;
	marcaSeleccionada?: Marca;
	aseguradoraSeleccionada?: Aseguradora;
	modeloSeleccionado?: Modelo;
	versionId?: string;
	tieneAseguradora?: boolean;
	mesPrimerMatricula?: string;
	anioPrimerMatricula?: string;
	anioPrimeraMatriculacion?: string;
	combustible?: string;
	numeroPuertas?: string;
	numeroPlazas?: string;
	edadObtencionCarnet?: number;
	aniosAsegurado?: string;
	numeroSiniestros?: string;
	datosPersonalesActivos?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InsuranceStateService {
	private readonly STORAGE_KEY = 'auto_insurance_wizard_draft';
	private readonly LEGACY_DRIVER_STORAGE_KEY = 'auto_insurance_driver_wizard_draft';
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

	canContinueFromStep(step: WizardStep): boolean {
		const data = this._formData();

		switch (step) {
			case 'fecha-nacimiento': return this.isFechaNacimientoValida(data);
			case 'anos-carnet': return this.isEdadObtencionCarnetValida(data);
			case 'fecha-primera-matriculacion': return Boolean(data.anioPrimeraMatriculacion);
			case 'anos-asegurado': return Boolean(data.aniosAsegurado);
			case 'historial-partes': return Boolean(data.numeroSiniestros);
			case 'tiene-aseguradora': return data.tieneAseguradora !== undefined;
			default: return true;
		}
	}

	isFechaNacimientoCompleta(data = this._formData()): boolean {
		return isBirthDateComplete(data);
	}

	isFechaNacimientoValida(data = this._formData()): boolean {
		return isValidBirthDate(data);
	}

	getMinimumFechaNacimiento(): Date {
		return getMinimumBirthDate();
	}

	isEdadObtencionCarnetValida(data = this._formData()): boolean {
		return isValidDrivingLicenceAge(data, data.edadObtencionCarnet);
	}

	getFechaNacimiento(data = this._formData()): Date | null {
		return parseBirthDate(data);
	}

	clearAll() {
		sessionStorage.removeItem(this.STORAGE_KEY);
		sessionStorage.removeItem(this.LEGACY_DRIVER_STORAGE_KEY);
		this._formData.set({});
		this.apiService.limpiarCache();
	}

	private loadFromStorage() {
		try {
			const saved = sessionStorage.getItem(this.STORAGE_KEY);
			const legacyDriverData = sessionStorage.getItem(this.LEGACY_DRIVER_STORAGE_KEY);
			const formData = saved ? JSON.parse(saved) : {};
			const driverData = legacyDriverData ? JSON.parse(legacyDriverData) : {};

			this._formData.set({ ...driverData, ...formData });
			if (legacyDriverData) sessionStorage.removeItem(this.LEGACY_DRIVER_STORAGE_KEY);
		} catch (e) {
			console.error('Error recuperando sesión de datos', e);
		}
	}
}
