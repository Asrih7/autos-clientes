import { Injectable, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService, HttpOptions } from './base-api.service';
import { ApiVehiculoResponse } from '../dtos/busqueda-vehiculo.dto';
import { mapToBusquedaVehiculoDomain } from '../mappers/busqueda-vehiculo.mapper';
import { InsuranceStateService } from '../store/insurance-state.service';

export type MetodoBusqueda = 'matricula' | 'bastidor';

@Injectable({
	providedIn: 'root'
})
export class P1BusquedaService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);

	private readonly _errorMsg = signal<string | null>(null);
	
	private readonly _busquedaExitoTrigger = signal<'SUCCESS_BUSQUEDA' | null>(null);

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly busquedaExitoTrigger = this._busquedaExitoTrigger.asReadonly();

	buscarPorMatricula(metodo: MetodoBusqueda, valor: string): void {
		this._errorMsg.set(null);

		const options: HttpOptions = {
			headers: {
				lineaNegocio: 'AU02'
			},
			params: {
				[metodo]: valor
			}
		};

		this.invocarAutos<ApiVehiculoResponse>('GET', '/vehiculo/busqueda', options)
			.subscribe({
				next: (dtoData) => {
					const vehiculo = mapToBusquedaVehiculoDomain(dtoData);
					
					this.stateService.saveData({ 
						tipoFlujo: 'MATRICULA',
						vehiculo: vehiculo
					});

					this._busquedaExitoTrigger.set('SUCCESS_BUSQUEDA');
				},
				error: (err: HttpErrorResponse) => {
					console.error('Error al buscar vehículo:', err);

					if (err.status === 404) {
						this._errorMsg.set('No se ha encontrado ningún vehículo con los datos proporcionados.');
					} else {
						this._errorMsg.set('Hubo un problema al realizar la búsqueda del vehículo.');
					}
				}
			});
	}

	resetTrigger(): void {
		this._busquedaExitoTrigger.set(null);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
