import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { InsuranceStateService } from '../store/insurance-state.service';
import { BaseApiService, HttpOptions } from './base-api.service';

interface InicioEmision {
	identificador: number;
	tarea: string;
}

interface InicioProcesoResponse {
	body?: {
		emision?: InicioEmision;
	};
	emision?: InicioEmision;
}

@Injectable({ providedIn: 'root' })
export class EmisionProcesoService extends BaseApiService {
	private readonly state = inject(InsuranceStateService);

	iniciarProceso(): void {
		const options: HttpOptions = {
			params: {
				canalMed: 'MEDI',
				codiMedi: '323232',
				lineaNegocio: 'AU02'
			}
		};

		this.invocarAutos<InicioProcesoResponse>('POST', 'emision/iniciar-proceso', options)
			.pipe(
				map((response) => response.body?.emision ?? response.emision),
				map((emision) => {
					if (!emision) throw new Error('La respuesta no contiene los datos de emisión.');
					return emision;
				})
			)
			.subscribe({
				next: ({ identificador, tarea }) => this.state.saveData({ identificador, tarea }),
				error: (error: HttpErrorResponse) => console.error('Error al iniciar el proceso de emisión:', error)
			});
	}
}
