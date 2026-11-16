import { DatosPersona } from '@mnv-autos-clientes/shared';
import { DatosPersonaRol, RolesSlice } from '../../../models/insurance-state.model';

export function registrarTomadorConductorPrincipal(slice: RolesSlice, esPrincipal: boolean): RolesSlice {
	return { ...slice, esTomadorConductorPrincipal: esPrincipal };
}

export function registrarTomadorPropietarioVehiculo(slice: RolesSlice, esPropietario: boolean): RolesSlice {
	return { ...slice, esTomadorPropietarioVehiculo: esPropietario };
}

export function registrarQuiereSegundoConductor(slice: RolesSlice, quiereSegundoConductor: boolean): RolesSlice {
	return { ...slice, quiereSegundoConductor };
}

export function registrarDatosPersonaRol(slice: RolesSlice, rol: DatosPersonaRol, datos: DatosPersona): RolesSlice {
	const updated = { ...slice };
	switch (rol) {
		case 'tomador': updated.datosTomador = datos; break;
		case 'propietario': updated.datosPropietario = datos; break;
		case 'conductorVehiculo': updated.datosConductorVehiculo = datos; break;
		case 'segundoConductor': updated.datosSegundoConductor = datos; break;
	}
	return updated;
}
