import { ApiVehiculoResponse } from "../dtos/busqueda-vehiculo.dto";
import { BusquedaVehiculo } from "../models/busqueda-vehiculo.model";
import { CarVersion } from "../models/version.model";

export function mapVersionsToCarVersions(data: ApiVehiculoResponse | BusquedaVehiculo): CarVersion[] {
    return data.versiones.map((item) => ({
        marca: {
            id: item.marca.id,
            nombre: item.marca.nombre,
        },
        modelo: {
            id: item.modelo.id,
            nombre: item.modelo.nombre,
        },
        version: {
            id: item.version.id,
            nombre: item.version.nombre,
        },
        cilindradaCc: Number(item.motorizacion.cilindradaCc),
        potenciaCv: Number(item.motorizacion.potenciaCv),
        numeroPuertas: item.caracteristicas.numeroPuertas,
        anioLanzamiento: String(item.comercial.anioLanzamiento),
    }));
};