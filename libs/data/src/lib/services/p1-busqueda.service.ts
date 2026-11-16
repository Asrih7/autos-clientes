import { Injectable, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseApiService, HttpOptions } from './base-api.service';
import { ApiVehiculoResponse } from '../dtos/busqueda-vehiculo.dto';
import { mapToBusquedaVehiculoDomain } from '../mappers/busqueda-vehiculo.mapper';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { ValidacionMatriculaResponse } from '../dtos/validacion-vehiculo.dto';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';
import { VehiculoStore } from '../store/+state/vehiculo.store';

export type MetodoBusqueda = 'matricula' | 'bastidor';

@Injectable({
	providedIn: 'root'
})
export class P1BusquedaService extends BaseApiService {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly notifyBus = inject(NotificationBusService);

	private readonly _errorMsg = signal<string | null>(null);
	readonly errorMsg = this._errorMsg.asReadonly();

	buscarVehiculo(metodo: MetodoBusqueda, valor: string): Observable<BusquedaVehiculo> {
		this._errorMsg.set(null);
		const formattedValue = valor.trim().toUpperCase();

		const validacionStream$: Observable<string> =
			metodo === 'matricula'
				? this.validarMatricula(formattedValue).pipe(
						switchMap((res) => {
							if (res.valida === false) {
								const validationErrorKey = 'tarificacion.step1.notification_messages.invalid_plate';
								this._errorMsg.set(validationErrorKey);
								this.notifyBus.emit(validationErrorKey, 'error', undefined, true);
								return throwError(() => new Error('Matrícula no válida'));
							}
							return of(res.matriculaNormalizada || formattedValue);
						}),
						catchError((err) => {
							if (!(err instanceof Error)) {
								this.notifyBus.emit('tarificacion.step1.notification_messages.validation_error', 'error', undefined, true);
							}
							return throwError(() => err);
						})
				  )
				: of(valor);

		return validacionStream$.pipe(
			switchMap((valorNormalizado) => {
				if (metodo === 'matricula') {
					this.vehiculoStore.guardarMatriculaProcesada(valorNormalizado);
				}

				const options: HttpOptions = {
					headers: { lineaNegocio: 'AU02' },
					params: { [metodo]: valorNormalizado }
				};

				return this.invocarAutos<ApiVehiculoResponse>('GET', '/vehiculo/busqueda', options).pipe(
					map((dtoData) => ({ vehiculo: mapToBusquedaVehiculoDomain(dtoData), valorNormalizado }))
				);
			}),
			tap(({ vehiculo, valorNormalizado }) => {
				this.vehiculoStore.confirmarVehiculoMatriculado(
					vehiculo, 
					metodo === 'matricula' ? valorNormalizado : undefined
				);

				this.notifyBus.emit('tarificacion.step1.notification_messages.success_200', 'success', 3000, true);
			}),
			map(({ vehiculo }) => vehiculo),
			catchError((err) => {
				this.manejarErrorHttp(err);
				return throwError(() => err);
			})
		);
	}

	validarMatricula(matricula: string): Observable<ValidacionMatriculaResponse> {
		return this.invocarAutos<ValidacionMatriculaResponse>('GET', '/vehiculo/validar-matricula', {
			headers: { matricula },
			params: { codigoPais: 'ES', matriculaPersonalizada: '' }
		});
	}

	private manejarErrorHttp(err: any): void {
		if (err instanceof HttpErrorResponse) {
			console.error('Error al buscar vehículo:', err);
			const translationPath =
				err.status === 404
					? 'tarificacion.step1.notification_messages.not_found_404'
					: 'tarificacion.step1.notification_messages.generic_error';

			this._errorMsg.set(translationPath);
			this.notifyBus.emit(translationPath, 'error', undefined, true);
		}
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
