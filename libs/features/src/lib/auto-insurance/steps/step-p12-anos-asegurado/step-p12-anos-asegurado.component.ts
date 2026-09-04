import { Component, computed, inject, OnInit } from '@angular/core';
import { BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { P12AniosAseguradoService } from '@mnv-autos-clientes/data';
import { ElementoGrid, GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p12-anos-asegurado',
	imports: [BalSelect, BalSelectOption, GridTarjetasComponent],
	templateUrl: './step-p12-anos-asegurado.component.html',
	styleUrl: './step-p12-anos-asegurado.component.scss'
})
export class StepP12AnosAseguradoComponent implements OnInit {
	private readonly aniosAseguradoService = inject(P12AniosAseguradoService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly errorMsg = this.aniosAseguradoService.errorMsg;
	protected readonly opciones = this.aniosAseguradoService.opciones;
	protected readonly opcionesGrid = computed(() => this.opciones().slice(0, 25));
	protected readonly opcionSeleccionada = this.aniosAseguradoService.opcionSeleccionada;

	ngOnInit(): void {
		this.aniosAseguradoService.cargarOpciones();
	}

	protected onCardClick(opcion: ElementoGrid): void {
		this.aniosAseguradoService.seleccionarOpcion(opcion);
		this.navigation.next();
	}

	protected onSelectUpdate(event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>): void {
		const id = event.detail;
		if (!id || Array.isArray(id)) return;
		const opcion = this.opciones().find((item) => item.id === id);
		if (opcion) {
			this.aniosAseguradoService.seleccionarOpcion(opcion);
			this.navigation.next();
		}
	}
}
