import { Component, inject, OnInit } from '@angular/core';
import { BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { Aseguradora, P11AseguradorasService } from '@mnv-autos-clientes/data';
import { ElementoGrid, GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p11-lista-aseguradoras',
	host: { class: 'w-full' },
	imports: [BalSelect, BalSelectOption, GridTarjetasComponent],
	templateUrl: './step-p11-lista-aseguradoras.component.html',
	styleUrl: './step-p11-lista-aseguradoras.component.scss'
})
export class StepP11ListaAseguradorasComponent implements OnInit {
	private readonly aseguradorasService = inject(P11AseguradorasService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly errorMsg = this.aseguradorasService.errorMsg;
	protected readonly aseguradoras = this.aseguradorasService.aseguradoras;
	protected readonly aseguradoraSeleccionada = this.aseguradorasService.aseguradoraSeleccionada;

	constructor() {
		this.aseguradorasService.limpiarErrores();
	}

	ngOnInit(): void {
		this.aseguradorasService.cargarAseguradoras();
	}

	protected onCardClick(elemento: ElementoGrid): void {
		this.seleccionarAseguradora({
			id: elemento.id,
			nombre: elemento.nombre,
			logoUrl: elemento.logoUrl ?? ''
		});
	}

	protected onSelectUpdate(event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>): void {
		const id = event.detail;
		if (!id || Array.isArray(id)) return;

		const aseguradora = this.aseguradoras().find((item) => item.id === id);
		if (aseguradora) this.seleccionarAseguradora(aseguradora);
	}

	private seleccionarAseguradora(aseguradora: Aseguradora): void {
		this.aseguradorasService.seleccionarAseguradora(aseguradora);
		this.navigation.next();
	}
}
