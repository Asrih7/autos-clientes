import { AutoInsuranceState } from "../../../models/insurance-state.model";

export function getFechaMatriculacionParaApi(data: Partial<AutoInsuranceState>): string {
    if (data.vehiculo?.fechaPrimeraMatriculacion?.trim()) return data.vehiculo?.fechaPrimeraMatriculacion.trim();
    if (data.vehiculo?.anioPrimerMatricula && data.vehiculo?.mesPrimerMatricula) {
        return `01/${String(data.vehiculo?.mesPrimerMatricula).padStart(2, '0')}/${data.vehiculo?.anioPrimerMatricula}`;
    }
    if (data.vehiculo?.anioPrimeraMatriculacion) {
        return `01/01/${data.vehiculo?.anioPrimeraMatriculacion}`;
    }
    return '';
}