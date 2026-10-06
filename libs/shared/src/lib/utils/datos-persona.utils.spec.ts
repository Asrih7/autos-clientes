import { DATOS_PERSONA_VACIOS } from '../models/datos-persona.model';
import {
	combinarTelefonoE164,
	esEmailValido,
	esFechaEmisionCarnetValida,
	esFechaNacimientoValida,
	esNifNieValido,
	esTelefonoE164Valido,
	separarTelefonoE164,
	validarDatosPersona
} from './datos-persona.utils';

describe('datos-persona utils', () => {
	it.each(['12345678Z', 'X1234567L', 'Y1234567X'])('accepts a valid NIF or NIE: %s', (identifier) => {
		expect(esNifNieValido(identifier)).toBe(true);
	});

	it.each(['12345678A', 'X1234567A', 'A12345678', ''])('rejects an invalid NIF or NIE: %s', (identifier) => {
		expect(esNifNieValido(identifier)).toBe(false);
	});

	it('validates birth date limits and the licence issue relationship', () => {
		const today = new Date(2026, 8, 10);

		expect(esFechaNacimientoValida('2008-09-10', today)).toBe(true);
		expect(esFechaNacimientoValida('2008-09-11', today)).toBe(false);
		expect(esFechaNacimientoValida('1926-09-10', today)).toBe(false);
		expect(esFechaEmisionCarnetValida('2026-09-10', '2008-09-10', today)).toBe(true);
		expect(esFechaEmisionCarnetValida('2026-09-09', '2008-09-10', today)).toBe(false);
		expect(esFechaEmisionCarnetValida('2026-09-11', '2008-09-10', today)).toBe(false);
	});

	it('validates email and E.164 from separate country code and national number', () => {
		expect(esEmailValido('persona@example.com')).toBe(true);
		expect(esEmailValido('persona')).toBe(false);
		expect(combinarTelefonoE164('+34', '657 747 576')).toBe('+34657747576');
		expect(esTelefonoE164Valido('+34', '657747576')).toBe(true);
		expect(esTelefonoE164Valido('+34', '123')).toBe(false);
	});

	it('splits old E.164 values using the longest matching prefix', () => {
		expect(separarTelefonoE164('+16845551234')).toEqual({
			paisTelefono: 'ASM',
			prefijoTelefono: '+1684',
			telefonoMovil: '5551234'
		});
		expect(separarTelefonoE164()).toEqual({
			paisTelefono: 'ESP',
			prefijoTelefono: '+34',
			telefonoMovil: ''
		});
	});

	it('only validates visible fields and ignores optional values', () => {
		const datos = {
			...DATOS_PERSONA_VACIOS,
			nif: '12345678Z',
			direccion: 'Calle Mayor',
			numero: '6'
		};

		expect(validarDatosPersona(datos, ['nif', 'direccion', 'numero', 'piso', 'bloque', 'letra']).valido).toBe(true);
		expect(validarDatosPersona(datos, ['email']).camposInvalidos).toEqual(new Set(['email']));
	});
});
