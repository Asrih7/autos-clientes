export interface PeriodoCobro {
	codigo: string;
	descripcion: string;
}

export interface OpcionGarantiaOcupantes {
	valor: string;
	orden: string;
}

export interface GarantiaOcupantes {
	numeroPlazasAseguradas: OpcionGarantiaOcupantes[];
	capitalesFallecimiento: OpcionGarantiaOcupantes[];
	capitalesInvalidez: OpcionGarantiaOcupantes[];
}

export interface GarantiaOcupantesRequest {
	lineaNegocio: string;
	combinacionComercial: string;
	codigoMediador: string;
	tipoVehiculo: string;
	codigoCompania: string;
}
