import { mapRiesgoAutosBlock } from './riesgos-autos.mapper';
import { getFechaPersonaParaApi } from '../helpers/persona.helper';
import { TomadorContratacion } from '../../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../../models/insurance-state.model';

export function mapTomadorBlock(data: AutoInsuranceState): TomadorContratacion {
	const riesgo = mapRiesgoAutosBlock(data);
	const tomadorConductor = riesgo.conductores.find(c => c.mismoQueTomador && c.conductorHabitual);
	
	const fechaNacimientoTomador = getFechaPersonaParaApi([data.diaFechaNacimiento, data.mesFechaNacimiento, data.anioFechaNacimiento].every(Boolean) 
		? `${data.diaFechaNacimiento}/${data.mesFechaNacimiento}/${data.anioFechaNacimiento}` : '', '');

	return {
		tipoIdentificador: tomadorConductor?.tipoIdentificador ?? '',
		identificador: tomadorConductor?.identificador ?? data.datosFormularioActivo.nif ?? '',
		nombre: tomadorConductor?.nombre ?? data.datosFormularioActivo.nombre ?? '',
		apellido1: tomadorConductor?.apellido1 ?? data.datosFormularioActivo.primerApellido ?? '',
		apellido2: tomadorConductor?.apellido2 ?? data.datosFormularioActivo.segundoApellido ?? '',
		sexo: tomadorConductor?.sexo ?? data.datosFormularioActivo.sexo ?? '',
		codigoTipoVia: '',
		nombreVia: tomadorConductor?.nombreVia ?? data.datosFormularioActivo.direccion ?? '',
		domicilio: tomadorConductor?.domicilio ?? data.datosFormularioActivo.numero ?? '',
		codigoPostal: tomadorConductor?.codigoPostal ?? data.datosFormularioActivo.codigoPostal ?? '',
		localidad: '',
		codigoProvincia: '',
		pais: 'ESP',
		fechNaci: getFechaPersonaParaApi(data.roles.datosTomador?.fechaNacimiento, fechaNacimientoTomador)
	};
}
