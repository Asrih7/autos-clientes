export function getFechaPersonaParaApi(fecha: string | undefined, fallback: string): string {
	const valor = fecha?.trim();
	if (!valor) return fallback;
	const fechaIso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
	return fechaIso ? `${fechaIso[3]}/${fechaIso[2]}/${fechaIso[1]}` : valor;
}