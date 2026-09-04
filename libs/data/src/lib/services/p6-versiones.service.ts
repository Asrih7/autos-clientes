import { Injectable, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService, HttpOptions } from './base-api.service';
import { mapVersionsToCarVersions } from '../mappers/version.mapper';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { CarVersion } from '../models/version.model';
import { ApiVehiculoResponse } from '../dtos/busqueda-vehiculo.dto';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';

@Injectable({
    providedIn: 'root'
})
export class P6VersionesService extends BaseApiService {
    private readonly stateService = inject(InsuranceStateService);
    private readonly notifyBus = inject(NotificationBusService);

    private readonly _listadoVersiones = signal<CarVersion[]>([]);
    private readonly _errorMsg = signal<string | null>(null);

    readonly listadoVersiones = this._listadoVersiones.asReadonly();
    readonly errorMsg = this._errorMsg.asReadonly();

    obtenerVersiones(idModelo: string): void {
        this._errorMsg.set(null);

        const options: HttpOptions = {
            headers: {
                'lineaNegocio': 'AU02',
                'id-modelo': idModelo
            }
        };

        this.invocarAutos<ApiVehiculoResponse>('GET', '/catalogo/versiones', options).subscribe({
            next: (dtoData) => {
                const {
                    numeroPuertas,
                    numeroPlazas,
                    combustible
                } = this.stateService.formData();

                const dtoFiltrado = this.aplicarFiltrosIniciales(
                    dtoData,
                    {
                        numeroPuertas,
                        numeroPlazas,
                        combustible
                    }
                );

                const versions = mapVersionsToCarVersions(dtoFiltrado);
                this._listadoVersiones.set(versions);

                if(versions.length > 0) {
                    this.notifyBus.emit('tarificacion.step6.notification_messages.200_success', 'success', 3000, true);
                } else {
                    this.notifyBus.emit('tarificacion.step6.notification_messages.404_not_found', 'error', undefined, true);
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error('Error al buscar versiones:', err);

                const translationPath =
                    err.status === 404
                        ? 'tarificacion.step6.notification_messages.404_not_found'
                        : 'tarificacion.step6.notification_messages.generic_error';

                this._errorMsg.set(translationPath);
                this.notifyBus.emit(translationPath, 'error', undefined, true);
            }
        });
    }

    cargarVersiones(): void {
        const vehiculo = this.stateService.formData()?.vehiculo as BusquedaVehiculo;
        const versions = mapVersionsToCarVersions(vehiculo);
        this._listadoVersiones.set(versions);
    }

    limpiarErrores(): void {
        this._errorMsg.set(null);
    }

    private aplicarFiltrosIniciales(
        dto: ApiVehiculoResponse,
        filtros: {
            numeroPuertas?: string | null;
            numeroPlazas?: string | null;
            combustible?: string | null;
        }
    ): ApiVehiculoResponse {
        return {
            ...dto,
            versiones: dto.versiones.filter(version => {
                const coincidePuertas =
                    !filtros.numeroPuertas ||
                    filtros.numeroPuertas === 'N' ||
                    version.caracteristicas.numeroPuertas === filtros.numeroPuertas;

                const coincideAsientos =
                    !filtros.numeroPlazas ||
                    filtros.numeroPlazas === 'N' ||
                    version.caracteristicas.numeroPlazas === filtros.numeroPlazas;

                const coincideCombustible =
                    !filtros.combustible ||
                    filtros.combustible === 'O' ||
                    version.motorizacion.combustible === filtros.combustible;

                return (
                    coincidePuertas &&
                    coincideAsientos &&
                    coincideCombustible
                );
            })
        };
    }
}
