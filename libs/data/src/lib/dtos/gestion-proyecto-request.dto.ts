// Base interface containing ONLY the elements shared by all 3 endpoints
export interface GestionProyectoRequestDto {
	identificadorEmision: string;
	mediador: MediadorContratacion;
	tomador: TomadorContratacion;
	contrato: ContratoContratacion;
	negociacion: NegociacionContratacion;
	otrosDatos: OtrosDatosContratacion;
	riesgoAutos: RiesgoAutosContratacion;
	garantias: GarantiasContratacion;
}

// 1. Contratar: Extends base and strictly adds the mandatory 'pago'
export interface ContratarRequestDto extends GestionProyectoRequestDto {
	pago: PagoContratacion;
}

// 2. Derogaciones: Extends base and strictly adds the mandatory 'derogacion'
export interface DerogacionRequestDto extends GestionProyectoRequestDto {
	derogacion: {
		argumentacionComercial: string;
	};
}

// 3. Guardar Proyecto: Is structural identity itself with the base elements
// export interface GuardarProyectoRequestDto extends GestionProyectoRequestDto {

// }

export interface MediadorContratacion {
	codigo: string;
}

export interface ContratoContratacion {
	productoTecnico: string;
	cicloRenovacion: string;
	efectoPoliza: string;
	vencimientoPoliza: string;
	fechaTarifaMasCampoForzar: string;
}

export interface NegociacionContratacion {
	combinacionComercial: string;
	periodicidadPago: string;
	recargoFraccionamiento: string;
	descuento: string;
	recargo: string;
	autorizadorDescuento: string;
}

export interface OtrosDatosContratacion {
	idioma: string;
	firmaElectronica: boolean;
	preCotizado: boolean;
}

export interface RiesgoAutosContratacion {
	vehiculo: VehiculoContratacion;
	conductores: ConductorContratacion[];
	propietario: PropietarioContratacion;
	siniestralidad: SiniestralidadContratacion;
}

export interface VehiculoContratacion {
	matricula: string;
	isMatriculaPersonalizada: boolean;
	matriculaPersonalizada: string;
	bastidor: string;
	fechaMatriculacion: string;
	codigoBase7: string;
	remolque: string;
	codigoPostal: string;
	codigoUso: string;
	carroceria: string;
	accesorios: AccesorioContratacion[];
}

export interface AccesorioContratacion {
	idAccesorio: string;
	descripcion: string;
	tipoAccesorio: string;
	importe: string;
	isMusical: string;
}

export interface PersonaContratacion {
	nombre: string;
	apellido1: string;
	apellido2: string;
	razonSocial?: string;
	sexo: string;
	codigoTipoVia: string;
	nombreVia: string;
	domicilio: string;
	codigoPostal: string;
	localidad: string;
	codigoProvincia: string;
	telefonoMovil?: string;
	email?: string;
}

export interface TomadorContratacion extends PersonaContratacion {
	tipoIdentificador: string;
	identificador: string;
	pais: string;
	fechNaci: string;
}

export interface ConductorContratacion extends PersonaContratacion {
	tipoIdentificador: string;
	identificador: string;
	pais: string;
	tipoCarne: string;
	fechaNacimiento: string;
	fechaCarne: string;
	mismoQueTomador: boolean;
	conductorHabitual: boolean;
}

export interface PropietarioContratacion extends PersonaContratacion {
	tipoIdentificador: string;
	identificador: string;
	pais: string;
	fechaNacimiento: string;
	fechaCarne: string;
}

export interface SiniestralidadContratacion {
	opcion: string;
	codigoCompania: string;
	polizaCompania: string;
	porcentajeRcManual: string;
	porcentajeDaniosManual: string;
	aniosCompaniaAnterior: string;
	numeroSiniestros: string;
}

export interface GarantiasContratacion {
	escenarioSeleccionado: string;
	datosGarantiaAutos: DatosGarantiaAutos;
	escenarios: EscenarioContratacion[];
}

export interface DatosGarantiaAutos {
	capitalInvalidez: number;
	capitalFallecimiento: number;
	numeroPlazasAseguradas: number;
}

export interface EscenarioContratacion {
	codigo: string;
	coberturasOpcionales: CoberturaOpcionalContratacion[];
}

export interface CoberturaOpcionalContratacion {
	codigo: string;
	contratada: boolean;
	codigoRelacionEscenario: string;
}

export interface PagoContratacion {
	codigoMedioPago: string;
	numeroCuenta: string;
}
