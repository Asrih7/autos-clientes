export interface ApiVehiculoResponse {
  readonly versionMasContratada: number;
  readonly codigoActividad?: string;
  readonly versiones: ApiVehiculoVersionNode[];
}

export interface ApiVehiculoVersionNode {
  readonly version: {
    readonly id: string;
    readonly nombre: string;
  };
  readonly clasificacion: {
    readonly categoriaVehiculo: string;
    readonly tipoVehiculo: string;
    readonly claseVehiculo: string;
  };
  readonly marca: {
    readonly id: string;
    readonly nombre: string;
  };
  readonly modelo: {
    readonly id: string;
    readonly nombre: string;
  };
  readonly caracteristicas: {
    readonly numeroPuertas: string;
    readonly numeroPlazas: string;
    readonly medidaNeumaticos: string;
  };
  readonly motorizacion: {
    readonly combustible: string;
    readonly cilindradaCc: string;
    readonly potenciaCv: string;
    readonly potenciaKw: string;
    readonly velocidadMaxima: string;
  };
  readonly comercial: {
    readonly precioOficial: string;
    readonly precioVentaPublico: string;
    readonly anioLanzamiento: number;
  };
  readonly origen: string;
}
