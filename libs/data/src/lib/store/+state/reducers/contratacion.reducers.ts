import { CotizacionResponseDto } from "../../../dtos/cotizacion.dto";
import { ContratacionSlice } from "../../../models/insurance-state.model";
import { Modalidad } from "../../../models/modalidades.model";

export function registrarModalidadSeleccionada(slice: ContratacionSlice, modalidad: Modalidad): ContratacionSlice {
	return { ...slice, modalidadSeleccionada: modalidad };
}

export function registrarRecalculoPolizaContratacion(slice: ContratacionSlice, ultimosDigitosPoliza: string, modalidadRecalculada: Modalidad): ContratacionSlice {
	return { ...slice, ultimosDigitosPoliza, modalidadSeleccionada: modalidadRecalculada };
}

export function registrarCoberturasOpcionalesSeleccionadas(slice: ContratacionSlice, codigos: string[]): ContratacionSlice {
	return { ...slice, coberturasOpcionalesSeleccionadas: codigos };
}

export function registrarSeleccionCoberturasYEscenarios(slice: ContratacionSlice, coberturasSeleccionadas: string[], coberturasPorEscenario: Record<string, string[]>): ContratacionSlice {
	return {
		...slice,
		coberturasOpcionalesSeleccionadas: coberturasSeleccionadas,
		coberturasOpcionalesPorEscenario: coberturasPorEscenario
	};
}

export function registrarCotizacionResponse(slice: ContratacionSlice, cotizacion: CotizacionResponseDto): ContratacionSlice {
	return { ...slice, cotizacion };
}

export function registrarDatosBancariosContratacion(slice: ContratacionSlice, fechaEfecto: string, titular: string, iban: string, aceptada: boolean): ContratacionSlice {
	return {
		...slice,
		fechaEfectoPoliza: fechaEfecto,
		titularCuentaBancaria: titular,
		iban: iban,
		metodoPago: 'CUENTA_BANCARIA',
		aceptaciones: {
			...slice?.aceptaciones,
			privacidadContratacionAceptada: aceptada,
			informacionContractualAceptada: aceptada
		}
	};
}
