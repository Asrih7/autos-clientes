import { Injectable, inject, computed } from '@angular/core';
import { CorePersistenceStore } from './core-persistence.store';
import * as Reducers from './reducers/historial-riesgo.reducers';
import { Aseguradora } from '../../models/aseguradora.model';

@Injectable({ providedIn: 'root' })
export class HistorialRiesgoStore {
	private readonly coreStore = inject(CorePersistenceStore);

	readonly state = computed(() => this.coreStore.globalSnapshot().historialRiesgo);
	readonly tieneAseguradora = computed(() => this.state().tieneAseguradora);

	guardarEdadObtencionCarnet(edadObtencionCarnet: number): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			historialRiesgo: Reducers.registrarEdadObtencionCarnet(state.historialRiesgo, edadObtencionCarnet)
		}));
	}

	guardarTieneAseguradora(tieneAseguradora: boolean): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			historialRiesgo: Reducers.registrarTieneAseguradora(state.historialRiesgo, tieneAseguradora)
		}));
	}

	confirmarAseguradoraSeleccionada(aseguradora: Aseguradora): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			historialRiesgo: Reducers.registrarAseguradoraSeleccionada(state.historialRiesgo, aseguradora)
		}));
	}

	guardarAniosAsegurado(aniosAsegurado: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			historialRiesgo: Reducers.registrarAniosAsegurado(state.historialRiesgo, aniosAsegurado)
		}));
	}

	guardarNumeroSiniestros(numeroSiniestros: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			historialRiesgo: Reducers.registrarNumeroSiniestros(state.historialRiesgo, numeroSiniestros)
		}));
	}
}
