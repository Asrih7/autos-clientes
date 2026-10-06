import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { ApiVehiculoResponse, ApiVehiculoVersionNode } from '../dtos/busqueda-vehiculo.dto';
import { mapVersionsToCarVersions } from '../mappers/version.mapper';
import { BusquedaVehiculo } from '../models/busqueda-vehiculo.model';
import { CarVersion } from '../models/version.model';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

export interface CaracteristicasDisponiblesVersiones {
	readonly combustibles: readonly string[];
	readonly puertas: readonly string[];
	readonly plazas: readonly string[];
}

export interface FiltrosCaracteristicasVersiones {
	readonly numeroPuertas?: string | null;
	readonly numeroPlazas?: string | null;
	readonly combustible?: string | null;
}

@Injectable({
	providedIn: 'root'
})
export class P6VersionesService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);
	private readonly notifyBus = inject(NotificationBusService);
	private readonly catalogosPorModelo = new Map<string, ApiVehiculoResponse>();
	private readonly solicitudesCatalogo = new Map<string, Observable<ApiVehiculoResponse>>();

	private readonly _listadoVersiones = signal<CarVersion[]>([]);
	private readonly _errorMsg = signal<string | null>(null);
	private readonly _modeloOpciones = signal<string | null>(null);
	private readonly _catalogoOpciones = signal<ApiVehiculoResponse | null>(null);

	readonly listadoVersiones = this._listadoVersiones.asReadonly();
	readonly errorMsg = this._errorMsg.asReadonly();
	readonly caracteristicasDisponibles = computed<CaracteristicasDisponiblesVersiones | null>(() => {
		const catalogo = this._catalogoOpciones();
		return catalogo ? obtenerCaracteristicasDisponibles(catalogo) : null;
	});

	/**
	 * Obtiene el catálogo sin filtrar para limitar las opciones de P5 a las que
	 * realmente existen para el modelo elegido. P6 reutiliza esta misma respuesta.
	 */
	cargarOpcionesCaracteristicas(idModelo: string): void {
		if (!idModelo) return;

		this._modeloOpciones.set(idModelo);
		this._catalogoOpciones.set(null);
		this.obtenerCatalogoVersiones(idModelo).subscribe({
			next: (catalogo) => {
				if (this._modeloOpciones() === idModelo) this._catalogoOpciones.set(catalogo);
			},
			// P6 informará del error si el usuario avanza. Mientras tanto mantenemos
			// las listas base para no bloquear una edición ya iniciada.
			error: () => undefined
		});
	}

	obtenerVersiones(idModelo: string): void {
		this._errorMsg.set(null);

		this.obtenerCatalogoVersiones(idModelo).subscribe({
			next: (dtoData) => {
				const { numeroPuertas, numeroPlazas, combustible } = this.stateService.formData();
				const versions = mapVersionsToCarVersions(
					filtrarVersionesPorCaracteristicas(dtoData, { numeroPuertas, numeroPlazas, combustible })
				);
				this._listadoVersiones.set(versions);

				if (versions.length > 0) {
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
		this._listadoVersiones.set(mapVersionsToCarVersions(vehiculo));
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}

	private obtenerCatalogoVersiones(idModelo: string): Observable<ApiVehiculoResponse> {
		const catalogoCacheado = this.catalogosPorModelo.get(idModelo);
		if (catalogoCacheado) return of(catalogoCacheado);

		const solicitudPendiente = this.solicitudesCatalogo.get(idModelo);
		if (solicitudPendiente) return solicitudPendiente;

		const options: HttpOptions = {
			headers: {
				lineaNegocio: 'AU02',
				'id-modelo': idModelo
			}
		};
		const solicitud = this.invocarAutos<ApiVehiculoResponse>('GET', '/catalogo/versiones', options).pipe(
			tap((catalogo) => this.catalogosPorModelo.set(idModelo, catalogo)),
			finalize(() => this.solicitudesCatalogo.delete(idModelo)),
			shareReplay({ bufferSize: 1, refCount: false })
		);

		this.solicitudesCatalogo.set(idModelo, solicitud);
		return solicitud;
	}
}

export function obtenerCaracteristicasDisponibles(
	catalogo: Pick<ApiVehiculoResponse, 'versiones'>
): CaracteristicasDisponiblesVersiones {
	const combustibles = new Set<string>();
	const puertas = new Set<string>();
	const plazas = new Set<string>();

	for (const version of catalogo.versiones) {
		const combustible = normalizarCombustible(version.motorizacion.combustible);
		if (combustible) combustibles.add(combustible);

		const numeroPuertas = normalizarNumeroCaracteristica(version.caracteristicas.numeroPuertas);
		if (numeroPuertas) puertas.add(numeroPuertas);

		const numeroPlazas = normalizarNumeroCaracteristica(version.caracteristicas.numeroPlazas);
		if (numeroPlazas) plazas.add(numeroPlazas);
	}

	return {
		combustibles: ordenarCaracteristicas(combustibles, ['D', 'G', 'O']),
		puertas: ordenarCaracteristicas(puertas, ['2', '3', '4', '5']),
		plazas: ordenarCaracteristicas(plazas, ['1', '2', '3', '4', '5', '6', '7'])
	};
}

export function filtrarVersionesPorCaracteristicas(
	catalogo: ApiVehiculoResponse,
	filtros: FiltrosCaracteristicasVersiones
): ApiVehiculoResponse {
	return {
		...catalogo,
		versiones: catalogo.versiones.filter((version) => coincideConFiltros(version, filtros))
	};
}

function coincideConFiltros(version: ApiVehiculoVersionNode, filtros: FiltrosCaracteristicasVersiones): boolean {
	const puertasSeleccionadas = filtros.numeroPuertas?.trim();
	const plazasSeleccionadas = filtros.numeroPlazas?.trim();
	const combustibleSeleccionado = filtros.combustible?.trim();

	const coincidePuertas =
		!puertasSeleccionadas ||
		puertasSeleccionadas === 'N' ||
		normalizarNumeroCaracteristica(version.caracteristicas.numeroPuertas) === puertasSeleccionadas;
	const coincidePlazas =
		!plazasSeleccionadas ||
		plazasSeleccionadas === 'N' ||
		normalizarNumeroCaracteristica(version.caracteristicas.numeroPlazas) === plazasSeleccionadas;
	const coincideCombustible =
		!combustibleSeleccionado ||
		normalizarCombustible(version.motorizacion.combustible) === combustibleSeleccionado;

	return coincidePuertas && coincidePlazas && coincideCombustible;
}

function normalizarCombustible(valor: string | undefined): 'D' | 'G' | 'O' | null {
	const normalizado = valor?.trim().toLocaleUpperCase('es-ES') ?? '';
	if (!normalizado) return null;
	if (normalizado === 'D' || normalizado.startsWith('DIESEL')) return 'D';
	if (normalizado === 'G' || normalizado.startsWith('GASOLINA')) return 'G';
	return 'O';
}

function normalizarNumeroCaracteristica(valor: string | undefined): string | null {
	const numero = Number(valor?.trim());
	return Number.isInteger(numero) && numero > 0 ? String(numero) : null;
}

function ordenarCaracteristicas(valores: ReadonlySet<string>, orden: readonly string[]): readonly string[] {
	return orden.filter((valor) => valores.has(valor));
}
