import { Injectable, inject, computed } from '@angular/core';
import { CorePersistenceStore } from './core-persistence.store';
import * as Reducers from './reducers/contratacion.reducers';
import { CotizacionResponseDto } from '../../dtos/cotizacion.dto';
import { Modalidad } from '../../models/modalidades.model';

@Injectable({ providedIn: 'root' })
export class ContratacionStore {
	private readonly coreStore = inject(CorePersistenceStore);

	readonly state = computed(() => this.coreStore.globalSnapshot().contratacion);

	confirmarModalidadSeleccionada(modalidad: Modalidad): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarModalidadSeleccionada(state.contratacion, modalidad)
		}));
	}

	guardarRecalculoPolizaContratacion(ultimosDigitosPoliza: string, modalidadRecalculada: Modalidad): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarRecalculoPolizaContratacion(
				state.contratacion,
				ultimosDigitosPoliza,
				modalidadRecalculada
			)
		}));
	}

	guardarCoberturasOpcionalesSeleccionadas(codigosCoberturas: string[]): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarCoberturasOpcionalesSeleccionadas(state.contratacion, codigosCoberturas)
		}));
	}

	guardarSeleccionCoberturasYEscenarios(
		coberturasSeleccionadas: string[],
		coberturasPorEscenario: Record<string, string[]>
	): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarSeleccionCoberturasYEscenarios(
				state.contratacion,
				coberturasSeleccionadas,
				coberturasPorEscenario
			)
		}));
	}

	guardarCotizacionResponse(cotizacion: CotizacionResponseDto): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarCotizacionResponse(state.contratacion, cotizacion)
		}));
	}

	guardarDatosBancariosContratacion(
		fechaEfectoPoliza: string,
		titularCuenta: string,
		iban: string,
		privacidadAceptada: boolean
	): void {
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			contratacion: Reducers.registrarDatosBancariosContratacion(
				state.contratacion,
				fechaEfectoPoliza,
				titularCuenta,
				iban,
				privacidadAceptada
			)
		}));
	}
}
