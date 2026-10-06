import { Component, effect, inject, OnInit } from '@angular/core';
import { BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { Marca, P2MarcasService } from '@mnv-autos-clientes/data';
import { ElementoGrid, GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p2-marcas',
	imports: [BalSelect, BalSelectOption, TranslocoDirective, GridTarjetasComponent],
	templateUrl: './step-p2-marcas.component.html',
	styleUrl: './step-p2-marcas.component.scss'
})
export class StepP2MarcasComponent implements OnInit {
	private readonly marcasService = inject(P2MarcasService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly errorMsg = this.marcasService.errorMsg;
	protected readonly marcasGrid = this.marcasService.marcasPrincipalesGrid;
	protected readonly marcasSelect = this.marcasService.marcasDesplegableUnicas;
	protected readonly marcaSeleccionada = this.marcasService.marcaSeleccionada;

	constructor() {
		this.marcasService.limpiarErrores();

		effect(() => {
			const trigger = this.marcasService.marcasExitoTrigger();

			if (trigger?.startsWith('SUCCESS_MARCA')) {
				this.marcasService.resetTrigger();
				this.navigation.next();
			}
		});
	}

	ngOnInit(): void {
		this.marcasService.cargarMarcas();
	}

	protected onCardClick(elemento: ElementoGrid): void {
		const marca: Marca = { ...elemento, logoUrl: elemento.logoUrl ?? '', orden: elemento.orden ?? 0 };
		this.marcasService.seleccionarMarca(marca);
	}

	protected onSelectUpdate(event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>): void {
		const marcaIdSelected = event.detail;
		if (!marcaIdSelected) return;

		const marcaObjeto = this.marcasSelect().find((m) => m.id === marcaIdSelected);
		if (marcaObjeto) {
			this.marcasService.seleccionarMarca(marcaObjeto);
		}
	}
}
