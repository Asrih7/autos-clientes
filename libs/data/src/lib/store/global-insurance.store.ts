import { Injectable, computed, Signal, inject, effect } from '@angular/core';
import { IGlobalInsuranceStore } from '../models/insurance-store.interface';
import { VehiculosStore } from './vehiculos.store';
import { ProduccionStore } from './produccion.store';
import { PrimasYCoberturasStore } from './primas-y-coberturas.store';
import { TuClienteStore } from './tu-cliente.store';
import { ConductoresStore } from './conductores.store';

const STORAGE_KEY = 'mnv_autos_insurance_wizard_state';

@Injectable({
	providedIn: 'root'
})
export class GlobalInsuranceStore implements IGlobalInsuranceStore {
	protected clienteStore = inject(TuClienteStore);
	protected vehiculosStore = inject(VehiculosStore);
	protected conductoresStore = inject(ConductoresStore);
	protected primasYCoberturasStore = inject(PrimasYCoberturasStore);
	protected produccionStore = inject(ProduccionStore);

	// 1. Strict Linear Completion Rules (Waterfall Chaining)
	public readonly isClienteComplete: Signal<boolean> = computed(() => this.clienteStore.isComplete());

	public readonly isVehiculoComplete: Signal<boolean> = computed(() => {
		return this.isClienteComplete() && this.vehiculosStore.isComplete();
	});

	public readonly isConductoresComplete: Signal<boolean> = computed(() => {
		return this.isVehiculoComplete() && this.conductoresStore.isComplete();
	});

	public readonly isPrimasCoberturasComplete: Signal<boolean> = computed(() => {
		return this.isConductoresComplete() && this.primasYCoberturasStore.isComplete();
	});

	public readonly isFinalFlowComplete: Signal<boolean> = computed(() => {
		return this.isPrimasCoberturasComplete() && this.produccionStore.isComplete();
	});

	constructor() {
		this.loadStateFromSession();

		// 2. Automated Sync Effect
		effect(() => {
			const snapshot = {
				cliente: this.clienteStore.state(),
				vehiculo: this.vehiculosStore.state(),
				conductores: this.conductoresStore.state(),
				primasCoberturas: this.primasYCoberturasStore.state(),
				produccion: this.produccionStore.state()
			};
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		});
	}

	// 3. Centralized Clean Wiping Operations
	public updateClienteAndClearDownstream(data: any): void {
		this.clienteStore.updateData(data);
		this.vehiculosStore.clear();
		this.conductoresStore.clear();
		this.primasYCoberturasStore.clear();
		this.produccionStore.clear();
	}

	public updateVehiculoAndClearDownstream(data: Partial<any>): void {
		this.vehiculosStore.updateData(data);
		this.conductoresStore.clear();
		this.primasYCoberturasStore.clear();
		this.produccionStore.clear();
	}

	public updateConductoresAndClearDownstream(data: any): void {
		this.conductoresStore.updateData(data);
		this.primasYCoberturasStore.clear();
		this.produccionStore.clear();
	}

	public updatePrimasCoberturas(data: any): void {
		this.primasYCoberturasStore.updateData(data);
		this.produccionStore.clear();
	}

	public updateProduccion(data: any): void {
		this.produccionStore.updateData(data);
	}

	public clearSessionAfterPurchase(): void {
		sessionStorage.removeItem(STORAGE_KEY);
		this.clienteStore.clear();
		this.vehiculosStore.clear();
		this.conductoresStore.clear();
		this.primasYCoberturasStore.clear();
		this.produccionStore.clear();
	}

	private loadStateFromSession(): void {
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (!saved) return;
		try {
			const parsed = JSON.parse(saved);
			if (parsed.cliente) this.clienteStore.state.set(parsed.cliente);
			if (parsed.vehiculo) this.vehiculosStore.state.set(parsed.vehiculo);
			if (parsed.conductores) this.conductoresStore.state.set(parsed.conductores);
			if (parsed.primasCoberturas) this.primasYCoberturasStore.state.set(parsed.primasCoberturas);
			if (parsed.produccion) this.produccionStore.state.set(parsed.produccion);
		} catch (e) {
			console.error('State Restoration Error:', e);
		}
	}
}
