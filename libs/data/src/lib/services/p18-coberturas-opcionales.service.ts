import { computed, inject, Injectable, signal } from '@angular/core';
import { CoberturaOpcional } from '../models/cobertura-opcional.model';
import { ContratacionStore } from '../store/+state/contratacion.store';

@Injectable({ providedIn: 'root' })
export class P18CoberturasOpcionalesService {
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly _coberturas = signal<CoberturaOpcional[]>([]);
	private readonly _seleccionadas = signal<string[]>([]);
	private readonly _cargado = signal(false);

	readonly coberturas = this._coberturas.asReadonly();
	readonly seleccionadas = this._seleccionadas.asReadonly();
	readonly cargado = this._cargado.asReadonly();
	readonly coberturaSeleccionadas = computed(() =>
		this._coberturas().filter((cobertura) => this._seleccionadas().includes(cobertura.codigo))
	);

	readonly seleccionadasEnStore = computed(() => this.contratacionStore.state().coberturasOpcionalesSeleccionadas ?? []);

	cargarCoberturas(codigosSeleccionados: string[] = []): void {
		const contratacion = this.contratacionStore.state();

		const escenario = contratacion.cotizacion?.escenarios.find(
			(item) => item.codigo === contratacion.modalidadSeleccionada?.codigo
		);

		const coberturas = (escenario?.coberturasOpcionales ?? []).map((cobertura) => ({
			codigo: cobertura.codigo,
			descripcion: cobertura.descripcion,
			codigoRelacion: cobertura.codigoRelacion,
			precio: 0,
			detalle: ''
		}));
		this._coberturas.set(coberturas);

		if (codigosSeleccionados && codigosSeleccionados.length > 0) {
			this._seleccionadas.set([...codigosSeleccionados]);
		} else {
			const defaultPreSelected = (escenario?.coberturasOpcionales ?? [])
				.filter((item) => item.contratada === true)
				.map((item) => item.codigo);

			this._seleccionadas.set(defaultPreSelected);
		}

		this._cargado.set(true);
	}

	estaSeleccionada(codigo: string): boolean {
		return this._seleccionadas().includes(codigo);
	}

	cambiarSeleccion(codigo: string, seleccionada: boolean): void {
		this._seleccionadas.update((actuales) => {
			const nuevasSelecciones = seleccionada
				? [...new Set([...actuales, codigo])]
				: actuales.filter((actual) => actual !== codigo);

			this.contratacionStore.guardarCoberturasOpcionalesSeleccionadas(nuevasSelecciones);
			return nuevasSelecciones;
		});
	}
}
