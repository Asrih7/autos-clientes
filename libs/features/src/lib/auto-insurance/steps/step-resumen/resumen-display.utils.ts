export function formatearFechaIso(fecha?: string): string {
	const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha?.slice(0, 10) ?? '');
	return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
}

export function enmascararDocumento(documento?: string): string {
	const valor = documento?.trim() ?? '';
	if (!valor) return '';
	return valor.length <= 4 ? '****' : `${'*'.repeat(valor.length - 4)}${valor.slice(-4)}`;
}

export function enmascararIban(iban?: string): string {
	const valor = iban?.replace(/\s/g, '').toUpperCase() ?? '';
	if (!valor) return '';
	const oculto = `${'*'.repeat(Math.max(valor.length - 4, 0))}${valor.slice(-4)}`;
	return oculto.match(/.{1,4}/g)?.join(' ') ?? '';
}

export function enmascararEmail(email?: string): string {
	const [usuario, dominio] = email?.trim().split('@') ?? [];
	if (!usuario || !dominio) return '';
	return `${usuario[0]}***@${dominio}`;
}

export function enmascararTelefono(prefijo?: string, telefono?: string): string {
	const digitos = telefono?.replace(/\D/g, '') ?? '';
	if (!digitos) return '';
	const oculto = digitos.length <= 4 ? '****' : `${'*'.repeat(digitos.length - 4)}${digitos.slice(-4)}`;
	return [prefijo?.trim(), oculto].filter(Boolean).join(' ');
}
