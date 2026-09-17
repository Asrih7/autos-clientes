import { computed, Injectable, signal } from '@angular/core';
import { GrupoModalidades, Modalidad } from '../models/modalidades.model';
import { MODALIDADES_MOCK } from '../mocks/modalidades.mock';

@Injectable({ providedIn: 'root' })
export class P16ModalidadesService {
	private readonly _modalidades = signal<Modalidad[]>([]);
	private readonly _modalidadesSeleccionadas = signal<Record<string, string>>({});
	private readonly _cargado = signal(false);

	readonly cargado = this._cargado.asReadonly();
	readonly grupos = computed<GrupoModalidades[]>(() => {
		const agrupaciones = new Map<string, GrupoModalidades>();

		for (const modalidad of this._modalidades().filter((item) => item.primaTotal > 0)) {
			const codigoGrupo = modalidad.agrupacion.codigo;
			const grupo = agrupaciones.get(codigoGrupo) ?? {
				codigo: codigoGrupo,
				descripcion: modalidad.agrupacion.descripcion,
				modalidades: [],
				esTodoRiesgo: codigoGrupo === 'TODO_RIESGO'
			};
			grupo.modalidades.push(modalidad);
			agrupaciones.set(codigoGrupo, grupo);
		}

		return [...agrupaciones.values()]
			.map((grupo) => ({ ...grupo, modalidades: this.ordenarModalidades(grupo.modalidades) }))
			.sort((a, b) => this.numeroOrden(a.modalidades[0]) - this.numeroOrden(b.modalidades[0]));
	});
	readonly sinPrecios = computed(() => this._cargado() && this.grupos().length === 0);

	cargarModalidades(): void {
		// Fuente temporal: sustituir por la respuesta del servicio de tarificación cuando esté disponible.
		this.establecerModalidades(MODALIDADES_MOCK);
	}

	establecerModalidades(modalidades: Modalidad[]): void {
		this._modalidades.set(modalidades.map((modalidad) => ({ ...modalidad })));
		this._modalidadesSeleccionadas.set(
			Object.fromEntries(this.grupos().map((grupo) => [grupo.codigo, grupo.modalidades[0].codigo]))
		);
		this._cargado.set(true);
	}

	modalidadSeleccionada(grupo: GrupoModalidades): Modalidad {
		const codigoSeleccionado = this._modalidadesSeleccionadas()[grupo.codigo];
		return grupo.modalidades.find((modalidad) => modalidad.codigo === codigoSeleccionado) ?? grupo.modalidades[0];
	}

	seleccionarModalidad(grupo: GrupoModalidades, codigoModalidad: string): void {
		this._modalidadesSeleccionadas.update((seleccionadas) => ({ ...seleccionadas, [grupo.codigo]: codigoModalidad }));
	}

	private ordenarModalidades(modalidades: Modalidad[]): Modalidad[] {
		return [...modalidades].sort((a, b) => this.numeroOrden(a) - this.numeroOrden(b));
	}

	private numeroOrden(modalidad: Modalidad): number {
		return Number(modalidad.orden) || Number.MAX_SAFE_INTEGER;
	}
}
