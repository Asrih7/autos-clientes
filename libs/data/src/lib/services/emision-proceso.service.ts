import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AUTO_INSURANCE_CONSTANTS } from '@mnv-autos-clientes/shared';
import { CorePersistenceStore } from '../store/+state/core-persistence.store';
import { BaseApiService, HttpOptions } from './base-api.service';

interface InicioEmision {
	identificador: number;
	tarea: string;
}

interface InicioProcesoResponse {
	body?:
		| {
				emision?: InicioEmision;
		  }
		| InicioEmision;
	emision?: InicioEmision;
	identificador?: number;
	tarea?: string;
}

@Injectable({ providedIn: 'root' })
export class EmisionProcesoService extends BaseApiService {
	private readonly coreStore = inject(CorePersistenceStore);

	iniciarProceso(): void {
		const options: HttpOptions = {
			headers: {
				codigoMediador: AUTO_INSURANCE_CONSTANTS.codigoMediador,
				lineaNegocio: AUTO_INSURANCE_CONSTANTS.lineaNegocio
			},
			params: {
				canalMed: AUTO_INSURANCE_CONSTANTS.canalMediacion,
				codiMedi: AUTO_INSURANCE_CONSTANTS.codigoMediador,
				lineaNegocio: AUTO_INSURANCE_CONSTANTS.lineaNegocio
			}
		};

		this.invocarAutos<InicioProcesoResponse>('GET', 'emision/iniciar-proceso', options)
			.pipe(map((response) => this.extraerEmision(response)))
			.subscribe({
				next: ({ identificador, tarea }) => {
					this.coreStore.updateGlobalSlice((state) => ({
						...state,
						metadata: {
							...state.metadata,
							identificador,
							tarea
						}
					}));
				},
				error: (error: HttpErrorResponse) => console.error('Error al iniciar el proceso de emisión:', error)
			});
	}

	private extraerEmision(response: InicioProcesoResponse): InicioEmision {
		const body = response.body;
		const candidato = body && 'emision' in body ? body.emision : (body ?? response.emision ?? response);
		if (!this.esInicioEmision(candidato)) throw new Error('La respuesta no contiene los datos de emisión.');

		return candidato;
	}

	private esInicioEmision(value: unknown): value is InicioEmision {
		return (
			typeof value === 'object' &&
			value !== null &&
			'identificador' in value &&
			typeof value.identificador === 'number' &&
			'tarea' in value &&
			typeof value.tarea === 'string'
		);
	}
}
