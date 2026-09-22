export interface BirthDateParts {
	diaFechaNacimiento?: string;
	mesFechaNacimiento?: string;
	anioFechaNacimiento?: string;
}

export function formatDate(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	return `${day}/${month}/${date.getFullYear()}`;
}

export function getNumericValue(value: unknown): string {
	return String(value ?? '').replace(/\D/g, '');
}

export function isBirthDateComplete(data: BirthDateParts): boolean {
	return Boolean(data.diaFechaNacimiento && data.mesFechaNacimiento && data.anioFechaNacimiento);
}

export function parseBirthDate(data: BirthDateParts): Date | null {
	if (!isBirthDateComplete(data)) return null;

	const day = Number(data.diaFechaNacimiento);
	const month = Number(data.mesFechaNacimiento);
	const year = Number(data.anioFechaNacimiento);

	if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
	if (data.anioFechaNacimiento?.length !== 4) return null;

	const date = new Date(year, month - 1, day);
	const isSameDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
	return isSameDate ? date : null;
}

export function getToday(date = new Date()): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMinimumBirthDate(today = getToday()): Date {
	return new Date(today.getFullYear() - 99, today.getMonth(), today.getDate());
}

export function isValidBirthDate(data: BirthDateParts, today = getToday()): boolean {
	const birthDate = parseBirthDate(data);
	if (!birthDate) return false;

	const adulthoodDate = new Date(birthDate);
	adulthoodDate.setFullYear(adulthoodDate.getFullYear() + 18);
	return birthDate >= getMinimumBirthDate(today) && adulthoodDate <= today;
}

export function isValidDrivingLicenceAge(data: BirthDateParts, licenceAge: number | undefined, today = getToday()): boolean {
	const birthDate = parseBirthDate(data);
	if (!birthDate || licenceAge === undefined || licenceAge < 18) return false;

	const licenceDate = new Date(birthDate);
	licenceDate.setFullYear(licenceDate.getFullYear() + licenceAge);
	return licenceDate < today;
}
