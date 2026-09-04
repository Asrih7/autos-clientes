import { ApiModeloResponse } from "../dtos/modelo.dto";
import { Modelo } from "../models/modelo.model";

export function mapToModelosDomain(apiMarcas: ApiModeloResponse[]): Modelo[] {
  return apiMarcas.map(api => ({
    id: api.codigo,
    nombre: api.descripcion
  }));
}