import { formatDate, getNumericValue, isValidBirthDate, isValidDrivingLicenceAge, parseBirthDate } from './date.utils';

describe('date utilities', () => {
	const today = new Date(2026, 8, 3);

	it('parses valid birth-date parts and rejects invalid dates', () => {
		expect(parseBirthDate({ diaFechaNacimiento: '29', mesFechaNacimiento: '02', anioFechaNacimiento: '2000' }))
			.toEqual(new Date(2000, 1, 29));
		expect(parseBirthDate({ diaFechaNacimiento: '31', mesFechaNacimiento: '02', anioFechaNacimiento: '2000' }))
			.toBeNull();
	});

	it('formats dates and keeps only numeric input characters', () => {
		expect(formatDate(new Date(2026, 8, 3))).toBe('03/09/2026');
		expect(getNumericValue('12a/0b3')).toBe('1203');
	});

	it('validates age of majority and driving-licence date', () => {
		const birthDate = { diaFechaNacimiento: '03', mesFechaNacimiento: '09', anioFechaNacimiento: '2008' };
		expect(isValidBirthDate(birthDate, today)).toBe(true);
		expect(isValidDrivingLicenceAge(birthDate, 18, today)).toBe(false);
		expect(isValidDrivingLicenceAge({ ...birthDate, anioFechaNacimiento: '2000' }, 18, today)).toBe(true);
	});
});
