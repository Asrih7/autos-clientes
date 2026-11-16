import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map } from 'rxjs';
import { ApiAseguradoraResponse } from '../dtos/aseguradora.dto';
import { mapToAseguradorasDomain } from '../mappers/aseguradora.mapper';
import { Aseguradora } from '../models/aseguradora.model';
import { BaseApiService, HttpOptions } from './base-api.service';
import { HistorialRiesgoStore } from '../store/+state/historial-riesgo.store';

@Injectable({ providedIn: 'root' })
export class P11AseguradorasService extends BaseApiService {
	private readonly historialRiesgoStore = inject(HistorialRiesgoStore);
	private readonly _errorMsg = signal<string | null>(null);
	private readonly _aseguradorasPrincipalesGrid = signal<Aseguradora[]>([]);
	private readonly _aseguradorasDesplegable = signal<Aseguradora[]>([]);

	readonly errorMsg = this._errorMsg.asReadonly();
	readonly aseguradorasPrincipalesGrid = this._aseguradorasPrincipalesGrid.asReadonly();
	readonly aseguradorasDesplegable = this._aseguradorasDesplegable.asReadonly();

	readonly aseguradoraSeleccionada = computed(
		() => this.historialRiesgoStore.state().aseguradoraSeleccionada ?? null
	);

	cargarAseguradoras(): void {
		if (this._aseguradorasDesplegable().length > 0) return;

		this._errorMsg.set(null);
		const options: HttpOptions = { headers: { lineaNegocio: 'AU02' } };

		this.invocarAutos<ApiAseguradoraResponse[]>('GET', 'catalogo/compania-aseguradoras', options)
			.pipe(
				map((aseguradoras) => {
					const codes = new Set<string>();
					return aseguradoras.filter((aseguradora) => !codes.has(aseguradora.codigo) && codes.add(aseguradora.codigo));
				}),
				map(mapToAseguradorasDomain),
				map((aseguradoras) => ({
					ordenadas: [...aseguradoras].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
				})),
				map(({ ordenadas }) => ({
					grid: ordenadas.slice(0, 15),
					desplegable: ordenadas.slice(15)
				}))
			)
			.subscribe({
				next: ({ grid, desplegable }) => {
					this._aseguradorasPrincipalesGrid.set(grid);
					this._aseguradorasDesplegable.set(desplegable);
				},
				error: (error: HttpErrorResponse) => {
					console.error('Error cargando aseguradoras:', error);
					this._errorMsg.set('Hubo un problema al recuperar el listado de aseguradoras.');
				}
			});
	}

	seleccionarAseguradora(aseguradora: Aseguradora): void {
		this.historialRiesgoStore.confirmarAseguradoraSeleccionada(aseguradora);
	}

	limpiarErrores(): void {
		this._errorMsg.set(null);
	}
}
