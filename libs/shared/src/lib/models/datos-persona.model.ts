export type SexoPersona = 'HOMBRE' | 'MUJER' | null;

export type DatosPersonaField =
	| 'nif'
	| 'nombre'
	| 'primerApellido'
	| 'segundoApellido'
	| 'sexo'
	| 'fechaNacimiento'
	| 'fechaEmisionCarnet'
	| 'direccion'
	| 'numero'
	| 'piso'
	| 'bloque'
	| 'letra'
	| 'telefonoMovil'
	| 'email'
	| 'privacidadAceptada';

export interface PrefijoTelefonico {
	readonly codigoPais: string;
	readonly prefijo: string;
}

export interface DatosPersona {
	readonly nif: string;
	readonly nombre: string;
	readonly primerApellido: string;
	readonly segundoApellido: string;
	readonly sexo: SexoPersona;
	readonly fechaNacimiento: string;
	readonly fechaEmisionCarnet: string;
	readonly direccion: string;
	readonly numero: string;
	readonly piso: string;
	readonly bloque: string;
	readonly letra: string;
	readonly codigoPostal?: string;
	readonly paisTelefono: string;
	readonly prefijoTelefono: string;
	readonly telefonoMovil: string;
	readonly email: string;
	readonly privacidadAceptada: boolean;
}

export const DATOS_PERSONA_VACIOS: DatosPersona = {
	nif: '',
	nombre: '',
	primerApellido: '',
	segundoApellido: '',
	sexo: null,
	fechaNacimiento: '',
	fechaEmisionCarnet: '',
	direccion: '',
	numero: '',
	piso: '',
	bloque: '',
	letra: '',
	codigoPostal: '',
	paisTelefono: 'ESP',
	prefijoTelefono: '+34',
	telefonoMovil: '',
	email: '',
	privacidadAceptada: false
};
