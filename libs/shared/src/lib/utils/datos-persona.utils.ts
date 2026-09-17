import { PREFIJO_TELEFONICO_ESPANA, PREFIJOS_TELEFONICOS } from '../constants/prefijos-telefonicos.constant';
import { DatosPersona, DatosPersonaField, PrefijoTelefonico } from '../models/datos-persona.model';

const CAMPOS_OBLIGATORIOS = new Set<DatosPersonaField>([
	'nif',
	'nombre',
	'primerApellido',
	'sexo',
	'fechaNacimiento',
	'fechaEmisionCarnet',
	'direccion',
	'numero',
	'telefonoMovil',
	'email',
	'privacidadAceptada'
]);

export interface ResultadoValidacionDatosPersona {
	readonly valido: boolean;
	readonly camposInvalidos: ReadonlySet<DatosPersonaField>;
}

export function esCampoDatosPersonaObligatorio(campo: DatosPersonaField): boolean {
	return CAMPOS_OBLIGATORIOS.has(campo);
}

export function esNifNieValido(value?: string): boolean {
	if (!value) return false;

	const normalizedValue = value.replace(/[\s-]/g, '').toUpperCase();
	const match = normalizedValue.match(/^([0-9]{8}|[XYZ][0-9]{7})([A-Z])$/);
	if (!match) return false;

	const [, identifier, controlLetter] = match;
	const numericIdentifier = identifier.replace('X', '0').replace('Y', '1').replace('Z', '2');
	const validLetters = 'TRWAGMYFPDXBNJZSQVHLCKE';

	return validLetters[Number(numericIdentifier) % validLetters.length] === controlLetter;
}

export function esEmailValido(value?: string): boolean {
	return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()));
}

export function normalizarTelefonoMovil(value?: string): string {
	return value?.replace(/\D/g, '') ?? '';
}

export function combinarTelefonoE164(prefijo?: string, telefonoMovil?: string): string {
	const prefijoNormalizado = prefijo?.replace(/\D/g, '') ?? '';
	const movilNormalizado = normalizarTelefonoMovil(telefonoMovil);
	return prefijoNormalizado && movilNormalizado ? `+${prefijoNormalizado}${movilNormalizado}` : '';
}

export function esTelefonoE164Valido(prefijo?: string, telefonoMovil?: string): boolean {
	return /^\+[1-9]\d{7,14}$/.test(combinarTelefonoE164(prefijo, telefonoMovil));
}

export function separarTelefonoE164(
	telefono?: string,
	prefijos: readonly PrefijoTelefonico[] = PREFIJOS_TELEFONICOS
): { readonly paisTelefono: string; readonly prefijoTelefono: string; readonly telefonoMovil: string } {
	const normalizado = telefono ? `+${telefono.replace(/\D/g, '')}` : '';
	const prefijosOrdenados = [...prefijos].sort((a, b) => b.prefijo.length - a.prefijo.length);
	const coincidencias = prefijosOrdenados.filter((opcion) => normalizado.startsWith(opcion.prefijo));
	const coincidencia =
		coincidencias.find((opcion) => opcion.codigoPais === 'ESP') ?? coincidencias[0] ?? PREFIJO_TELEFONICO_ESPANA;

	return {
		paisTelefono: coincidencia.codigoPais,
		prefijoTelefono: coincidencia.prefijo,
		telefonoMovil: normalizado.startsWith(coincidencia.prefijo)
			? normalizado.slice(coincidencia.prefijo.length)
			: normalizarTelefonoMovil(telefono)
	};
}

export function esFechaNacimientoValida(fechaIso: string, hoy = new Date()): boolean {
	const nacimiento = parseFechaIso(fechaIso);
	if (!nacimiento) return false;

	const edad = calcularEdad(nacimiento, hoy);
	return edad >= 18 && edad <= 99;
}

export function esFechaEmisionCarnetValida(
	fechaEmisionIso: string,
	fechaNacimientoIso: string,
	hoy = new Date()
): boolean {
	const emision = parseFechaIso(fechaEmisionIso);
	const nacimiento = parseFechaIso(fechaNacimientoIso);
	if (!emision || !nacimiento || emision > inicioDelDia(hoy)) return false;

	const fechaCumpleanos18 = new Date(nacimiento.getFullYear() + 18, nacimiento.getMonth(), nacimiento.getDate());
	return emision >= fechaCumpleanos18;
}

export function validarDatosPersona(
	datos: DatosPersona,
	camposVisibles: readonly DatosPersonaField[],
	hoy = new Date()
): ResultadoValidacionDatosPersona {
	const invalidos = new Set<DatosPersonaField>();

	for (const campo of new Set(camposVisibles)) {
		if (!esCampoValido(campo, datos, hoy)) invalidos.add(campo);
	}

	return { valido: invalidos.size === 0, camposInvalidos: invalidos };
}

function esCampoValido(campo: DatosPersonaField, datos: DatosPersona, hoy: Date): boolean {
	switch (campo) {
		case 'nif':
			return esNifNieValido(datos.nif);
		case 'nombre':
		case 'primerApellido':
		case 'direccion':
		case 'numero':
			return Boolean(datos[campo].trim());
		case 'sexo':
			return datos.sexo === 'HOMBRE' || datos.sexo === 'MUJER';
		case 'fechaNacimiento':
			return esFechaNacimientoValida(datos.fechaNacimiento, hoy);
		case 'fechaEmisionCarnet':
			return esFechaEmisionCarnetValida(datos.fechaEmisionCarnet, datos.fechaNacimiento, hoy);
		case 'telefonoMovil':
			return esTelefonoE164Valido(datos.prefijoTelefono, datos.telefonoMovil);
		case 'email':
			return esEmailValido(datos.email);
		case 'privacidadAceptada':
			return datos.privacidadAceptada;
		case 'segundoApellido':
		case 'piso':
		case 'bloque':
		case 'letra':
			return true;
	}
}

function parseFechaIso(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;

	const [, year, month, day] = match;
	const date = new Date(Number(year), Number(month) - 1, Number(day));
	return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
		? date
		: null;
}

function calcularEdad(nacimiento: Date, hoy: Date): number {
	let edad = hoy.getFullYear() - nacimiento.getFullYear();
	const mes = hoy.getMonth() - nacimiento.getMonth();
	if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
	return edad;
}

function inicioDelDia(value: Date): Date {
	return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}
