import { BirthDateParts, DatosPersona } from "@mnv-autos-clientes/shared";
import { ProductoTecnicoConfiguracionDto, CombinacionComercialDto, CampoConfiguracionDto } from "../dtos/configuracion.dto";
import { CotizacionResponseDto } from "../dtos/cotizacion.dto";
import { Aseguradora } from "./aseguradora.model";
import { BusquedaVehiculo } from "./busqueda-vehiculo.model";
import { Marca } from "./marca.model";
import { Modalidad } from "./modalidades.model";
import { Modelo } from "./modelo.model";
import { CarVersion } from "./version.model";

export type DatosPersonaRol = 'tomador' | 'propietario' | 'conductorVehiculo' | 'segundoConductor';

export interface MetadataSlice {
	identificador?: number;
	tarea?: string;
	tipoFlujo?: 'MATRICULA' | 'MANUAL';
	errorTarificacion?: boolean;
	datosPersonalesActivos?: boolean;
}

export interface ConfiguracionSlice {
	productoTecnicoConfigurado?: ProductoTecnicoConfiguracionDto;
	combinacionesComerciales?: CombinacionComercialDto[];
	camposConfiguracion?: CampoConfiguracionDto[];
}

export interface VehiculoSlice {
	busqueda?: BusquedaVehiculo;
	marcaSeleccionada?: Marca;
	modeloSeleccionado?: Modelo;
	versionId?: string;
	versionSeleccionada?: CarVersion;
	anioInicioFabricacionVersion?: string;
	matricula?: string;
	mesPrimerMatricula?: string;
	anioPrimerMatricula?: string;
	fechaPrimeraMatriculacion?: string;
	anioPrimeraMatriculacion?: string;
	codigoPostalVehiculo?: string;
	detalles: {
		combustible?: string;
		numeroPuertas?: string;
		numeroPlazas?: string;
	};
}

export interface HistorialRiesgoSlice {
	tieneAseguradora?: boolean;
	aseguradoraSeleccionada?: Aseguradora;
	aniosAsegurado?: string;
	numeroSiniestros?: string;
	edadObtencionCarnet?: number;
}

export interface RolesSlice {
	datosTomador?: DatosPersona;
	datosPropietario?: DatosPersona;
	datosConductorVehiculo?: DatosPersona;
	datosSegundoConductor?: DatosPersona;
	esTomadorConductorPrincipal?: boolean;
	esTomadorPropietarioVehiculo?: boolean;
	quiereSegundoConductor?: boolean;
}

export interface ContratacionSlice {
	cotizacion?: CotizacionResponseDto;
	modalidadSeleccionada?: Modalidad;
	coberturasOpcionalesSeleccionadas?: string[];
	coberturasOpcionalesPorEscenario?: Record<string, string[]>;
	ultimosDigitosPoliza?: string;
	fechaEfectoPoliza?: string;
	titularCuentaBancaria?: string;
	iban?: string;
	metodoPago?: 'CUENTA_BANCARIA' | 'TARJETA' | 'BIZUM';
	aceptaciones: {
		privacidadContratacionAceptada?: boolean;
		informacionContractualAceptada?: boolean;
	};
}

export interface AutoInsuranceState extends BirthDateParts {
	metadata: MetadataSlice;
	configuracion: ConfiguracionSlice;
	vehiculo: VehiculoSlice;
	historialRiesgo: HistorialRiesgoSlice;
	datosFormularioActivo: DatosPersona;
	roles: RolesSlice;
	contratacion: ContratacionSlice;
}

export const INITIAL_INSURANCE_STATE: AutoInsuranceState = {
	metadata: {},
	configuracion: {},
	vehiculo: { detalles: {} },
	historialRiesgo: {},
	datosFormularioActivo: {
		nif: "",
		nombre: "",
		primerApellido: "",
		segundoApellido: "",
		sexo: null,
		fechaNacimiento: "",
		fechaEmisionCarnet: "",
		direccion: "",
		numero: "",
		piso: "",
		bloque: "",
		letra: "",
		paisTelefono: "ESP",
		prefijoTelefono: "+34",
		telefonoMovil: "",
		email: "",
		privacidadAceptada: false
	},
	roles: {},
	contratacion: { aceptaciones: {} }
};
