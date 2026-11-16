import { Injectable, inject, computed } from '@angular/core';
import { CorePersistenceStore } from './core-persistence.store';
import * as Reducers from './reducers/vehiculo.reducers';
import { BusquedaVehiculo } from '../../models/busqueda-vehiculo.model';
import { Marca } from '../../models/marca.model';
import { Modelo } from '../../models/modelo.model';

@Injectable({ providedIn: 'root' })
export class VehiculoStore {
	private readonly coreStore = inject(CorePersistenceStore);

	readonly state = computed(() => this.coreStore.globalSnapshot().vehiculo);
	readonly matricula = computed(() => this.state().matricula);

	guardarMatriculaProcesada(matricula: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarMatriculaNormalizada(state.vehiculo, matricula)
		}));
	}

	confirmarVehiculoMatriculado(vehiculo: BusquedaVehiculo, matriculaNormalizada?: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			metadata: { ...state.metadata, tipoFlujo: 'MATRICULA' },
			vehiculo: Reducers.registrarVehiculoExitoso(state.vehiculo, vehiculo, matriculaNormalizada)
		}));
	}

	configurarFlujoManual(): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			metadata: { ...state.metadata, tipoFlujo: 'MANUAL' },
			vehiculo: Reducers.configurarFlujoManual(state.vehiculo)
		}));
	}

	confirmarMarcaSeleccionada(marca: Marca): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarMarcaSeleccionada(state.vehiculo, marca)
		}));
	}

	confirmarModeloSeleccionado(modelo: Modelo): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarModeloSeleccionado(state.vehiculo, modelo)
		}));
	}

	guardarFechaMatriculacion(mes?: string, anio?: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarFechaMatriculacion(state.vehiculo, mes, anio)
		}));
	}

	guardarDetallesVehiculo(
		combustible?: string | null,
		numeroPuertas?: string | null,
		numeroPlazas?: string | null
	): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarDetallesVehiculo(state.vehiculo, combustible, numeroPuertas, numeroPlazas)
		}));
	}

	confirmarVersionSeleccionada(versionId: string, anioLanzamiento?: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarVersionSeleccionada(state.vehiculo, versionId, anioLanzamiento)
		}));
	}

	guardarAnioPrimeraMatriculacion(anioPrimeraMatriculacion: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarAnioPrimeraMatriculacion(state.vehiculo, anioPrimeraMatriculacion)
		}));
	}

	guardarMatriculaYFechaOriginal(matricula: string, mes: string, anio: string): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			vehiculo: Reducers.registrarMatriculaYFechaOriginal(state.vehiculo, matricula, mes, anio)
		}));
	}
}
