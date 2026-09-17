import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
	BirthDateParts,
	combinarTelefonoE164,
	DATOS_PERSONA_VACIOS,
	DatosPersona,
	DatosPersonaField,
	esEmailValido,
	esNifNieValido,
	esTelefonoE164Valido,
	getMinimumBirthDate,
	isBirthDateComplete,
	isValidBirthDate,
	isValidDrivingLicenceAge,
	normalizarTelefonoMovil,
	parseBirthDate,
	PREFIJO_TELEFONICO_ESPANA,
	PREFIJOS_TELEFONICOS,
	separarTelefonoE164,
	SexoPersona,
	validarDatosPersona,
	WizardStep
} from '@mnv-autos-clientes/shared';
import { Aseguradora } from '../models/aseguradora.model';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';
import { Marca } from '../models/marca.model';
import { Modalidad } from '../models/modalidades.model';
import { Modelo } from '../models/modelo.model';
import { CarVersion } from '../models/version.model';
import { AutoInsuranceApiService } from '../services/auto-insurance-api.service';

export interface AutoInsuranceData extends BirthDateParts {
	tipoFlujo?: 'MATRICULA' | 'MANUAL';
	vehiculo?: BusquedaVehiculo;
	marcaSeleccionada?: Marca;
	aseguradoraSeleccionada?: Aseguradora;
	modeloSeleccionado?: Modelo;
	versionId?: string;
	versionSeleccionada?: CarVersion;
	anioInicioFabricacionVersion?: string;
	tieneAseguradora?: boolean;
	mesPrimerMatricula?: string;
	anioPrimerMatricula?: string;
	anioPrimeraMatriculacion?: string;
	combustible?: string;
	numeroPuertas?: string;
	numeroPlazas?: string;
	edadObtencionCarnet?: number;
	aniosAsegurado?: string;
	numeroSiniestros?: string;
	datosPersonalesActivos?: boolean;
	nif?: string;
	nombre?: string;
	primerApellido?: string;
	segundoApellido?: string;
	sexo?: SexoPersona;
	fechaNacimiento?: string;
	fechaEmisionCarnet?: string;
	direccion?: string;
	numero?: string;
	bloque?: string;
	piso?: string;
	letra?: string;
	email?: string;
	paisTelefono?: string;
	prefijoTelefono?: string;
	telefonoMovil?: string;
	telefono?: string;
	privacidadAceptada?: boolean;
	modalidadSeleccionada?: Modalidad;
	coberturasOpcionalesSeleccionadas?: string[];
	quiereSegundoConductor?: boolean;
	datosTomador?: DatosPersona;
	ultimosDigitosPoliza?: string;
	matricula?: string;
}

@Injectable({ providedIn: 'root' })
export class InsuranceStateService {
	private readonly STORAGE_KEY = 'auto_insurance_wizard_draft';
	private readonly LEGACY_DRIVER_STORAGE_KEY = 'auto_insurance_driver_wizard_draft';
	private readonly apiService = inject(AutoInsuranceApiService);

	private _formData = signal<AutoInsuranceData>({});
	formData = computed(() => this._formData());

	activeStepsMap = computed<WizardStep[]>(() => {
		const data = this._formData();
		const steps: WizardStep[] = ['busqueda'];

		if (data.tipoFlujo === 'MANUAL') {
			steps.push('marca', 'modelo', 'fecha-matriculacion', 'caracteristicas');
		}
		steps.push('versiones');
		if (data.tipoFlujo === 'MANUAL') {
			steps.push('fecha-primera-matriculacion');
		}
		steps.push('fecha-nacimiento', 'anos-carnet', 'tiene-aseguradora');
		if (data.tieneAseguradora) {
			steps.push('lista-aseguradoras', 'anos-asegurado', 'historial-partes');
		}
		steps.push('datos-personales', 'datos-contacto', 'precios');
		if (data.tieneAseguradora) steps.push('contratacion');
		steps.push('coberturas-opcionales');
		steps.push('segundo-conductor');
		steps.push('tomador');
		return steps;
	});

	constructor() {
		this.loadFromStorage();

		effect(() => {
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._formData()));
		});
	}

	saveData(data: Partial<AutoInsuranceData>) {
		this._formData.update((current) => ({ ...current, ...data }));
	}

	saveDatosPersona(datos: DatosPersona): void {
		this.saveData({
			...datos,
			telefono: combinarTelefonoE164(datos.prefijoTelefono, datos.telefonoMovil)
		});
	}

	saveDatosTomador(datos: DatosPersona): void {
		this.saveData({ datosTomador: { ...datos } });
	}

	canContinueFromStep(step: WizardStep): boolean {
		const data = this._formData();
		switch (step) {
			case 'fecha-nacimiento':
				return this.isFechaNacimientoValida(data);
			case 'anos-carnet':
				return this.isEdadObtencionCarnetValida(data);
			case 'fecha-primera-matriculacion':
				return Boolean(data.anioPrimeraMatriculacion);
			case 'anos-asegurado':
				return Boolean(data.aniosAsegurado);
			case 'historial-partes':
				return Boolean(data.numeroSiniestros);
			case 'datos-personales':
				return this.isDatosPersonalesValidos(data);
			case 'datos-contacto':
				return this.isDatosContactoValidos(data);
			case 'tomador':
				return this.isDatosTomadorValido(data);
			case 'tiene-aseguradora':
				return data.tieneAseguradora !== undefined;
			case 'segundo-conductor':
				return data.quiereSegundoConductor !== undefined;
			default:
				return true;
		}
	}

	isFechaNacimientoCompleta(data = this._formData()): boolean {
		return isBirthDateComplete(data);
	}

	isFechaNacimientoValida(data = this._formData()): boolean {
		return isValidBirthDate(data);
	}

	getMinimumFechaNacimiento(): Date {
		return getMinimumBirthDate();
	}

	isEdadObtencionCarnetValida(data = this._formData()): boolean {
		return isValidDrivingLicenceAge(data, data.edadObtencionCarnet);
	}

	isDatosPersonalesValidos(data = this._formData()): boolean {
		return validarDatosPersona(this.getDatosPersona(data), ['nif', 'direccion', 'numero', 'piso', 'bloque', 'letra'])
			.valido;
	}

	isDatosContactoValidos(data = this._formData()): boolean {
		return validarDatosPersona(this.getDatosPersona(data), ['telefonoMovil', 'email', 'privacidadAceptada']).valido;
	}

	isDatosTomadorValido(data = this._formData()): boolean {
		return validarDatosPersona(this.getDatosTomador(data), TODOS_LOS_CAMPOS_DATOS_PERSONA).valido;
	}

	isNifNieValido(value?: string): boolean {
		return esNifNieValido(value);
	}

	isEmailValido(value?: string): boolean {
		return esEmailValido(value);
	}

	normalizarTelefono(value?: string): string {
		const digitos = normalizarTelefonoMovil(value);
		return digitos ? `+${digitos}` : '';
	}

	isTelefonoValido(value?: string): boolean {
		if (!value?.trim().startsWith('+')) return false;
		const telefono = separarTelefonoE164(value);
		return esTelefonoE164Valido(telefono.prefijoTelefono, telefono.telefonoMovil);
	}

	getDatosPersona(data = this._formData()): DatosPersona {
		const telefono = this.getDatosTelefono(data);

		return {
			...DATOS_PERSONA_VACIOS,
			nif: data.nif ?? '',
			nombre: data.nombre ?? '',
			primerApellido: data.primerApellido ?? '',
			segundoApellido: data.segundoApellido ?? '',
			sexo: data.sexo ?? null,
			fechaNacimiento: data.fechaNacimiento?.trim() || getFechaNacimientoIso(data),
			fechaEmisionCarnet: data.fechaEmisionCarnet ?? '',
			direccion: data.direccion ?? '',
			numero: data.numero ?? '',
			piso: data.piso ?? '',
			bloque: data.bloque ?? '',
			letra: data.letra ?? '',
			email: data.email ?? '',
			privacidadAceptada: data.privacidadAceptada ?? false,
			...telefono
		};
	}

	getDatosTomador(data = this._formData()): DatosPersona {
		if (!data.datosTomador) return this.getDatosPersona(data);

		return {
			...DATOS_PERSONA_VACIOS,
			...data.datosTomador,
			sexo: data.datosTomador.sexo ?? null
		};
	}

	getFechaNacimiento(data = this._formData()): Date | null {
		return parseBirthDate(data);
	}

	clearAll() {
		sessionStorage.removeItem(this.STORAGE_KEY);
		sessionStorage.removeItem(this.LEGACY_DRIVER_STORAGE_KEY);
		this._formData.set({});
		this.apiService.limpiarCache();
	}

	private loadFromStorage() {
		try {
			const saved = sessionStorage.getItem(this.STORAGE_KEY);
			const legacyDriverData = sessionStorage.getItem(this.LEGACY_DRIVER_STORAGE_KEY);
			const formData = saved ? (JSON.parse(saved) as AutoInsuranceData) : {};
			const driverData = legacyDriverData ? (JSON.parse(legacyDriverData) as AutoInsuranceData) : {};
			const combinedData = { ...driverData, ...formData };
			const telefono = this.getDatosTelefono(combinedData);

			this._formData.set({
				...combinedData,
				...telefono,
				telefono: combinedData.telefono ?? combinarTelefonoE164(telefono.prefijoTelefono, telefono.telefonoMovil)
			});
			if (legacyDriverData) sessionStorage.removeItem(this.LEGACY_DRIVER_STORAGE_KEY);
		} catch (e) {
			console.error('Error recuperando sesión de datos', e);
		}
	}

	private getDatosTelefono(data: AutoInsuranceData): {
		readonly paisTelefono: string;
		readonly prefijoTelefono: string;
		readonly telefonoMovil: string;
	} {
		if (!data.telefonoMovil && data.telefono) return separarTelefonoE164(data.telefono);

		const opcionPais = PREFIJOS_TELEFONICOS.find((prefijo) => prefijo.codigoPais === data.paisTelefono);
		const opcionPrefijo = PREFIJOS_TELEFONICOS.find((prefijo) => prefijo.prefijo === data.prefijoTelefono);
		const opcion = opcionPais ?? opcionPrefijo ?? PREFIJO_TELEFONICO_ESPANA;

		return {
			paisTelefono: opcion.codigoPais,
			prefijoTelefono: opcion.prefijo,
			telefonoMovil: normalizarTelefonoMovil(data.telefonoMovil)
		};
	}
}

const TODOS_LOS_CAMPOS_DATOS_PERSONA: readonly DatosPersonaField[] = [
	'nif',
	'nombre',
	'primerApellido',
	'segundoApellido',
	'sexo',
	'fechaNacimiento',
	'fechaEmisionCarnet',
	'direccion',
	'numero',
	'piso',
	'bloque',
	'letra',
	'telefonoMovil',
	'email',
	'privacidadAceptada'
];

function getFechaNacimientoIso(data: BirthDateParts): string {
	const fecha = parseBirthDate(data);
	if (!fecha) return '';

	const year = fecha.getFullYear();
	const month = String(fecha.getMonth() + 1).padStart(2, '0');
	const day = String(fecha.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
