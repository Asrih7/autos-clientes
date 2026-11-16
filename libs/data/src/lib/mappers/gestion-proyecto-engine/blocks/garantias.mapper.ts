import { EscenarioContratacion, GarantiasContratacion } from '../../../dtos/gestion-proyecto-request.dto';
import { AutoInsuranceState } from '../../../models/insurance-state.model';
import { getCampoNumero } from '../gestion-proyecto.mapper';

export function mapGarantiasBlock(data: AutoInsuranceState): GarantiasContratacion {
	const respuestaPrevia = data.contratacion.cotizacion;
	const seleccionadasPorEscenario = data.contratacion.coberturasOpcionalesPorEscenario ?? {};

	const escenarios: EscenarioContratacion[] = respuestaPrevia ? respuestaPrevia.escenarios.map((escenario) => {
		const seleccionadas = seleccionadasPorEscenario[escenario.codigo];
		return {
			codigo: escenario.codigo,
			coberturasOpcionales: escenario.coberturasOpcionales.map((cobertura) => ({
				codigo: cobertura.codigo,
				contratada: seleccionadas ? seleccionadas.includes(cobertura.codigo) : cobertura.contratada,
				codigoRelacionEscenario: cobertura.codigoRelacion
			}))
		};
	}) : [];

	return {
		escenarioSeleccionado: data.contratacion.modalidadSeleccionada?.codigo ?? '',
		datosGarantiaAutos: {
			capitalInvalidez: getCampoNumero(data, 'CAPITALI'),
			capitalFallecimiento: getCampoNumero(data, 'CAPITALF'),
			numeroPlazasAseguradas: getNumeroPlazasAseguradas(data)
		},
		escenarios
	};
}

function getNumeroPlazasAseguradas(data: AutoInsuranceState): number {
	// 1. Fetch cleanly from the nested details slice graph
	const plazasState = Number(data.vehiculo.detalles?.numeroPlazas);
	if (Number.isFinite(plazasState) && plazasState > 0) return plazasState;

	// 2. Query fallback lookup lists safely from the matching vehicle slice references
	const version = data.vehiculo.busqueda?.versiones?.find((item) => item.version.id === data.vehiculo.versionId);
	const plazasVersion = Number(version?.caracteristicas?.numeroPlazas);
	return Number.isFinite(plazasVersion) && plazasVersion > 0 ? plazasVersion : 0;
}
