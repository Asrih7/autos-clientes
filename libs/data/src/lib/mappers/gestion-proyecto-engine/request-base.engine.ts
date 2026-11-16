import { GestionProyectoRequestDto } from "../../dtos/gestion-proyecto-request.dto";
import { AutoInsuranceState } from "../../models/insurance-state.model";
import { mapContratoBlock } from "./blocks/contrato.mapper";
import { mapGarantiasBlock } from "./blocks/garantias.mapper";
import { mapMediadorBlock } from "./blocks/mediador.mapper";
import { mapNegociacionBlock } from "./blocks/negociacion.mapper";
import { mapOtrosDatosBlock } from "./blocks/otros-datos.mapper";
import { mapRiesgoAutosBlock } from "./blocks/riesgos-autos.mapper";
import { mapTomadorBlock } from "./blocks/tomador.mapper";

export function mapToGestionProyectoRequestBase(data: AutoInsuranceState): GestionProyectoRequestDto {
	return {
		identificadorEmision: String(data.metadata.identificador),
		mediador: mapMediadorBlock(),
		tomador: mapTomadorBlock(data),
		contrato: mapContratoBlock(data),
		negociacion: mapNegociacionBlock(data),
		otrosDatos: mapOtrosDatosBlock(),
		riesgoAutos: mapRiesgoAutosBlock(data),
		garantias: mapGarantiasBlock(data)
	};
}