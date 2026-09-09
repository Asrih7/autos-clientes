export interface Cobertura {
	codigo: string;
	descripcion: string;
	codigoRelacion: string;
	contratada?: boolean;
}

export interface AgrupacionModalidad {
	codigo: string;
	descripcion: string;
	codigoRelacion: string;
}

export interface Modalidad {
	codigo: string;
	descripcion: string;
	orden: string;
	agrupacion: AgrupacionModalidad;
	primaTotal: number;
	primerRecibo: number;
	restoRecibos: number;
	franquicia: number | null;
	coberturasIncluidas: Cobertura[];
	coberturasOpcionales: Cobertura[];
	derogacion: boolean;
}

export interface GrupoModalidades {
	codigo: string;
	descripcion: string;
	modalidades: Modalidad[];
	esTodoRiesgo: boolean;
}
