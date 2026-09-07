import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { ApiAseguradoraResponse } from '../dtos/aseguradora.dto';
import { mapToAseguradorasDomain } from '../mappers/aseguradora.mapper';
import { Aseguradora } from '../models/aseguradora.model';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class P11AseguradorasService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);
	private readonly _errorMsg = signal<string | null>(null);
	private readonly _aseguradoras = signal<Aseguradora[]>([]);

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly aseguradoras = this._aseguradoras.asReadonly();
	readonly aseguradoraSeleccionada = computed(() => this.stateService.formData().aseguradoraSeleccionada ?? null);

	cargarAseguradoras(): void {
		if (this._aseguradoras().length > 0) return;

		this._errorMsg.set(null);
		const options: HttpOptions = { headers: { lineaNegocio: 'AU02' } };

		this.invocarAutos<ApiAseguradoraResponse[]>('GET', 'catalogo/compania-aseguradoras', options)
			.pipe(
				map((aseguradoras) => {
					const codes = new Set<string>();
					return aseguradoras.filter((aseguradora) => !codes.has(aseguradora.codigo) && codes.add(aseguradora.codigo));
				}),
				map(mapToAseguradorasDomain)
			)
			.subscribe({
				next: (aseguradoras) => this._aseguradoras.set(aseguradoras),
				error: (error: HttpErrorResponse) => {
					console.error('Error cargando aseguradoras:', error);
					this._errorMsg.set('Hubo un problema al recuperar el listado de aseguradoras.');
				}
			});
	}

	seleccionarAseguradora(aseguradora: Aseguradora): void {
		this.stateService.saveData({ aseguradoraSeleccionada: aseguradora });
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
