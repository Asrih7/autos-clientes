export interface ValidacionMatriculaResponse {
	readonly valida: boolean;
	readonly tipoMatricula?: string;
	readonly matriculaNormalizada?: string;
}