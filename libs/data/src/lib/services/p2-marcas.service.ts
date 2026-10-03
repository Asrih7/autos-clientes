import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { asyncScheduler, map, observeOn } from 'rxjs';
import { ApiMarcaResponse } from '../dtos/marca.dto';
import { mapToMarcasDomain } from '../mappers/marca.mapper';
import { Marca } from '../models/marca.model';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';
import { NotificationBusService } from '@mnv-autos-clientes/shared';

const MARCAS_PRINCIPALES: string[] = [
	'AUDI', 'BMW', 'CITROEN', 'FIAT', 'FORD', 'HYUNDAI', 'KIA', 'MERCEDES', 'NISSAN', 'OPEL', 'PEUGEOT', 'RENAULT', 'SEAT', 'TOYOTA', 'VOLKSWAGEN'
];

@Injectable({
	providedIn: 'root'
})
export class P2MarcasService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);
	private readonly notifyBus = inject(NotificationBusService);

	private readonly _errorMsg = signal<string | null>(null);
	private readonly _marcasExitoTrigger = signal<string | null>(null);
	private readonly _marcasPrincipalesGrid = signal<Marca[]>([]);
	private readonly _marcasDesplegableUnicas = signal<Marca[]>([]);

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly marcasExitoTrigger = this._marcasExitoTrigger.asReadonly();
	readonly marcasPrincipalesGrid = this._marcasPrincipalesGrid.asReadonly();
	readonly marcasDesplegableUnicas = this._marcasDesplegableUnicas.asReadonly();

	readonly marcaSeleccionada = computed(() => this.stateService.formData()?.marcaSeleccionada);

cargarMarcas(tipoVehiculo?: number): void {
	if (this._marcasPrincipalesGrid().length > 0 && this._marcasDesplegableUnicas().length > 0) {
		console.log('Marcas recuperadas de la caché local del servicio.');
		return;
	}
	
	this._errorMsg.set(null);

	const options: HttpOptions = {
		headers: { lineaNegocio: 'AU02' },
		params: { tipoVehiculo }
	};

	this.invocarAutos<ApiMarcaResponse[]>('GET', '/catalogo/marcas', options)
		.pipe(
			observeOn(asyncScheduler),
			map((apiMarcas: ApiMarcaResponse[]) => {
				//1. Elimina duplicados
				const codigosVistos = new Set<string>();
				const unicasDto = apiMarcas.filter(
					(marca) => !codigosVistos.has(marca.codigo) && codigosVistos.add(marca.codigo)
				);

				//2. Filtra las 15 marcas que aparecen en el grid
				const principalesDto = unicasDto.filter((marca) => MARCAS_PRINCIPALES.includes(marca.descripcion));

				return { principalesDto, unicasDto };
			}),
			map(({ principalesDto, unicasDto }) => ({
				//3. Mapea cada lista y ordena alfabéticamente las que van en el desplegable
				marcasGrid: mapToMarcasDomain(principalesDto),
				marcasSelect: mapToMarcasDomain(unicasDto).sort((a, b) => 
					a.nombre.localeCompare(b.nombre, undefined, { sensitivity: 'base' })
				)
			}))
		)
		.subscribe({
			next: ({ marcasGrid, marcasSelect }) => {
				this._marcasPrincipalesGrid.set(marcasGrid);
				
				queueMicrotask(() => {
					this._marcasDesplegableUnicas.set(marcasSelect);
				});
			},
			error: (err: HttpErrorResponse) => {
				console.error('Error cargando marcas:', err);
				const translationPath = 'tarificacion.step2.notification_messages.generic_error';
				this._errorMsg.set(translationPath);
				this.notifyBus.emit(translationPath, 'error', undefined, true);
			}
		});
}

	seleccionarMarca(marca: Marca): void {
		this.stateService.saveData({ marcaSeleccionada: marca });
		this._marcasExitoTrigger.set('SUCCESS_MARCA');
	}

	resetTrigger(): void {
		this._marcasExitoTrigger.set(null);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
