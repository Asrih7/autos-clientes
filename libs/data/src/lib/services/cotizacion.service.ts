import { inject, Injectable } from '@angular/core';
import { defer, map, Observable, tap } from 'rxjs';
import { CotizacionApiResponseDto, CotizacionRequestDto, CotizacionResponseDto } from '../dtos/cotizacion.dto';
import { mapToCotizacionRequest } from '../mappers/cotizacion.mapper';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class CotizacionService extends BaseApiService {
	private readonly state = inject(InsuranceStateService);
	cotizar(): Observable<CotizacionResponseDto> {
		return defer(() => {
			const body: CotizacionRequestDto = mapToCotizacionRequest(this.state.formData());
			return this.invocarAutos<CotizacionApiResponseDto>('POST', 'emision/cotizar', { body }).pipe(
				map((response) => response.body?.salidaPrecio ?? response.salidaPrecio ?? response as CotizacionResponseDto),
				tap((cotizacion) => this.state.saveData({ cotizacion }))
			);
		});
	}
}
