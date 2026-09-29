import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { GrupoModalidades, Modalidad } from '../models/modalidades.model';
import { CotizacionService } from './cotizacion.service';

@Injectable({ providedIn: 'root' })
export class P16ModalidadesService {
	private readonly cotizacionService = inject(CotizacionService);
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
				esTodoRiesgo: codigoGrupo === 'TODO_RIESGO' || codigoGrupo === 'TODORIESGO'
			};
			grupo.modalidades.push(modalidad);
			agrupaciones.set(codigoGrupo, grupo);
		}

		return [...agrupaciones.values()]
			.map((grupo) => ({ ...grupo, modalidades: this.ordenarModalidades(grupo.modalidades) }))
			.sort((a, b) => this.numeroOrden(a.modalidades[0]) - this.numeroOrden(b.modalidades[0]));
	});
	readonly sinPrecios = computed(() => this._cargado() && this.grupos().length === 0);

	cargarModalidades(): Observable<void> {
		return this.cotizacionService.cotizar().pipe(
			map((respuesta) => respuesta.escenarios.map((escenario): Modalidad => ({
				codigo: escenario.codigo, descripcion: escenario.descripcion, orden: escenario.orden,
				agrupacion: escenario.agrupacion, primaTotal: escenario.primaTotal, primerRecibo: escenario.primerRecibo,
				restoRecibos: escenario.restoRecibos, franquicia: escenario.franquicia,
				coberturasIncluidas: escenario.coberturasObligatorias, coberturasOpcionales: escenario.coberturasOpcionales,
				derogacion: escenario.derogacion
			}))),
			tap((modalidades) => this.establecerModalidades(modalidades)),
			map(() => undefined)
		);
		/*
		// Fuente temporal: sustituir por la respuesta del servicio de tarificación cuando esté disponible.
		*/
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
