import {
	BirthDateParts,
	DATOS_PERSONA_VACIOS,
	DatosPersona,
	DatosPersonaField,
	isValidDrivingLicenceAge,
	normalizarTelefonoMovil,
	parseBirthDate,
	PREFIJO_TELEFONICO_ESPANA,
	PREFIJOS_TELEFONICOS,
	validarDatosPersona,
	WizardStep
} from '@mnv-autos-clientes/shared';
import { AutoInsuranceState, DatosPersonaRol } from '../models/insurance-state.model';

export const TODOS_LOS_CAMPOS_DATOS_PERSONA: readonly DatosPersonaField[] = [
	'nif',
	'nombre',
	'primerApellido',
	'segundoApellido',
	'sexo',
	'fechaNacimiento',
	'fechaEmisionCarnet',
	'direccion',
	'numero',
	'piso',
	'bloque',
	'letra',
	'telefonoMovil',
	'email',
	'privacidadAceptada'
];

/**
 * Gatekeeper step check matching sequential application validation paths
 */
export function canContinueFromWizardStep(step: WizardStep, stateData: AutoInsuranceState): boolean {
	switch (step) {
		case 'fecha-matriculacion':
			return Boolean(stateData.vehiculo.mesPrimerMatricula && stateData.vehiculo.anioPrimerMatricula);
		case 'fecha-nacimiento':
			return parseBirthDate(stateData) !== null;
		case 'anos-carnet':
			return isValidDrivingLicenceAge(stateData, stateData.historialRiesgo.edadObtencionCarnet);
		case 'fecha-primera-matriculacion':
			return Boolean(stateData.vehiculo.anioPrimeraMatriculacion);
		case 'anos-asegurado':
			return Boolean(stateData.historialRiesgo.aniosAsegurado);
		case 'historial-partes':
			return Boolean(stateData.historialRiesgo.numeroSiniestros);
		case 'datos-personales':
			return validarDatosPersona(assembleDatosPersona(stateData), [
				'nif',
				'direccion',
				'numero',
				'piso',
				'bloque',
				'letra'
			]).valido;
		case 'datos-contacto':
			return validarDatosPersona(assembleDatosPersona(stateData), ['telefonoMovil', 'email', 'privacidadAceptada'])
				.valido;
		case 'propietario-conductor':
			return (
				stateData.roles.esTomadorConductorPrincipal !== undefined &&
				stateData.roles.esTomadorPropietarioVehiculo !== undefined
			);
		case 'tomador':
			return validarDatosPersona(assembleDatosTomador(stateData), TODOS_LOS_CAMPOS_DATOS_PERSONA).valido;
		case 'matricula':
			return (
				Boolean(stateData.vehiculo.matricula?.trim()) &&
				Boolean(stateData.vehiculo.mesPrimerMatricula && stateData.vehiculo.anioPrimerMatricula)
			);
		case 'datos-bancarios':
			return isDatosBancariosValidos(stateData);
		case 'tiene-aseguradora':
			return stateData.historialRiesgo.tieneAseguradora !== undefined;
		case 'segundo-conductor':
			return stateData.roles.quiereSegundoConductor !== undefined;
		case 'datos-segundo-conductor':
			return validarDatosPersona(assembleDatosPersonaRol('segundoConductor', stateData), TODOS_LOS_CAMPOS_DATOS_PERSONA)
				.valido;
		case 'propietario-vehiculo':
			return validarDatosPersona(assembleDatosPersonaRol('propietario', stateData), TODOS_LOS_CAMPOS_DATOS_PERSONA)
				.valido;
		default:
			return true;
	}
}

/**
 * Validates contractual direct debit configurations
 */
export function isDatosBancariosValidos(data: AutoInsuranceState): boolean {
	const metodoPago = data.contratacion.metodoPago ?? 'CUENTA_BANCARIA';
	const fechaValida = Boolean(data.contratacion.fechaEfectoPoliza?.trim());
	const aceptacionesValidas = data.contratacion.aceptaciones?.informacionContractualAceptada === true;
	if (metodoPago !== 'CUENTA_BANCARIA') return fechaValida && aceptacionesValidas;
	return (
		fechaValida &&
		aceptacionesValidas &&
		Boolean(data.contratacion.titularCuentaBancaria?.trim()) &&
		esIbanEspanolValido(data.contratacion.iban)
	);
}

/**
 * Normalizes phone numbers to standard country layouts
 */
export function normalizarTelefono(value?: string): string {
	const digitos = normalizarTelefonoMovil(value);
	return digitos ? `+${digitos}` : '';
}

/**
 * Resolves phone prefix metadata fragments from active form fields
 */
export function extractDatosTelefono(data: AutoInsuranceState): {
	readonly paisTelefono: string;
	readonly prefijoTelefono: string;
	readonly telefonoMovil: string;
} {
	const fActivo = data.datosFormularioActivo;

	const opcionPais = PREFIJOS_TELEFONICOS.find((prefijo) => prefijo.codigoPais === fActivo.paisTelefono);
	const opcionPrefijo = PREFIJOS_TELEFONICOS.find((prefijo) => prefijo.prefijo === fActivo.prefijoTelefono);
	const opcion = opcionPais ?? opcionPrefijo ?? PREFIJO_TELEFONICO_ESPANA;

	return {
		paisTelefono: opcion.codigoPais,
		prefijoTelefono: opcion.prefijo,
		telefonoMovil: normalizarTelefonoMovil(fActivo.telefonoMovil)
	};
}

/**
 * Validates standard Spanish IBAN configurations using MOD-97 operations
 */
export function esIbanEspanolValido(iban?: string): boolean {
	const valor = iban?.replace(/\s/g, '').toUpperCase() ?? '';
	if (!/^ES\d{22}$/.test(valor)) return false;
	const reorganizado = `${valor.slice(4)}${valor.slice(0, 4)}`;
	let resto = 0;
	for (const caracter of reorganizado) {
		const digitos = /[A-Z]/.test(caracter) ? String(caracter.charCodeAt(0) - 55) : caracter;
		for (const digito of digitos) resto = (resto * 10 + Number(digito)) % 97;
	}
	return resto === 1;
}

/**
 * Assembles a structured flat profile structure for form data entries
 */
export function assembleDatosPersona(data: AutoInsuranceState): DatosPersona {
	const fActivo = data.datosFormularioActivo;
	const telefono = extractDatosTelefono(data);

	return {
		...DATOS_PERSONA_VACIOS,
		nif: fActivo.nif ?? '',
		nombre: fActivo.nombre ?? '',
		primerApellido: fActivo.primerApellido ?? '',
		segundoApellido: fActivo.segundoApellido ?? '',
		sexo: fActivo.sexo ?? null,
		fechaNacimiento: fActivo.fechaNacimiento?.trim() || getFechaNacimientoIso(data),
		fechaEmisionCarnet: fActivo.fechaEmisionCarnet ?? '',
		direccion: fActivo.direccion ?? '',
		numero: fActivo.numero ?? '',
		piso: fActivo.piso ?? '',
		bloque: fActivo.bloque ?? '',
		letra: fActivo.letra ?? '',
		codigoPostal: fActivo.codigoPostal ?? '',
		email: fActivo.email ?? '',
		privacidadAceptada: fActivo.privacidadAceptada ?? false,
		...telefono
	};
}

export function assembleDatosTomador(data: AutoInsuranceState): DatosPersona {
	if (!data.roles.datosTomador) return assembleDatosPersona(data);
	return assembleDatosPersonaRol('tomador', data);
}

export function assembleDatosConductorPrincipal(data: AutoInsuranceState): DatosPersona {
	return data.roles.esTomadorConductorPrincipal
		? assembleDatosTomador(data)
		: assembleDatosPersonaRol('conductorVehiculo', data);
}

export function assembleDatosPropietarioVehiculo(data: AutoInsuranceState): DatosPersona {
	return data.roles.esTomadorPropietarioVehiculo
		? assembleDatosTomador(data)
		: assembleDatosPersonaRol('propietario', data);
}

export function assembleDatosPersonaRol(rol: DatosPersonaRol, data: AutoInsuranceState): DatosPersona {
	let datosGuardados: DatosPersona | undefined;
	switch (rol) {
		case 'tomador':
			datosGuardados = data.roles.datosTomador;
			break;
		case 'propietario':
			datosGuardados = data.roles.datosPropietario;
			break;
		case 'conductorVehiculo':
			datosGuardados = data.roles.datosConductorVehiculo;
			break;
		case 'segundoConductor':
			datosGuardados = data.roles.datosSegundoConductor;
			break;
	}
	return {
		...DATOS_PERSONA_VACIOS,
		...datosGuardados,
		sexo: datosGuardados?.sexo ?? null
	};
}

function getFechaNacimientoIso(data: BirthDateParts): string {
	const fecha = parseBirthDate(data);
	if (!fecha) return '';
	const year = fecha.getFullYear();
	const month = String(fecha.getMonth() + 1).padStart(2, '0');
	const day = String(fecha.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
