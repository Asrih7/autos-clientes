import { MediadorContratacion } from "../../../dtos/gestion-proyecto-request.dto";
import { TEMP_MOCKS } from "../gestion-proyecto.mapper";

export function mapMediadorBlock(): MediadorContratacion {
	return { codigo: TEMP_MOCKS.codigoMediador };
}