import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiCatalogoOpcionResponse } from '../dtos/catalogo-opcion.dto';
import { CatalogoOpcion } from '../models/catalogo-opcion.model';
import { BaseApiService, HttpOptions } from './base-api.service';
import { HistorialRiesgoStore } from '../store/+state/historial-riesgo.store';

@Injectable({ providedIn: 'root' })
export class P13PartesService extends BaseApiService {
	private readonly historialRiesgoStore = inject(HistorialRiesgoStore);
	private readonly _opciones = signal<CatalogoOpcion[]>([]);
	private readonly _errorMsg = signal<string | null>(null);

	readonly opciones = this._opciones.asReadonly();
	readonly errorMsg = this._errorMsg.asReadonly();
	
	readonly opcionSeleccionada = computed(() => this.historialRiesgoStore.state().numeroSiniestros ?? null);

	cargarOpciones(): void {
		if (this._opciones().length) return;
		this._errorMsg.set(null);
		const options: HttpOptions = { headers: { lineaNegocio: 'AU02' } };
		this.invocarAutos<ApiCatalogoOpcionResponse[]>('GET', 'catalogo/numero-siniestros', options).subscribe({
			next: (opciones) => this._opciones.set(opciones.map(({ codigo, descripcion }) => ({ id: codigo, nombre: descripcion }))),
			error: (error: HttpErrorResponse) => {
				console.error('Error cargando número de siniestros:', error);
				this._errorMsg.set('Hubo un problema al recuperar el listado de partes.');
			}
		});
	}

	seleccionarOpcion(opcion: CatalogoOpcion): void {
		this.historialRiesgoStore.guardarNumeroSiniestros(opcion.id);
	}
}
