export interface BusquedaVehiculo {
	versionMasContratada: number;
	codigoActividad?: string;
	versiones: VehiculoVersion[];
}

export interface VehiculoVersion {
	version: {
		id: string;
		nombre: string;
	};
	clasificacion: {
		categoriaVehiculo: string;
		tipoVehiculo: string;
		claseVehiculo: string;
	};
	marca: {
		id: string;
		nombre: string;
	};
	modelo: {
		id: string;
		nombre: string;
	};
	caracteristicas: {
		numeroPuertas: string;
		numeroPlazas: string;
		medidaNeumaticos: string;
	};
	motorizacion: {
		combustible: string;
		cilindradaCc: string;
		potenciaCv: string;
		potenciaKw: string;
		velocidadMaxima: string;
	};
	comercial: {
		precioOficial: string;
		precioVentaPublico: string;
		anioLanzamiento: number;
	};
	origen: string;
}
