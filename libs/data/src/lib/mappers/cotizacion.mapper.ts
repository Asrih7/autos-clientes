import { AUTO_INSURANCE_CONSTANTS, formatDate } from '@mnv-autos-clientes/shared';
import { CotizacionGarantiaEscenarioDto, CotizacionRequestDto, CotizacionResponseDto } from '../dtos/cotizacion.dto';
import { AutoInsuranceData } from '../store/insurance-state.service';

export function mapToCotizacionRequest(data: AutoInsuranceData): CotizacionRequestDto {
	if (data.identificador === undefined) throw new Error('No existe identificador de emisión para cotizar.');
	const hoy = new Date();
	const vencimiento = new Date(hoy); vencimiento.setFullYear(vencimiento.getFullYear() + 1);
	const fechaNacimiento = [data.diaFechaNacimiento, data.mesFechaNacimiento, data.anioFechaNacimiento].every(Boolean)
		? `${data.diaFechaNacimiento}/${data.mesFechaNacimiento}/${data.anioFechaNacimiento}` : '';
	const fechaMatriculacion = data.anioPrimerMatricula && data.mesPrimerMatricula
		? `01/${data.mesPrimerMatricula.padStart(2, '0')}/${data.anioPrimerMatricula}` : data.anioPrimeraMatriculacion ? `01/01/${data.anioPrimeraMatriculacion}` : '';
	const persona = { tipoIdentificador: 'NIF', identificador: data.nif ?? '', nombre: data.nombre ?? '', apellido1: data.primerApellido ?? '', apellido2: data.segundoApellido ?? '', sexo: data.sexo ?? '', codigoTipoVia: '', nombreVia: data.direccion ?? '', domicilio: data.numero ?? '', codigoPostal: '', localidad: '', codigoProvincia: '', pais: 'ESP' };
	const respuestaPrevia = data.cotizacion;
	const garantias = respuestaPrevia ? mapGarantias(respuestaPrevia, data.coberturasOpcionalesPorEscenario ?? {}) : [];
	return {
		identificadorEmision: String(data.identificador), mediador: { codigo: AUTO_INSURANCE_CONSTANTS.codigoMediador },
		tomador: { ...persona, fechNaci: fechaNacimiento },
		contrato: { productoTecnico: AUTO_INSURANCE_CONSTANTS.productoTecnico, cicloRenovacion: AUTO_INSURANCE_CONSTANTS.cicloRenovacion, efectoPoliza: formatDate(hoy), vencimientoPoliza: formatDate(vencimiento), fechaTarifaMasCampoForzar: '' },
		negociacion: { combinacionComercial: 'A1C001', periodicidadPago: 'ANUA', recargoFraccionamiento: '', descuento: '', recargo: '', autorizadorDescuento: '' },
		otrosDatos: { idioma: '', firmaElectronica: true, preCotizado: false },
		riesgoAutos: {
			vehiculos: [{ matricula: data.matricula ?? '', isMatriculaPersonalizada: false, matriculaPersonalizada: '', bastidor: '', fechaMatriculacion, codigoBase7: data.versionSeleccionada?.version.id ?? data.versionId ?? '', remolque: '', codigoPostal: '', codigoUso: '', carroceria: '', accesorios: [] }],
			conductores: [{ ...persona, tipoCarne: '', fechaNacimiento, fechaCarne: data.fechaEmisionCarnet ?? '', mismoQueTomador: true }],
			propietario: { ...persona, razonSocial: '', fechaNacimiento, fechaCarne: data.fechaEmisionCarnet ?? '' },
			siniestralidad: { opcion: data.tieneAseguradora ? 'SI' : 'NO', codigoCompania: data.aseguradoraSeleccionada?.id ?? '', polizaCompania: data.ultimosDigitosPoliza ?? '', porcentajeRcManual: '', porcentajeDaniosManual: '', aniosCompaniaAnterior: data.aniosAsegurado ?? '', numeroSiniestros: data.numeroSiniestros ?? '' }
		},
		garantias: { escenarioSeleccionado: data.modalidadSeleccionada?.codigo ?? '', datosGarantiaAutos: { capitalInvalidez: 0, capitalFallecimiento: 0, numeroPlazasAseguradas: getNumeroPlazasAseguradas(data) }, escenarios: garantias }
	};
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
