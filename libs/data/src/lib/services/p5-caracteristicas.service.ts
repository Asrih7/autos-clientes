import { inject, Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, shareReplay, finalize } from 'rxjs/operators';
import { ApiVehiculoResponse } from '../dtos/busqueda-vehiculo.dto';
import { BaseApiService, HttpOptions } from './base-api.service';
import { CaracteristicasDisponiblesVersiones, obtenerCaracteristicasDisponibles } from './p6-versiones.service';
import { VehiculoStore } from '../store/+state/vehiculo.store';

@Injectable({
	providedIn: 'root'
})
export class P5CaracteristicasService extends BaseApiService {
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly catalogosPorModelo = new Map<string, ApiVehiculoResponse>();
	private readonly solicitudesCatalogo = new Map<string, Observable<ApiVehiculoResponse>>();

	private readonly _modeloOpciones = signal<string | null>(null);
	private readonly _catalogoOpciones = signal<ApiVehiculoResponse | null>(null);

	readonly vehiculoSlices = this.vehiculoStore.state;
	readonly detallesSeleccionados = computed(() => this.vehiculoStore.state().detalles);

	readonly caracteristicasDisponibles = computed<CaracteristicasDisponiblesVersiones | null>(() => {
		const catalogo = this._catalogoOpciones();
		return catalogo ? obtenerCaracteristicasDisponibles(catalogo) : null;
	});

	cargarOpcionesCaracteristicas(idModelo: string): void {
		if (!idModelo) return;
		if (this._modeloOpciones() === idModelo && this._catalogoOpciones()) return;

		this._modeloOpciones.set(idModelo);
		this._catalogoOpciones.set(null);
		this.obtenerCatalogoVersiones(idModelo).subscribe({
			next: (catalogo) => {
				if (this._modeloOpciones() === idModelo) this._catalogoOpciones.set(catalogo);
			},
			error: () => undefined
		});
	}

	guardarCaracteristicas(combustible?: string | null, puertas?: string | null, plazas?: string | null): void {
		this.vehiculoStore.guardarDetallesVehiculo(combustible, puertas, plazas);
	}

	private obtenerCatalogoVersiones(idModelo: string): Observable<ApiVehiculoResponse> {
		const catalogoCacheado = this.catalogosPorModelo.get(idModelo);
		if (catalogoCacheado) return of(catalogoCacheado);

		const solicitudPendiente = this.solicitudesCatalogo.get(idModelo);
		if (solicitudPendiente) return solicitudPendiente;

		const options: HttpOptions = { headers: { lineaNegocio: 'AU02', 'id-modelo': idModelo } };
		const solicitud = this.invocarAutos<ApiVehiculoResponse>('GET', '/catalogo/versiones', options).pipe(
			tap((catalogo) => this.catalogosPorModelo.set(idModelo, catalogo)),
			finalize(() => this.solicitudesCatalogo.delete(idModelo)),
			shareReplay({ bufferSize: 1, refCount: false })
		);

		this.solicitudesCatalogo.set(idModelo, solicitud);
		return solicitud;
	}
}
