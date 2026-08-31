import { computed, inject, Injectable, signal } from '@angular/core';
import { BaseApiService, HttpOptions } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiModeloResponse } from '../dtos/modelo.dto';
import { InsuranceStateService } from '../store/insurance-state.service';
import { Modelo } from '../models/modelo.model';
import { mapToModelosDomain } from '../mappers/modelo.mapper';

@Injectable({
	providedIn: 'root'
})
export class P3ModelosService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);

	private readonly _errorMsg = signal<string | null>(null);
	private readonly _modelosExitoTrigger = signal<'SUCCESS_MODELO' | null>(null);

	private readonly _modelosPrincipalesGrid = signal<Modelo[]>([]);
	private readonly _modelosDesplegableUnicas = signal<Modelo[]>([]);

	private _ultimaMarcaIdCacheadla: string | null = null;

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly modelosExitoTrigger = this._modelosExitoTrigger.asReadonly();
	readonly modelosPrincipalesGrid = this._modelosPrincipalesGrid.asReadonly();
	readonly modelosDesplegableUnicas = this._modelosDesplegableUnicas.asReadonly();

	readonly modeloSeleccionado = computed(() => this.stateService.formData()?.modeloSeleccionado ?? null);
	readonly marcaActiva = computed(() => this.stateService.formData()?.marcaSeleccionada ?? null);

	cargarModelos(): void {
		const marca = this.marcaActiva();
		if (!marca) {
			this._errorMsg.set('No se ha seleccionado ninguna marca de vehículo previa.');
			return;
		}

		if (this._ultimaMarcaIdCacheadla === marca.id && this._modelosPrincipalesGrid().length > 0) {
			console.log('Modelos recuperados de la caché para la marca:', marca.nombre);
			return;
		}

		this._errorMsg.set(null);

		const options: HttpOptions = {
			headers: { marca: marca.id },
			params: { lineaNegocio: 'AU02' }
		};

		this.invocarAutos<ApiModeloResponse[]>('GET', '/catalogo/modelos', options)
			.pipe(
				map((apiModelos: ApiModeloResponse[]) => {
					const primeros15Dto = apiModelos.slice(0, 15);

					return { primeros15Dto, apiModelos };
				}),
				map(({ primeros15Dto, apiModelos }) => ({
					gridModelos: mapToModelosDomain(primeros15Dto),
					selectModelos: mapToModelosDomain(apiModelos)
				}))
			)
			.subscribe({
				next: ({ gridModelos, selectModelos }) => {
					this._ultimaMarcaIdCacheadla = marca.id;

					this._modelosPrincipalesGrid.set(gridModelos);

					this._modelosDesplegableUnicas.set(selectModelos);
				},
				error: (err: HttpErrorResponse) => {
					console.error('Error cargando modelos:', err);
					this._errorMsg.set('Hubo un problema al recuperar el listado de modelos.');
				}
			});
	}

	seleccionarModelo(modelo: Modelo): void {
		this.stateService.saveData({ modeloSeleccionado: modelo });
		this._modelosExitoTrigger.set('SUCCESS_MODELO');
	}

	resetTrigger(): void {
		this._modelosExitoTrigger.set(null);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
