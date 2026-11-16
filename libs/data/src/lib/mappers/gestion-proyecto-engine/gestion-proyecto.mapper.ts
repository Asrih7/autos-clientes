import { GestionProyectoRequestDto } from '../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../models/insurance-state.model';
import { mapToGestionProyectoRequestBase } from './request-base.engine';

export const TEMP_MOCKS = {
	lineaNegocio: 'AU02',
	codigoCompania: '0001',
	codigoMediador: '323232',
	combinacionComercial: 'A1C001',
	periodicidadPago: 'ANUA',
	productoTecnico: 'A1C',
	cicloRenovacion: 'ANUALREN',
	codigoUso: '110-1'
} as const;

export function mapToCotizacionRequest(data: AutoInsuranceState): GestionProyectoRequestDto {
	if (data.metadata.identificador === undefined) {
		throw new Error('No existe identificador de emisión para cotizar.');
	}
	return mapToGestionProyectoRequestBase(data);
}

// Reusable data extraction helpers
export function getCampoPorDefecto(data: AutoInsuranceState, idCampo: string): string {
	return data.configuracion.camposConfiguracion?.find((campo) => campo.idCampo === idCampo)?.valorPorDefecto ?? '';
}

export function getCampoNumero(data: AutoInsuranceState, idCampo: string): number {
	const valor = Number(getCampoPorDefecto(data, idCampo));
	return Number.isFinite(valor) ? valor : 0;
}
