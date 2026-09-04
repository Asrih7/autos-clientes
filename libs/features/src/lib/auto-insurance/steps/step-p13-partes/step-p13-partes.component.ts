import { Component, computed, inject, OnInit } from '@angular/core';
import { BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { P13PartesService } from '@mnv-autos-clientes/data';
import { ElementoGrid, GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p13-partes',
	imports: [BalSelect, BalSelectOption, GridTarjetasComponent],
	templateUrl: './step-p13-partes.component.html',
	styleUrl: './step-p13-partes.component.scss'
})
export class StepP13PartesComponent implements OnInit {
	private readonly partesService = inject(P13PartesService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly errorMsg = this.partesService.errorMsg;
	protected readonly opciones = this.partesService.opciones;
	protected readonly opcionesGrid = computed(() => this.opciones().slice(0, 25));
	protected readonly opcionSeleccionada = this.partesService.opcionSeleccionada;

	ngOnInit(): void {
		this.partesService.cargarOpciones();
	}

	protected onCardClick(opcion: ElementoGrid): void {
		this.partesService.seleccionarOpcion(opcion);
		this.navigation.next();
	}

	protected onSelectUpdate(event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>): void {
		const id = event.detail;
		if (!id || Array.isArray(id)) return;
		const opcion = this.opciones().find((item) => item.id === id);
		if (opcion) {
			this.partesService.seleccionarOpcion(opcion);
			this.navigation.next();
		}
	}
}
