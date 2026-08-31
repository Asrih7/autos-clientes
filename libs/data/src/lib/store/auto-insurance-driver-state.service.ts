import { computed, effect, Injectable, signal } from '@angular/core';
import { WizardStep } from '@mnv-autos-clientes/shared';

export interface AutoInsuranceDriverData {
	diaFechaNacimiento?: string;
	mesFechaNacimiento?: string;
	anioFechaNacimiento?: string;
	edadObtencionCarnet?: number;
	tieneAseguradora?: boolean;
	datosPersonalesActivos?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AutoInsuranceDriverStateService {
	private readonly STORAGE_KEY = 'auto_insurance_driver_wizard_draft';

	private readonly _formData = signal<AutoInsuranceDriverData>({});
	formData = computed(() => this._formData());

	constructor() {
		this.loadFromStorage();

		effect(() => {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._formData()));
		});
	}

	saveData(data: Partial<AutoInsuranceDriverData>): void {
		this._formData.update((current) => ({ ...current, ...data }));
	}

	canContinueFromStep(step: WizardStep): boolean {
		const data = this._formData();

		switch (step) {
			case 'fecha-nacimiento':
				return this.isFechaNacimientoValida(data);
			case 'anos-carnet':
				return this.isEdadObtencionCarnetValida(data);
			case 'tiene-aseguradora':
				return data.tieneAseguradora !== undefined;
			default:
				return true;
		}
	}

	isFechaNacimientoCompleta(data = this._formData()): boolean {
		return Boolean(data.diaFechaNacimiento && data.mesFechaNacimiento && data.anioFechaNacimiento);
	}

	isFechaNacimientoValida(data = this._formData()): boolean {
		const fechaNacimiento = this.getFechaNacimiento(data);
		if (!fechaNacimiento) return false;

		const fechaMayorEdad = new Date(fechaNacimiento);
		fechaMayorEdad.setFullYear(fechaMayorEdad.getFullYear() + 18);

		return fechaNacimiento >= this.getMinimumFechaNacimiento() && fechaMayorEdad <= this.getToday();
	}

	getMinimumFechaNacimiento(): Date {
		const today = this.getToday();
		return new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());
	}

	isEdadObtencionCarnetValida(data = this._formData()): boolean {
		const fechaNacimiento = this.getFechaNacimiento(data);
		const edadObtencionCarnet = data.edadObtencionCarnet;
		if (!fechaNacimiento || edadObtencionCarnet === undefined || edadObtencionCarnet < 18) return false;

		const fechaObtencionCarnet = new Date(fechaNacimiento);
		fechaObtencionCarnet.setFullYear(fechaObtencionCarnet.getFullYear() + edadObtencionCarnet);

		return fechaObtencionCarnet < this.getToday();
	}

	getFechaNacimiento(data = this._formData()): Date | null {
		if (!this.isFechaNacimientoCompleta(data)) return null;

		const day = Number(data.diaFechaNacimiento);
		const month = Number(data.mesFechaNacimiento);
		const year = Number(data.anioFechaNacimiento);

		if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
		if (data.anioFechaNacimiento?.length !== 4) return null;

		const date = new Date(year, month - 1, day);
		const isSameDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

		return isSameDate ? date : null;
	}

	clearAll(): void {
		sessionStorage.removeItem(this.STORAGE_KEY);
		this._formData.set({});
	}

	private getToday(): Date {
		const today = new Date();
		return new Date(today.getFullYear(), today.getMonth(), today.getDate());
	}

	private loadFromStorage(): void {
		try {
			const saved = sessionStorage.getItem(this.STORAGE_KEY);
			if (saved) {
				this._formData.set(JSON.parse(saved));
			}
		} catch (e) {
			console.error('Error recuperando sesión de datos del conductor', e);
		}
	}
}
