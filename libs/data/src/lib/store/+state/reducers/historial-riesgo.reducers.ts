import { Aseguradora } from "../../../models/aseguradora.model";
import { HistorialRiesgoSlice } from "../../../models/insurance-state.model";

export function registrarEdadObtencionCarnet(slice: HistorialRiesgoSlice, edad: number): HistorialRiesgoSlice {
	return { ...slice, edadObtencionCarnet: edad };
}

export function registrarTieneAseguradora(slice: HistorialRiesgoSlice, tieneAseguradora: boolean): HistorialRiesgoSlice {
	return { ...slice, tieneAseguradora };
}

export function registrarAseguradoraSeleccionada(slice: HistorialRiesgoSlice, aseguradora: Aseguradora): HistorialRiesgoSlice {
	return { ...slice, aseguradoraSeleccionada: aseguradora };
}

export function registrarAniosAsegurado(slice: HistorialRiesgoSlice, anios: string): HistorialRiesgoSlice {
	return { ...slice, aniosAsegurado: anios };
}

export function registrarNumeroSiniestros(slice: HistorialRiesgoSlice, numeroSiniestros: string): HistorialRiesgoSlice {
	return { ...slice, numeroSiniestros };
}
