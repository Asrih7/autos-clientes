import { OtrosDatosContratacion } from "../../../dtos/gestion-proyecto-request.dto";

export function mapOtrosDatosBlock(): OtrosDatosContratacion {
	return {
		idioma: 'ES',
		firmaElectronica: true,
		preCotizado: false
	};
}
