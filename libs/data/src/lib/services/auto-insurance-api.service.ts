import { Injectable, signal } from '@angular/core';
import { finalize, map } from 'rxjs';
import { ApiMarcaResponse } from '../dtos/marca.dto';
import { Marca } from '../models/marca.model';
import { mapToMarcasDomain } from '../mappers/marca.mapper';
import { BaseApiService, HttpOptions } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AutoInsuranceApiService extends BaseApiService {
	private _isLoading = signal<boolean>(false);
	private _marcas = signal<Marca[]>([]);
	private _errorMsg = signal<string | null>(null);

	isLoading = this._isLoading.asReadonly();
	marcas = this._marcas.asReadonly();
	errorMsg = this._errorMsg.asReadonly();

	cargarMarcas(tipoVehiculo?: number) {
		this._isLoading.set(true);
		this._errorMsg.set(null); // Reseteamos errores previos al iniciar la petición

		// CONSTRUIREMO OBJETO PLANO: Solo declaramos un JSON ordinario con los campos
		const options: HttpOptions = {
			headers: {
				lineaNegocio: 'AU02'
			},
			params: {
				// Usamos el shorthand de TypeScript. Si tipoVehiculo viene undefined,
				// nuestra clase BaseApiService lo limpiará automáticamente
				tipoVehiculo
			}
		};

		// Invocamos el endpoint. Observa que pasamos el sub-path limpio 'catalogo/marcas'
		this.invocarAutos<ApiMarcaResponse[]>('GET', 'catalogo/marcas', options)
			.pipe(
				map((marcas: ApiMarcaResponse[]) => {
					const codigosVistos = new Set<string>();
					return marcas.filter((marca) => {
						if (codigosVistos.has(marca.codigo)) {
							return false;
						}
						codigosVistos.add(marca.codigo);
						return true;
					});
				}),
				finalize(() => this._isLoading.set(false))
			)
			.subscribe({
				next: (dtoData) => this._marcas.set(mapToMarcasDomain(dtoData)),
				error: (err: HttpErrorResponse) => {
					console.error('Error cargando marcas:', err);
					if (err.status === 404) {
						this._errorMsg.set('No se encontraron marcas de vehículos disponibles.');
					} else {
						this._errorMsg.set('Hubo un problema al recuperar el listado de marcas.');
					}
				}
			});
	}

	limpiarCache() {
		this._marcas.set([]);
		this._errorMsg.set(null);
	}
}
