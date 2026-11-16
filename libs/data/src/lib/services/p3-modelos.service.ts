import { inject, Injectable, signal, computed } from '@angular/core';
import { BaseApiService, HttpOptions } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { ApiModeloResponse } from '../dtos/modelo.dto';
import { Modelo } from '../models/modelo.model';
import { mapToModelosDomain } from '../mappers/modelo.mapper';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { VehiculoStore } from '../store/+state/vehiculo.store';

interface ModelosDataCache {
	gridModelos: Modelo[];
	selectModelos: Modelo[];
}

@Injectable({
	providedIn: 'root'
})
export class P3ModelosService extends BaseApiService {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly notifyBus = inject(NotificationBusService);

	private readonly _errorMsg = signal<string | null>(null);
	private readonly _modelosPrincipalesGrid = signal<Modelo[]>([]);
	private readonly _modelosDesplegableUnicas = signal<Modelo[]>([]);
	private _ultimaMarcaIdCacheadla: string | null = null;

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly modelosPrincipalesGrid = this._modelosPrincipalesGrid.asReadonly();
	readonly modelosDesplegableUnicas = this._modelosDesplegableUnicas.asReadonly();

	readonly modeloSeleccionado = computed(() => this.vehiculoStore.state().modeloSeleccionado ?? null);
	readonly marcaActiva = computed(() => this.vehiculoStore.state().marcaSeleccionada ?? null);

	obtenerModelosDisponibles(): Observable<ModelosDataCache> {
		const marca = this.marcaActiva();
		if (!marca) {
			const missingBrandError = 'No se ha seleccionado ninguna marca de vehículo previa.';
			this._errorMsg.set(missingBrandError);
			return throwError(() => new Error(missingBrandError));
		}

		if (this._ultimaMarcaIdCacheadla === marca.id && this._modelosPrincipalesGrid().length > 0) {
			return of({
				gridModelos: this._modelosPrincipalesGrid(),
				selectModelos: this._modelosDesplegableUnicas()
			});
		}

		this._errorMsg.set(null);

		const options: HttpOptions = {
			headers: { marca: marca.id },
			params: { lineaNegocio: 'AU02' }
		};

		return this.invocarAutos<ApiModeloResponse[]>('GET', '/catalogo/modelos', options).pipe(
			map((apiModelos) => {
				const primeros15Dto = apiModelos.slice(0, 15);
				return {
					gridModelos: mapToModelosDomain(primeros15Dto),
					selectModelos: mapToModelosDomain(apiModelos)
				};
			}),
			tap(({ gridModelos, selectModelos }) => {
				this._ultimaMarcaIdCacheadla = marca.id;
				this._modelosPrincipalesGrid.set(gridModelos);
				this._modelosDesplegableUnicas.set(selectModelos);
			}),
			catchError((err) => {
				this.manejarErrorCarga(err);
				return throwError(() => err);
			})
		);
	}

	seleccionarModelo(modelo: Modelo): void {
		this.vehiculoStore.confirmarModeloSeleccionado(modelo);
	}

	private manejarErrorCarga(err: HttpErrorResponse): void {
		console.error('Error cargando modelos:', err);
		const translationPath = 'tarificacion.step3.notification_messages.generic_error';
		this._errorMsg.set(translationPath);
		this.notifyBus.emit(translationPath, 'error', undefined, true);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
