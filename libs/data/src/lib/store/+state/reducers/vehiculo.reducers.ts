import { BusquedaVehiculo } from "../../../models/busqueda-vehiculo.model";
import { VehiculoSlice } from "../../../models/insurance-state.model";
import { Marca } from "../../../models/marca.model";
import { Modelo } from "../../../models/modelo.model";

export function registrarMatriculaNormalizada(slice: VehiculoSlice, matricula: string): VehiculoSlice {
	return { ...slice, matricula };
}

export function registrarVehiculoExitoso(slice: VehiculoSlice, vehiculo: BusquedaVehiculo, matriculaNormalizada?: string): VehiculoSlice {
	return {
		...slice,
		busqueda: vehiculo,
		fechaPrimeraMatriculacion: vehiculo.fechaPrimeraMatriculacion,
		matricula: matriculaNormalizada
	};
}

export function configurarFlujoManual(slice: VehiculoSlice): VehiculoSlice {
	return {
		...slice,
		busqueda: undefined,
		marcaSeleccionada: undefined,
		modeloSeleccionado: undefined,
		versionSeleccionada: undefined
	};
}

export function registrarMarcaSeleccionada(slice: VehiculoSlice, marca: Marca): VehiculoSlice {
	return {
		...slice,
		marcaSeleccionada: marca,
		modeloSeleccionado: undefined,
		versionSeleccionada: undefined,
		versionId: undefined
	};
}

export function registrarModeloSeleccionado(slice: VehiculoSlice, modelo: Modelo): VehiculoSlice {
	return {
		...slice,
		modeloSeleccionado: modelo,
		versionSeleccionada: undefined,
		versionId: undefined
	};
}

export function registrarFechaMatriculacion(slice: VehiculoSlice, mes?: string, anio?: string): VehiculoSlice {
	return { ...slice, mesPrimerMatricula: mes, anioPrimerMatricula: anio };
}

export function registrarDetallesVehiculo(slice: VehiculoSlice, combustible?: string | null, puertas?: string | null, plazas?: string | null): VehiculoSlice {
	return {
		...slice,
		detalles: {
			...slice.detalles,
			combustible: combustible ?? undefined,
			numeroPuertas: puertas ?? undefined,
			numeroPlazas: plazas ?? undefined
		}
	};
}

export function registrarVersionSeleccionada(slice: VehiculoSlice, versionId: string, anioLanzamiento?: string): VehiculoSlice {
	return {
		...slice,
		versionId,
		anioInicioFabricacionVersion: anioLanzamiento,
		anioPrimeraMatriculacion: undefined
	};
}

export function registrarAnioPrimeraMatriculacion(slice: VehiculoSlice, anio: string): VehiculoSlice {
	return { ...slice, anioPrimeraMatriculacion: anio };
}

export function registrarMatriculaYFechaOriginal(slice: VehiculoSlice, matricula: string, mes: string, anio: string): VehiculoSlice {
	return {
		...slice,
		matricula,
		mesPrimerMatricula: mes,
		anioPrimerMatricula: anio
	};
}
