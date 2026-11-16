import { getCampoPorDefecto, TEMP_MOCKS } from '../gestion-proyecto.mapper';
import { getFechaPersonaParaApi } from '../helpers/persona.helper';
import { getFechaMatriculacionParaApi } from '../helpers/vehiculo.helper';
import { getFechaCarne, tieneDatosPersonaParaTarificar } from '../helpers/conductores.helper';
import { ConductorContratacion, RiesgoAutosContratacion } from '../../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../../models/insurance-state.model';
import { DatosPersona } from '@mnv-autos-clientes/shared';

export function mapRiesgoAutosBlock(data: AutoInsuranceState): RiesgoAutosContratacion {
	return {
		vehiculo: mapVehiculosRiesgo(data),
		conductores: mapConductoresRiesgo(data),
		propietario: mapPropietarioRiesgo(data),
		siniestralidad: {
			opcion: '',
			codigoCompania: data.historialRiesgo.aseguradoraSeleccionada?.id ?? '',
			polizaCompania: data.contratacion.ultimosDigitosPoliza ?? '',
			porcentajeRcManual: '',
			porcentajeDaniosManual: '',
			aniosCompaniaAnterior: data.historialRiesgo.aniosAsegurado ?? '',
			numeroSiniestros: data.historialRiesgo.numeroSiniestros ?? ''
		}
	};
}

function mapPersonaBase(persona: DatosPersona | undefined, fallback: DatosPersona) {
	return {
		tipoIdentificador: 'NIF',
		identificador: persona?.nif ?? fallback.nif ?? '',
		nombre: persona?.nombre ?? fallback.nombre ?? '',
		apellido1: persona?.primerApellido ?? fallback.primerApellido ?? '',
		apellido2: persona?.segundoApellido ?? fallback.segundoApellido ?? '',
		sexo: persona?.sexo ?? fallback.sexo ?? '',
		codigoTipoVia: '',
		nombreVia: persona?.direccion ?? fallback.direccion ?? '',
		domicilio: persona?.numero ?? fallback.numero ?? '',
		codigoPostal: persona?.codigoPostal?.trim() || fallback.codigoPostal || '',
		localidad: '',
		codigoProvincia: '',
		pais: 'ESP'
	};
}

function mapConductoresRiesgo(data: AutoInsuranceState): ConductorContratacion[] {
	const personaBase = mapPersonaBase(data.roles.datosTomador, data.datosFormularioActivo);
	const tipoCarne = getCampoPorDefecto(data, 'TIPOLICE');
	const fechaCarneFallback = getFechaCarne(data);
	
	const fechaNacimientoTomador = getFechaPersonaParaApi([data.diaFechaNacimiento, data.mesFechaNacimiento, data.anioFechaNacimiento].every(Boolean) 
		? `${data.diaFechaNacimiento}/${data.mesFechaNacimiento}/${data.anioFechaNacimiento}` : '', '');
	const fechaCarneTomador = getFechaPersonaParaApi(data.roles.datosTomador?.fechaEmisionCarnet, fechaCarneFallback);

	const tieneConductorPrincipal = data.roles.esTomadorConductorPrincipal === false && tieneDatosPersonaParaTarificar(data.roles.datosConductorVehiculo);
	const conductorPrincipal = tieneConductorPrincipal ? mapPersonaBase(data.roles.datosConductorVehiculo, data.datosFormularioActivo) : personaBase;

	const conductores: ConductorContratacion[] = [{
		...conductorPrincipal,
		tipoCarne,
		fechaNacimiento: tieneConductorPrincipal ? getFechaPersonaParaApi(data.roles.datosConductorVehiculo?.fechaNacimiento, fechaNacimientoTomador) : fechaNacimientoTomador,
		fechaCarne: tieneConductorPrincipal ? getFechaPersonaParaApi(data.roles.datosConductorVehiculo?.fechaEmisionCarnet, fechaCarneTomador) : fechaCarneTomador,
		mismoQueTomador: true,
		conductorHabitual: true
	}];

	if (tieneDatosPersonaParaTarificar(data.roles.datosSegundoConductor)) {
		conductores.push({
			...mapPersonaBase(data.roles.datosSegundoConductor, data.datosFormularioActivo),
			tipoCarne,
			fechaNacimiento: getFechaPersonaParaApi(data.roles.datosSegundoConductor?.fechaNacimiento, fechaNacimientoTomador),
			fechaCarne: getFechaPersonaParaApi(data.roles.datosSegundoConductor?.fechaEmisionCarnet, fechaCarneFallback),
			mismoQueTomador: true,
			conductorHabitual: false
		});
	}

	return conductores;
}

function mapPropietarioRiesgo(data: AutoInsuranceState) {
	const personaTomador = data.roles.datosTomador;
	const personaPropietario = data.roles.datosPropietario ?? personaTomador;
	
	const fechaNacimientoTomador = getFechaPersonaParaApi([data.diaFechaNacimiento, data.mesFechaNacimiento, data.anioFechaNacimiento].every(Boolean) 
		? `${data.diaFechaNacimiento}/${data.mesFechaNacimiento}/${data.anioFechaNacimiento}` : '', '');
	const fechaCarneTomador = getFechaPersonaParaApi(personaTomador?.fechaEmisionCarnet, getFechaCarne(data));

	return {
		...mapPersonaBase(personaPropietario, data.datosFormularioActivo),
		razonSocial: '',
		fechaNacimiento: getFechaPersonaParaApi(personaPropietario?.fechaNacimiento, fechaNacimientoTomador),
		fechaCarne: getFechaPersonaParaApi(personaPropietario?.fechaEmisionCarnet, fechaCarneTomador)
	};
}

function mapVehiculosRiesgo(data: AutoInsuranceState) {
	return {
		matricula: data.vehiculo.matricula ?? '2546FBL',
		isMatriculaPersonalizada: false,
		matriculaPersonalizada: '',
		bastidor: '',
		fechaMatriculacion: getFechaMatriculacionParaApi(data),
		codigoBase7: data.vehiculo.versionSeleccionada?.version.id ?? data.vehiculo.versionId ?? '',
		remolque: '',
		codigoPostal: data.vehiculo.codigoPostalVehiculo ?? '',
		codigoUso: TEMP_MOCKS.codigoUso,
		carroceria: '',
		accesorios: []
	};
}


