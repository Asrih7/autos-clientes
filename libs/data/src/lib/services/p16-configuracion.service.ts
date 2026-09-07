import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
	GarantiaOcupantes,
	GarantiaOcupantesRequest,
	OpcionGarantiaOcupantes,
	PeriodoCobro
} from '../models/p16-configuracion.model';
import { BaseApiService } from './base-api.service';

const GARANTIA_OCUPANTES_REQUEST: GarantiaOcupantesRequest = {
	lineaNegocio: 'AU02',
	combinacionComercial: 'A1C001',
	codigoMediador: '310666',
	tipoVehiculo: '100',
	codigoCompania: '0001'
};

@Injectable({ providedIn: 'root' })
export class P16ConfiguracionService extends BaseApiService {
	private readonly _periodosCobro = signal<PeriodoCobro[]>([]);
	private readonly _garantiaOcupantes = signal<GarantiaOcupantes | null>(null);
	private readonly _error = signal<string | null>(null);

	readonly periodosCobro = this._periodosCobro.asReadonly();
	readonly garantiaOcupantes = this._garantiaOcupantes.asReadonly();
	readonly error = this._error.asReadonly();

	cargar(): void {
		if (this._periodosCobro().length > 0 || this._garantiaOcupantes() !== null) return;

		this._error.set(null);

		const periodoCobro$ = this.invocarAutos<PeriodoCobro[]>('GET', 'catalogo/periodo-cobro', {
			headers: { lineaNegocio: 'AU02' }
		});

		const garantiaOcupantes$ = this.invocarAutos<GarantiaOcupantes>('POST', 'configuracion/garantia-ocupantes', {
			body: GARANTIA_OCUPANTES_REQUEST
		});

		forkJoin({ periodoCobro: periodoCobro$, garantiaOcupantes: garantiaOcupantes$ }).subscribe({
			next: ({ periodoCobro, garantiaOcupantes }) => {
				// PeriodoCobro has no `orden`; the API's response order is retained.
				this._periodosCobro.set(periodoCobro);

				this._garantiaOcupantes.set({
					numeroPlazasAseguradas: this.ordenarOpcionesGarantia(garantiaOcupantes.numeroPlazasAseguradas),
					capitalesFallecimiento: this.ordenarOpcionesGarantia(garantiaOcupantes.capitalesFallecimiento),
					capitalesInvalidez: this.ordenarOpcionesGarantia(garantiaOcupantes.capitalesInvalidez)
				});
			},
			error: (error: HttpErrorResponse) => {
				console.error('Error loading P16 configuration:', error);
				this._error.set('No se ha podido recuperar la configuración de modalidades.');
			}
		});
	}

	private ordenarOpcionesGarantia(opciones: OpcionGarantiaOcupantes[]): OpcionGarantiaOcupantes[] {
		return [...opciones].sort((a, b) => Number(a.orden) - Number(b.orden));
	}
}
