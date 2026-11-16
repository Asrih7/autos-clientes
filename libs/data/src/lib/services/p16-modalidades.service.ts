import { computed, inject, Injectable, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map } from 'rxjs';
import { GrupoModalidades, Modalidad } from '../models/modalidades.model';
import { CotizacionService } from './cotizacion.service';
import { ContratacionStore } from '../store/+state/contratacion.store';
import { CorePersistenceStore } from '../store/+state/core-persistence.store';

@Injectable({ providedIn: 'root' })
export class P16ModalidadesService {
	private readonly cotizacionService = inject(CotizacionService);
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly coreStore = inject(CorePersistenceStore);
	private readonly destroyRef = inject(DestroyRef);

	private readonly _modalidades = signal<Modalidad[]>([]);
	private readonly _modalidadesSeleccionadas = signal<Record<string, string>>({});
	private readonly _cargado = signal(false);
	private readonly _errorTarificacion = signal(false);

	readonly cargado = this._cargado.asReadonly();
	readonly errorTarificacion = this._errorTarificacion.asReadonly();

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

	ejecutarCargaCompleta(): void {
		this._errorTarificacion.set(false);
		this.coreStore.updateGlobalSlice((state) => ({
			...state,
			metadata: { ...state.metadata, errorTarificacion: false }
		}));

		this.cotizacionService
			.cotizar()
			.pipe(
				map((respuesta) =>
					respuesta.escenarios.map(
						(escenario): Modalidad => ({
							codigo: escenario.codigo,
							descripcion: escenario.descripcion,
							orden: escenario.orden,
							agrupacion: escenario.agrupacion,
							primaTotal: escenario.primaTotal,
							primerRecibo: escenario.primerRecibo,
							restoRecibos: escenario.restoRecibos,
							franquicia: escenario.franquicia,
							coberturasIncluidas: escenario.coberturasObligatorias,
							coberturasOpcionales: escenario.coberturasOpcionales,
							derogacion: escenario.derogacion
						})
					)
				),
				catchError(() => {
					this._errorTarificacion.set(true);
					this.coreStore.updateGlobalSlice((state) => ({
						...state,
						metadata: { ...state.metadata, errorTarificacion: true }
					}));
					return EMPTY;
				}),
				takeUntilDestroyed(this.destroyRef)
			)
			.subscribe((modalidades) => {
				if (modalidades) {
					this.establecerModalidades(modalidades);
				}
			});
	}

	private establecerModalidades(modalidades: Modalidad[]): void {
		this._modalidades.set(modalidades.map((modalidad) => ({ ...modalidad })));

		const listaGrupos = this.grupos();
		const iniciales = Object.fromEntries(listaGrupos.map((grupo) => [grupo.codigo, grupo.modalidades[0].codigo]));

		const modalidadGuardada = this.contratacionStore.state().modalidadSeleccionada;

		if (modalidadGuardada?.codigo) {
			const grupoCorrespondiente = listaGrupos.find((grupo) =>
				grupo.modalidades.some((mod) => mod.codigo === modalidadGuardada.codigo)
			);

			if (grupoCorrespondiente) {
				iniciales[grupoCorrespondiente.codigo] = modalidadGuardada.codigo;
			}
		}

		this._modalidadesSeleccionadas.set(iniciales);
		this._cargado.set(true);
	}

	getModalidadSeleccionadaPorGrupo(grupo: GrupoModalidades): Modalidad {
		const codigoSeleccionado = this._modalidadesSeleccionadas()[grupo.codigo];
		return grupo.modalidades.find((modalidad) => modalidad.codigo === codigoSeleccionado) ?? grupo.modalidades[0];
	}

	seleccionarModalidadPorCodigo(grupo: GrupoModalidades, codigoModalidad: string): void {
		this._modalidadesSeleccionadas.update((seleccionadas) => {
			const nuevasSelecciones = { ...seleccionadas, [grupo.codigo]: codigoModalidad };
			const modalidad = grupo.modalidades.find((m) => m.codigo === codigoModalidad) ?? grupo.modalidades[0];

			this.contratacionStore.confirmarModalidadSeleccionada({
				...modalidad,
				descripcion: this.construirDescripcionEtiqueta(grupo.descripcion, modalidad.descripcion)
			});

			return nuevasSelecciones;
		});
	}

	cambiarSeleccionModalidad(grupo: GrupoModalidades, modalidad: Modalidad): void {
		const seleccionada = this.getModalidadSeleccionadaPorGrupo(grupo);
		const codigoDestino = seleccionada.codigo === modalidad.codigo ? grupo.modalidades[0].codigo : modalidad.codigo;
		this.seleccionarModalidadPorCodigo(grupo, codigoDestino);
	}

	guardarSeleccionContratacion(grupo: GrupoModalidades, descripcionFormateada: string): void {
		const modalidad = this.getModalidadSeleccionadaPorGrupo(grupo);

		this.contratacionStore.confirmarModalidadSeleccionada({
			...modalidad,
			descripcion: descripcionFormateada
		});
	}

	private construirDescripcionEtiqueta(descripcionGrupo: string, descripcionModalidad: string): string {
		const nombreGrupo = descripcionGrupo.trim();
		const nombreModalidad = descripcionModalidad.trim();

		if (!nombreGrupo) return nombreModalidad;

		const normGrupo = this.normalizarLiteral(nombreGrupo);
		const normModalidad = this.normalizarLiteral(nombreModalidad);

		if (!nombreModalidad || normGrupo === normModalidad) {
			return nombreGrupo;
		}

		return normModalidad.startsWith(normGrupo) ? nombreModalidad : `${nombreGrupo} + ${nombreModalidad}`;
	}

	private normalizarLiteral(valor: string): string {
		return valor
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/\s+/g, ' ')
			.trim();
	}

	private ordenarModalidades(modalidades: Modalidad[]): Modalidad[] {
		return [...modalidades].sort((a, b) => this.numeroOrden(a) - this.numeroOrden(b));
	}

	private numeroOrden(modalidad: Modalidad): number {
		return Number(modalidad.orden) || Number.MAX_SAFE_INTEGER;
	}
}
