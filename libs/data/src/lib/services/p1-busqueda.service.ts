import { Injectable, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService, HttpOptions } from './base-api.service';
import { ApiVehiculoResponse } from '../dtos/busqueda-vehiculo.dto';
import { mapToBusquedaVehiculoDomain } from '../mappers/busqueda-vehiculo.mapper';
import { InsuranceStateService } from '../store/insurance-state.service';
import { NotificationBusService } from '@mnv-autos-clientes/shared';

export type MetodoBusqueda = 'matricula' | 'bastidor';

@Injectable({
	providedIn: 'root'
})
export class P1BusquedaService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);
	private readonly notifyBus = inject(NotificationBusService);

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

		this.invocarAutos<ApiVehiculoResponse>('GET', '/vehiculo/busqueda', options).subscribe({
			next: (dtoData) => {
				const vehiculo = mapToBusquedaVehiculoDomain(dtoData);

				this.stateService.saveData({
					tipoFlujo: 'MATRICULA',
					vehiculo: vehiculo
				});

				this._busquedaExitoTrigger.set('SUCCESS_BUSQUEDA');
				this.notifyBus.emit('tarificacion.step1.notification_messages.success_200', 'success', 3000, true);
			},
			error: (err: HttpErrorResponse) => {
				console.error('Error al buscar vehículo:', err);

				const translationPath =
					err.status === 404
						? 'tarificacion.step1.notification_messages.not_found_404'
						: 'tarificacion.step1.notification_messages.generic_error';

				this._errorMsg.set(translationPath);
				// Se lee de manera natural: emitir(rutaClave, tipoSeveridad, duracion, esClaveDeTraduccion)
				this.notifyBus.emit(translationPath, 'error', undefined, true);
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
