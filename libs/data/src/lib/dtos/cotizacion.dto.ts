export interface CotizacionRequestDto {
	identificadorEmision: string;
	mediador: { codigo: string };
	tomador: Record<string, string>;
	contrato: Record<string, string>;
	negociacion: Record<string, string>;
	otrosDatos: { idioma: string; firmaElectronica: boolean; preCotizado: boolean };
	riesgoAutos: { vehiculos: unknown[]; conductores: unknown[]; propietario: Record<string, string>; siniestralidad: Record<string, string> };
	garantias: { escenarioSeleccionado: string; datosGarantiaAutos: Record<string, number>; escenarios: CotizacionGarantiaEscenarioDto[] };
}

export interface CotizacionGarantiaEscenarioDto {
	codigo: string;
	coberturasOpcionales: Array<{ codigo: string; contratada: boolean; codigoRelacionEscenario: string }>;
}

export interface CotizacionResponseDto {
	datosCotizacion: { idCotizacion: string; codigoCombinacion: string; descripcionCombinacion: string; codigoPeriodicidad: string; descripcionPerodicidad: string };
	escenarios: CotizacionEscenarioDto[];
}

export interface CotizacionEscenarioDto {
	codigo: string; descripcion: string; orden: string; derogacion: boolean; primaTotal: number; primerRecibo: number; restoRecibos: number; franquicia: number | null;
	agrupacion: { codigo: string; descripcion: string; orden: number; codigoRelacion: string };
	coberturasObligatorias: Array<{ codigo: string; descripcion: string; codigoRelacion: string }>;
	coberturasOpcionales: Array<{ codigo: string; descripcion: string; contratada: boolean; codigoRelacion: string }>;
}

export interface CotizacionApiResponseDto { body?: { salidaPrecio?: CotizacionResponseDto }; salidaPrecio?: CotizacionResponseDto; }
