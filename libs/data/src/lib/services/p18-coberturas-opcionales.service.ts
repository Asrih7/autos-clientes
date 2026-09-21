import { computed, inject, Injectable, signal } from '@angular/core';
import { CoberturaOpcional } from '../models/cobertura-opcional.model';
import { InsuranceStateService } from '../store/insurance-state.service';

@Injectable({ providedIn: 'root' })
export class P18CoberturasOpcionalesService {
	private readonly state = inject(InsuranceStateService);
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
		const escenario = this.state.formData().cotizacion?.escenarios.find((item) => item.codigo === this.state.formData().modalidadSeleccionada?.codigo);
		const coberturas = (escenario?.coberturasOpcionales ?? []).map((cobertura) => ({ codigo: cobertura.codigo, descripcion: cobertura.descripcion, codigoRelacion: cobertura.codigoRelacion, precio: 0, detalle: '' }));
		this._coberturas.set(coberturas);
		this._seleccionadas.set(codigosSeleccionados.length ? codigosSeleccionados : coberturas.filter((cobertura) =>
			escenario?.coberturasOpcionales.some((item) => item.codigo === cobertura.codigo && item.contratada)
		).map((cobertura) => cobertura.codigo));
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
