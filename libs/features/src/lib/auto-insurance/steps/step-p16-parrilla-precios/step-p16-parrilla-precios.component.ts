import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	BalButton,
	BalCard,
	BalCardContent,
	BalCheckbox,
	BalIcon,
	BalNotification,
	BalSelect,
	BalSelectOption
} from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { GrupoModalidades, Modalidad, P16ModalidadesService } from '@mnv-autos-clientes/data';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p16-parrilla-precios',
	imports: [
		BalButton,
		BalCard,
		BalCardContent,
		BalCheckbox,
		BalIcon,
		BalNotification,
		BalSelect,
		BalSelectOption,
		TranslocoDirective
	],
	templateUrl: './step-p16-parrilla-precios.component.html',
	styleUrl: './step-p16-parrilla-precios.component.scss'
})
export class StepP16ParrillaPreciosComponent implements OnInit {
	protected readonly modalidadesService = inject(P16ModalidadesService);
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	protected readonly grupos = this.modalidadesService.grupos;
	protected readonly errorTarificacion = this.modalidadesService.errorTarificacion;

	constructor() {
		effect(() => {
			if (this.modalidadesService.sinPrecios()) {
				void this.router.navigate(['../sin-precio'], { relativeTo: this.route, replaceUrl: true });
			}
		});
	}

	ngOnInit(): void {
		this.modalidadesService.ejecutarCargaCompleta();
	}

	protected modalidadSeleccionada(grupo: GrupoModalidades): Modalidad {
		return this.modalidadesService.getModalidadSeleccionadaPorGrupo(grupo);
	}

	protected modalidadEstaSeleccionada(grupo: GrupoModalidades, modalidad: Modalidad): boolean {
		return this.modalidadSeleccionada(grupo).codigo === modalidad.codigo;
	}

	protected debeDeshabilitar(grupo: GrupoModalidades, indice: number): boolean {
		const indiceSeleccionado = grupo.modalidades.findIndex(
			(modalidad) => modalidad.codigo === this.modalidadSeleccionada(grupo).codigo
		);
		return indice < indiceSeleccionado;
	}

	protected cambiarModalidad(grupo: GrupoModalidades, modalidad: Modalidad): void {
		this.modalidadesService.cambiarSeleccionModalidad(grupo, modalidad);
	}

	protected cambiarFranquicia(
		grupo: GrupoModalidades,
		event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>
	): void {
		const codigo = event.detail;
		if (codigo && !Array.isArray(codigo)) {
			this.modalidadesService.seleccionarModalidadPorCodigo(grupo, codigo);
		}
	}

	protected contratar(grupo: GrupoModalidades): void {
		const modalidad = this.modalidadSeleccionada(grupo);
		const etiqueta = getEtiquetaModalidad(grupo, modalidad);

		this.modalidadesService.guardarSeleccionContratacion(grupo, etiqueta);
		this.navigation.next();
	}

	protected literalFranquicia(modalidad: Modalidad): string {
		return modalidad.franquicia === 0 ? 'Sin franquicia' : `Franquicia ${modalidad.franquicia ?? 0}€`;
	}

	protected formatearPrecio(precio: number): string {
		return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio);
	}
}

export function getEtiquetaModalidad(
	grupo: Pick<GrupoModalidades, 'descripcion'>,
	modalidad: Pick<Modalidad, 'descripcion'>
): string {
	const nombreGrupo = grupo.descripcion.trim();
	const nombreModalidad = modalidad.descripcion.trim();
	if (!nombreGrupo) return nombreModalidad;
	if (!nombreModalidad || sonElMismoLiteral(nombreGrupo, nombreModalidad)) return nombreGrupo;
	return normalizarLiteral(nombreModalidad).startsWith(normalizarLiteral(nombreGrupo))
		? nombreModalidad
		: `${nombreGrupo} + ${nombreModalidad}`;
}

function sonElMismoLiteral(primero: string, segundo: string): boolean {
	return normalizarLiteral(primero) === normalizarLiteral(segundo);
}

function normalizarLiteral(valor: string): string {
	return valor
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('es-ES')
		.replace(/\s+/g, ' ')
		.trim();
}
