import {
	enmascararDocumento,
	enmascararEmail,
	enmascararIban,
	enmascararTelefono,
	formatearFechaIso
} from './resumen-display.utils';

describe('summary display values', () => {
	it('formats ISO dates by calendar parts without a timezone shift', () => {
		expect(formatearFechaIso('2026-09-29')).toBe('29/09/2026');
		expect(formatearFechaIso('2026-09-29T23:00:00Z')).toBe('29/09/2026');
		expect(formatearFechaIso('')).toBe('');
	});

	it('masks personal and bank details before rendering', () => {
		expect(enmascararDocumento('12345256Q')).toBe('*****256Q');
		expect(enmascararIban('ES91 2100 0418 4502 0005 1332')).toBe('**** **** **** **** **** 1332');
		expect(enmascararEmail('paula@example.com')).toBe('p***@example.com');
		expect(enmascararTelefono('+34', '612345678')).toBe('+34 *****5678');
	});
});
