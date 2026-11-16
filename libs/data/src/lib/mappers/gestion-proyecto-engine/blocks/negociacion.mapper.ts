import { NegociacionContratacion } from '../../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../../models/insurance-state.model';
import { getCampoPorDefecto, TEMP_MOCKS } from '../gestion-proyecto.mapper';

export function mapNegociacionBlock(data: AutoInsuranceState): NegociacionContratacion {
	return {
		combinacionComercial: data.configuracion.combinacionesComerciales?.[0]?.codigo ?? TEMP_MOCKS.combinacionComercial,
		periodicidadPago: getCampoPorDefecto(data, 'PERCOBRO') ?? TEMP_MOCKS.periodicidadPago, //No hay el campo fraccionamiento en coberturas
		recargoFraccionamiento: '',
		descuento: '',
		recargo: '',
		autorizadorDescuento: ''
	};
}
