import { ApiVehiculoResponse } from "../dtos/busqueda-vehiculo.dto";
import { BusquedaVehiculo } from "../models/busqueda-vehiculo.model";

export function mapToBusquedaVehiculoDomain(apiBusquedaVehiculo: ApiVehiculoResponse): BusquedaVehiculo {
  return apiBusquedaVehiculo;
}