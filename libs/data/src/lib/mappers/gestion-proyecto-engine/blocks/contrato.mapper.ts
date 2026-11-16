
import { formatDate } from '@mnv-autos-clientes/shared';
import { getCampoPorDefecto, TEMP_MOCKS } from '../gestion-proyecto.mapper';
import { ContratoContratacion } from '../../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../../models/insurance-state.model';

export function mapContratoBlock(data: AutoInsuranceState): ContratoContratacion {
	const hoy = new Date();
	const vencimiento = new Date(hoy);
	vencimiento.setFullYear(vencimiento.getFullYear() + 1);

	return {
		productoTecnico: data.configuracion.productoTecnicoConfigurado?.codigo ?? TEMP_MOCKS.productoTecnico,
		cicloRenovacion: getCampoPorDefecto(data, 'CICLOREN') ?? TEMP_MOCKS.cicloRenovacion,
		efectoPoliza: formatDate(hoy),
		vencimientoPoliza: formatDate(vencimiento),
		fechaTarifaMasCampoForzar: ''
	};
}
