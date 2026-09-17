import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiCatalogoOpcionResponse } from '../dtos/catalogo-opcion.dto';
import { CatalogoOpcion } from '../models/catalogo-opcion.model';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

@Injectable({ providedIn: 'root' })
export class P12AniosAseguradoService extends BaseApiService {
	private readonly stateService = inject(InsuranceStateService);
	private readonly _opciones = signal<CatalogoOpcion[]>([]);
	private readonly _errorMsg = signal<string | null>(null);

	readonly opciones = this._opciones.asReadonly();
	readonly errorMsg = this._errorMsg.asReadonly();
	readonly opcionSeleccionada = computed(() => this.stateService.formData().aniosAsegurado ?? null);

	cargarOpciones(): void {
		if (this._opciones().length) return;
		this._errorMsg.set(null);
		const options: HttpOptions = { headers: { lineaNegocio: 'AU02' } };
		this.invocarAutos<ApiCatalogoOpcionResponse[]>('GET', 'catalogo/anios-compania-anterior', options).subscribe({
			next: (opciones) => this._opciones.set(this.mapOpciones(opciones)),
			error: (error: HttpErrorResponse) => {
				console.error('Error cargando años de aseguramiento:', error);
				this._errorMsg.set('Hubo un problema al recuperar los años de aseguramiento.');
			}
		});
	}

	seleccionarOpcion(opcion: CatalogoOpcion): void {
		this.stateService.saveData({ aniosAsegurado: opcion.id });
	}

	private mapOpciones(opciones: ApiCatalogoOpcionResponse[]): CatalogoOpcion[] {
		return opciones.map(({ codigo, descripcion }) => ({ id: codigo, nombre: descripcion }));
	}
}
