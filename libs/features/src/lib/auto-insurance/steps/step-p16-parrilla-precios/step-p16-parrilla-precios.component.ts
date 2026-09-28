import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BalButton, BalCard, BalCardContent, BalCheckbox, BalIcon, BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { GrupoModalidades, InsuranceStateService, Modalidad, P16ModalidadesService } from '@mnv-autos-clientes/data';

@Component({
	selector: 'lib-step-p16-parrilla-precios',
	imports: [BalButton, BalCard, BalCardContent, BalCheckbox, BalIcon, BalSelect, BalSelectOption],
	templateUrl: './step-p16-parrilla-precios.component.html',
	styleUrl:'./step-p16-parrilla-precios.component.scss'
})
export class StepP16ParrillaPreciosComponent implements OnInit {
	private readonly modalidadesService = inject(P16ModalidadesService);
	private readonly insuranceState = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly router = inject(Router);
	private readonly route = inject(ActivatedRoute);

	protected readonly grupos = this.modalidadesService.grupos;

	ngOnInit(): void {
		this.modalidadesService.cargarModalidades().subscribe({
			next: () => {
				if (this.modalidadesService.sinPrecios()) void this.router.navigate(['../sin-precio'], { relativeTo: this.route, replaceUrl: true });
			},
			error: (error) => console.error('Error al obtener la cotización:', error)
		});
	}

	protected modalidadSeleccionada(grupo: GrupoModalidades): Modalidad {
		return this.modalidadesService.modalidadSeleccionada(grupo);
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
		const seleccionada = this.modalidadSeleccionada(grupo);
		this.modalidadesService.seleccionarModalidad(
			grupo,
			seleccionada.codigo === modalidad.codigo ? grupo.modalidades[0].codigo : modalidad.codigo
		);
	}

	protected cambiarFranquicia(
		grupo: GrupoModalidades,
		event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>
	): void {
		const codigo = event.detail;
		if (codigo && !Array.isArray(codigo)) this.modalidadesService.seleccionarModalidad(grupo, codigo);
	}

	protected contratar(grupo: GrupoModalidades): void {
		this.insuranceState.saveData({ modalidadSeleccionada: this.modalidadSeleccionada(grupo) });
		this.navigation.next();
	}

	protected literalFranquicia(modalidad: Modalidad): string {
		return modalidad.franquicia === 0 ? 'Sin franquicia' : `Franquicia ${modalidad.franquicia ?? 0}€`;
	}

	protected formatearPrecio(precio: number): string {
		return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(precio);
	}
}
