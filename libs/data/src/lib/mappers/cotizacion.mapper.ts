import { AUTO_INSURANCE_CONSTANTS, formatDate } from '@mnv-autos-clientes/shared';
import { CotizacionGarantiaEscenarioDto, CotizacionRequestDto, CotizacionResponseDto } from '../dtos/cotizacion.dto';
import { AutoInsuranceData } from '../store/insurance-state.service';

export function getFechaMatriculacionParaApi(data: Partial<AutoInsuranceData>): string {
	if (data.anioPrimerMatricula && data.mesPrimerMatricula) {
		return `01/${String(data.mesPrimerMatricula).padStart(2, '0')}/${data.anioPrimerMatricula}`;
	}
	if (data.anioPrimeraMatriculacion) {
		return `01/01/${data.anioPrimeraMatriculacion}`;
	}
	return '';
}

export function mapToCotizacionRequest(data: AutoInsuranceData): CotizacionRequestDto {
	if (data.identificador === undefined) throw new Error('No existe identificador de emisión para cotizar.');
	const hoy = new Date();
	const vencimiento = new Date(hoy); vencimiento.setFullYear(vencimiento.getFullYear() + 1);
	const fechaNacimiento = [data.diaFechaNacimiento, data.mesFechaNacimiento, data.anioFechaNacimiento].every(Boolean)
		? `${data.diaFechaNacimiento}/${data.mesFechaNacimiento}/${data.anioFechaNacimiento}` : '';
	const fechaMatriculacion = getFechaMatriculacionParaApi(data);
	const codigoPostalVehiculo = data.codigoPostalVehiculo ?? '';
	const personaTomador = data.datosTomador;
	const persona = mapPersona(personaTomador, data);
	const respuestaPrevia = data.cotizacion;
	const garantias = respuestaPrevia ? mapGarantias(respuestaPrevia, data.coberturasOpcionalesPorEscenario ?? {}) : [];
	const productoTecnico = data.productoTecnicoConfigurado?.codigo ?? AUTO_INSURANCE_CONSTANTS.productoTecnico;
	const combinacionComercial = data.combinacionesComerciales?.[0]?.codigo ?? '';
	const periodicidadPago = getCampoPorDefecto(data, 'PERCOBRO');
	const tipoCarne = getCampoPorDefecto(data, 'TIPOLICE');
	const capitalInvalidez = getCampoNumero(data, 'CAPITALI');
	const capitalFallecimiento = getCampoNumero(data, 'CAPITALF');
	const fechaCarne = getFechaCarne(data);
	const fechaNacimientoTomador = getFechaPersonaParaApi(personaTomador?.fechaNacimiento, fechaNacimiento);
	const fechaCarneTomador = getFechaPersonaParaApi(personaTomador?.fechaEmisionCarnet, fechaCarne);
	// P20 se completa antes de P28. Hasta que exista un conductor principal válido,
	// las retarificaciones intermedias deben mantener al tomador como conductor.
	const tieneConductorPrincipal = data.esTomadorConductorPrincipal === false
		&& tieneDatosPersonaParaTarificar(data.datosConductorVehiculo);
	const conductorPrincipal = tieneConductorPrincipal
		? mapPersona(data.datosConductorVehiculo, data)
		: persona;
	const fechaNacimientoConductor = tieneConductorPrincipal
		? getFechaPersonaParaApi(data.datosConductorVehiculo?.fechaNacimiento, fechaNacimiento)
		: fechaNacimientoTomador;
	const fechaCarneConductor = tieneConductorPrincipal
		? getFechaPersonaParaApi(data.datosConductorVehiculo?.fechaEmisionCarnet, fechaCarne)
		: fechaCarneTomador;
	const conductores = [{
		...conductorPrincipal,
		tipoCarne,
		fechaNacimiento: fechaNacimientoConductor,
		fechaCarne: fechaCarneConductor,
		mismoQueTomador: '',
		conductorHabitual: true
	}];
	if (tieneDatosPersonaParaTarificar(data.datosSegundoConductor)) {
		conductores.push({
			...mapPersona(data.datosSegundoConductor, data),
			tipoCarne,
			fechaNacimiento: getFechaPersonaParaApi(data.datosSegundoConductor?.fechaNacimiento, fechaNacimiento),
			fechaCarne: getFechaPersonaParaApi(data.datosSegundoConductor?.fechaEmisionCarnet, fechaCarne),
			mismoQueTomador: '',
			conductorHabitual: false
		});
	}
	return {
		identificadorEmision: String(data.identificador), mediador: { codigo: AUTO_INSURANCE_CONSTANTS.codigoMediador },
		tomador: { ...persona, fechNaci: fechaNacimientoTomador },
		contrato: { productoTecnico, cicloRenovacion: AUTO_INSURANCE_CONSTANTS.cicloRenovacion, efectoPoliza: formatDate(hoy), vencimientoPoliza: formatDate(vencimiento), fechaTarifaMasCampoForzar: '' },
		negociacion: { combinacionComercial, periodicidadPago, recargoFraccionamiento: '', descuento: '', recargo: '', autorizadorDescuento: '' },
		otrosDatos: { idioma: '', firmaElectronica: true, preCotizado: false },
		riesgoAutos: {
			vehiculos: [{ 
		   matricula: data.matricula ?? '2546FBL', //mock
		   isMatriculaPersonalizada: false,
		   matriculaPersonalizada: '',
	 		bastidor: '',
			fechaMatriculacion:'01/06/2006',
			codigoBase7: data.versionSeleccionada?.version.id ?? data.versionId ?? '', remolque: '', codigoPostal: codigoPostalVehiculo, codigoUso: AUTO_INSURANCE_CONSTANTS.codigoUso, carroceria: '', accesorios: [] }],
			conductores,
			propietario: { ...persona, razonSocial: '', fechaNacimiento: fechaNacimientoTomador, fechaCarne: fechaCarneTomador },
			siniestralidad: { opcion: data.tieneAseguradora ? 'SI' : 'NO', codigoCompania: data.aseguradoraSeleccionada?.id ?? '', polizaCompania: data.ultimosDigitosPoliza ?? '', porcentajeRcManual: '', porcentajeDaniosManual: '', aniosCompaniaAnterior: data.aniosAsegurado ?? '', numeroSiniestros: data.numeroSiniestros ?? '' }
		},
		garantias: { escenarioSeleccionado: data.modalidadSeleccionada?.codigo ?? '', datosGarantiaAutos: { capitalInvalidez, capitalFallecimiento, numeroPlazasAseguradas: getNumeroPlazasAseguradas(data) }, escenarios: garantias }
	};
}

function tieneDatosPersonaParaTarificar(persona: AutoInsuranceData['datosTomador'] | undefined): boolean {
	return Boolean(
		persona?.nif.trim()
		&& persona.nombre.trim()
		&& persona.primerApellido.trim()
		&& persona.segundoApellido.trim()
		&& persona.sexo
		&& persona.fechaNacimiento.trim()
		&& persona.fechaEmisionCarnet.trim()
		&& persona.direccion.trim()
		&& persona.numero.trim()
		&& persona.codigoPostal?.trim()
	);
}

function mapPersona(persona: AutoInsuranceData['datosTomador'] | undefined, fallback: AutoInsuranceData): Record<string, string> {
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

function getFechaPersonaParaApi(fecha: string | undefined, fallback: string): string {
	const valor = fecha?.trim();
	if (!valor) return fallback;
	const fechaIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
	return fechaIso ? `${fechaIso[3]}/${fechaIso[2]}/${fechaIso[1]}` : valor;
}

function getCampoPorDefecto(data: AutoInsuranceData, idCampo: string): string {
	return data.camposConfiguracion?.find((campo) => campo.idCampo === idCampo)?.valorPorDefecto ?? '';
}

function getCampoNumero(data: AutoInsuranceData, idCampo: string): number {
	const valor = Number(getCampoPorDefecto(data, idCampo));
	return Number.isFinite(valor) ? valor : 0;
}

function getFechaCarne(data: AutoInsuranceData): string {
	const dia = Number(data.diaFechaNacimiento);
	const mes = Number(data.mesFechaNacimiento);
	const anio = Number(data.anioFechaNacimiento);
	const edadCarnet = data.edadObtencionCarnet;
	if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anio) || edadCarnet === undefined) return '';

	const fecha = new Date(anio + edadCarnet, mes - 1, dia);
	if (fecha.getFullYear() !== anio + edadCarnet || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) return '';
	return formatDate(fecha);
}

function getNumeroPlazasAseguradas(data: AutoInsuranceData): number {
	const plazasState = Number(data.numeroPlazas);
	if (Number.isFinite(plazasState) && plazasState > 0) return plazasState;

	const version = data.vehiculo?.versiones.find((item) => item.version.id === data.versionId);
	const plazasVersion = Number(version?.caracteristicas.numeroPlazas);
	return Number.isFinite(plazasVersion) && plazasVersion > 0 ? plazasVersion : 0;
}

function mapGarantias(cotizacion: CotizacionResponseDto, seleccionadasPorEscenario: Record<string, string[]>): CotizacionGarantiaEscenarioDto[] {
	return cotizacion.escenarios.map((escenario) => {
		const seleccionadas = seleccionadasPorEscenario[escenario.codigo];
		return { codigo: escenario.codigo, coberturasOpcionales: escenario.coberturasOpcionales.map((cobertura) => ({ codigo: cobertura.codigo, contratada: seleccionadas ? seleccionadas.includes(cobertura.codigo) : cobertura.contratada, codigoRelacionEscenario: cobertura.codigoRelacion })) };
	});
}
