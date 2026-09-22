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
	const codigoPostalConductor = data.codigoPostal ?? '';
	const codigoPostalVehiculo = data.codigoPostalVehiculo ?? '';
	const codigoPostalTomador = data.datosTomador?.codigoPostal ?? '';
	const persona = { tipoIdentificador: 'NIF', identificador: data.nif ?? '', nombre: data.nombre ?? '', apellido1: data.primerApellido ?? '', apellido2: data.segundoApellido ?? '', sexo: data.sexo ?? '', codigoTipoVia: '', nombreVia: data.direccion ?? '', domicilio: data.numero ?? '', codigoPostal: codigoPostalConductor, localidad: '', codigoProvincia: '', pais: 'ESP' };
	const respuestaPrevia = data.cotizacion;
	const garantias = respuestaPrevia ? mapGarantias(respuestaPrevia, data.coberturasOpcionalesPorEscenario ?? {}) : [];
	const productoTecnico = data.productoTecnicoConfigurado?.codigo ?? AUTO_INSURANCE_CONSTANTS.productoTecnico;
	const combinacionComercial = data.combinacionesComerciales?.[0]?.codigo ?? '';
	const periodicidadPago = getCampoPorDefecto(data, 'PERCOBRO');
	const tipoCarne = getCampoPorDefecto(data, 'TIPOLICE');
	const capitalInvalidez = getCampoNumero(data, 'CAPITALI');
	const capitalFallecimiento = getCampoNumero(data, 'CAPITALF');
	const fechaCarne = getFechaCarne(data);
	return {
		identificadorEmision: String(data.identificador), mediador: { codigo: AUTO_INSURANCE_CONSTANTS.codigoMediador },
		tomador: { ...persona, codigoPostal: codigoPostalTomador, fechNaci: fechaNacimiento },
		contrato: { productoTecnico, cicloRenovacion: AUTO_INSURANCE_CONSTANTS.cicloRenovacion, efectoPoliza: formatDate(hoy), vencimientoPoliza: formatDate(vencimiento), fechaTarifaMasCampoForzar: '' },
		negociacion: { combinacionComercial, periodicidadPago, recargoFraccionamiento: '', descuento: '', recargo: '', autorizadorDescuento: '' },
		otrosDatos: { idioma: '', firmaElectronica: true, preCotizado: false },
		riesgoAutos: {
			vehiculos: [{ 
		   matricula: data.matricula ?? '2546FBL', //mock
		   isMatriculaPersonalizada: false,
		   matriculaPersonalizada: '',
	 		bastidor: '',
			fechaMatriculacion,
			codigoBase7: data.versionSeleccionada?.version.id ?? data.versionId ?? '', remolque: '', codigoPostal: codigoPostalVehiculo, codigoUso: AUTO_INSURANCE_CONSTANTS.codigoUso, carroceria: '', accesorios: [] }],
			conductores: [{ ...persona, tipoCarne, fechaNacimiento, fechaCarne, mismoQueTomador: true }],
			propietario: { ...persona, razonSocial: '', fechaNacimiento, fechaCarne },
			siniestralidad: { opcion: data.tieneAseguradora ? 'SI' : 'NO', codigoCompania: data.aseguradoraSeleccionada?.id ?? '', polizaCompania: data.ultimosDigitosPoliza ?? '', porcentajeRcManual: '', porcentajeDaniosManual: '', aniosCompaniaAnterior: data.aniosAsegurado ?? '', numeroSiniestros: data.numeroSiniestros ?? '' }
		},
		garantias: { escenarioSeleccionado: data.modalidadSeleccionada?.codigo ?? '', datosGarantiaAutos: { capitalInvalidez, capitalFallecimiento, numeroPlazasAseguradas: getNumeroPlazasAseguradas(data) }, escenarios: garantias }
	};
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
