import { computed, Injectable, signal } from '@angular/core';
import { COBERTURAS_OPCIONALES_MOCK } from '../mocks/coberturas-opcionales.mock';
import { CoberturaOpcional } from '../models/cobertura-opcional.model';

@Injectable({ providedIn: 'root' })
export class P18CoberturasOpcionalesService {
	private readonly _coberturas = signal<CoberturaOpcional[]>([]);
	private readonly _seleccionadas = signal<string[]>([]);
	private readonly _cargado = signal(false);

	readonly coberturas = this._coberturas.asReadonly();
	readonly seleccionadas = this._seleccionadas.asReadonly();
	readonly cargado = this._cargado.asReadonly();
	readonly coberturaSeleccionadas = computed(() =>
		this._coberturas().filter((cobertura) => this._seleccionadas().includes(cobertura.codigo))
	);

	cargarCoberturas(codigosSeleccionados: string[] = []): void {
		// Fuente temporal: sustituir por la respuesta de coberturas opcionales de BO.
		this._coberturas.set(COBERTURAS_OPCIONALES_MOCK.map((cobertura) => ({ ...cobertura })));
		this._seleccionadas.set(codigosSeleccionados);
		this._cargado.set(true);
	}

	estaSeleccionada(codigo: string): boolean {
		return this._seleccionadas().includes(codigo);
	}

	cambiarSeleccion(codigo: string, seleccionada: boolean): void {
		this._seleccionadas.update((actuales) => seleccionada
			? [...new Set([...actuales, codigo])]
			: actuales.filter((actual) => actual !== codigo));
	}
}
