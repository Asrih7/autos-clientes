export interface CotizacionAgrupacionDto {
	codigo: string;
	descripcion: string;
	orden: number;
	codigoRelacion: string;
}

export interface CotizacionCoberturaBaseDto {
	codigo: string;
	descripcion: string;
	codigoRelacion: string;
}

export interface CotizacionCoberturaOpcionalDto extends CotizacionCoberturaBaseDto {
	contratada: boolean;
}

export interface DatosGeneralesCotizacionDto {
	idCotizacion: string;
	codigoCombinacion: string;
	descripcionCombinacion: string;
	codigoPeriodicidad: string;
	descripcionPerodicidad: string;
}

export interface CotizacionEscenarioDto {
	codigo: string;
	descripcion: string;
	orden: string;
	derogacion: boolean;
	primaTotal: number;
	primerRecibo: number;
	restoRecibos: number;
	franquicia: number | null;
	agrupacion: CotizacionAgrupacionDto;
	coberturasObligatorias: CotizacionCoberturaBaseDto[];
	coberturasOpcionales: CotizacionCoberturaOpcionalDto[];
}

export interface CotizacionResponseDto {
	datosCotizacion: DatosGeneralesCotizacionDto;
	escenarios: CotizacionEscenarioDto[];
}

export interface CotizacionApiResponseDto {
	body?: { salidaPrecio?: CotizacionResponseDto };
	salidaPrecio?: CotizacionResponseDto;
}

export interface CotizacionGarantiaRelacionDto {
	codigo: string;
	contratada: boolean;
	codigoRelacionEscenario: string;
}

export interface CotizacionGarantiaEscenarioDto {
	codigo: string;
	coberturasOpcionales: CotizacionGarantiaRelacionDto[];
}
