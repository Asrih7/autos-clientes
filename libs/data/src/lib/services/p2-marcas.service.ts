import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { asyncScheduler, map, observeOn, Observable, tap, of, throwError, catchError } from 'rxjs';
import { ApiMarcaResponse } from '../dtos/marca.dto';
import { mapToMarcasDomain } from '../mappers/marca.mapper';
import { Marca } from '../models/marca.model';
import { BaseApiService, HttpOptions } from './base-api.service';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { VehiculoStore } from '../store/+state/vehiculo.store';

const MARCAS_PRINCIPALES: string[] = [
	'AUDI',
	'BMW',
	'CITROEN',
	'FIAT',
	'FORD',
	'HYUNDAI',
	'KIA',
	'MERCEDES',
	'NISSAN',
	'OPEL',
	'PEUGEOT',
	'RENAULT',
	'SEAT',
	'TOYOTA',
	'VOLKSWAGEN'
];

interface MarcasDataCache {
	marcasGrid: Marca[];
	marcasSelect: Marca[];
}

@Injectable({
	providedIn: 'root'
})
export class P2MarcasService extends BaseApiService {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly notifyBus = inject(NotificationBusService);

	private readonly _errorMsg = signal<string | null>(null);
	private readonly _marcasPrincipalesGrid = signal<Marca[]>([]);
	private readonly _marcasDesplegableUnicas = signal<Marca[]>([]);

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly marcasPrincipalesGrid = this._marcasPrincipalesGrid.asReadonly();
	readonly marcasDesplegableUnicas = this._marcasDesplegableUnicas.asReadonly();

	readonly marcaSeleccionada = computed(() => this.vehiculoStore.state().marcaSeleccionada);

	obtenerMarcasDisponibles(tipoVehiculo?: number): Observable<MarcasDataCache> {
		if (this._marcasPrincipalesGrid().length > 0 && this._marcasDesplegableUnicas().length > 0) {
			return of({
				marcasGrid: this._marcasPrincipalesGrid(),
				marcasSelect: this._marcasDesplegableUnicas()
			});
		}

		this._errorMsg.set(null);

		const options: HttpOptions = {
			headers: { lineaNegocio: 'AU02' },
			params: { tipoVehiculo }
		};

		return this.invocarAutos<ApiMarcaResponse[]>('GET', '/catalogo/marcas', options).pipe(
			observeOn(asyncScheduler),
			map((apiMarcas) => {
				const codigosVistos = new Set<string>();
				const unicasDto = apiMarcas.filter(
					(marca) => !codigosVistos.has(marca.codigo) && codigosVistos.add(marca.codigo)
				);

				const principalesDto = unicasDto.filter((marca) => MARCAS_PRINCIPALES.includes(marca.descripcion));

				return {
					marcasGrid: mapToMarcasDomain(principalesDto),
					marcasSelect: mapToMarcasDomain(unicasDto).sort((a, b) =>
						a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' })
					)
				};
			}),
			tap(({ marcasGrid, marcasSelect }) => {
				this._marcasPrincipalesGrid.set(marcasGrid);
				queueMicrotask(() => {
					this._marcasDesplegableUnicas.set(marcasSelect);
				});
			}),
			catchError((err) => {
				this.manejarErrorCarga(err);
				return throwError(() => err);
			})
		);
	}

	seleccionarMarca(marca: Marca): void {
		this.vehiculoStore.confirmarMarcaSeleccionada(marca);
	}

	private manejarErrorCarga(err: HttpErrorResponse): void {
		console.error('Error cargando marcas:', err);
		const translationPath = 'tarificacion.step2.notification_messages.generic_error';
		this._errorMsg.set(translationPath);
		this.notifyBus.emit(translationPath, 'error', undefined, true);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
