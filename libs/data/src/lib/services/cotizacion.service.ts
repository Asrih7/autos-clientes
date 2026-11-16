import { inject, Injectable } from '@angular/core';
import { defer, map, Observable, shareReplay, tap } from 'rxjs';
import { CotizacionApiResponseDto, CotizacionResponseDto } from '../dtos/cotizacion.dto';
import { CorePersistenceStore } from '../store/+state/core-persistence.store';
import { ContratacionStore } from '../store/+state/contratacion.store';
import { BaseApiService } from './base-api.service';
import { mapToCotizacionRequest } from '../mappers/gestion-proyecto-engine/gestion-proyecto.mapper';
import { GestionProyectoRequestDto } from '../dtos/gestion-proyecto-request.dto';

@Injectable({ providedIn: 'root' })
export class CotizacionService extends BaseApiService {
	private readonly coreStore = inject(CorePersistenceStore);
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly cache = new Map<string, Observable<CotizacionResponseDto>>();

	cotizar(): Observable<CotizacionResponseDto> {
		return defer(() => {
			const body: GestionProyectoRequestDto = mapToCotizacionRequest(this.coreStore.globalSnapshot());
			const cacheKey = JSON.stringify(body);

			if (this.cache.has(cacheKey)) {
				return this.cache.get(cacheKey)!;
			}

			const request$ = this.invocarAutos<CotizacionApiResponseDto>('POST', 'emision/cotizar', { body }).pipe(
				map((response) => response.body?.salidaPrecio ?? response.salidaPrecio ?? (response as CotizacionResponseDto)),
				tap((cotizacion) => this.contratacionStore.guardarCotizacionResponse(cotizacion)),
				shareReplay(1)
			);

			this.cache.set(cacheKey, request$);
			return request$;
		});
	}

	clearCache(): void {
		this.cache.clear();
	}
}
