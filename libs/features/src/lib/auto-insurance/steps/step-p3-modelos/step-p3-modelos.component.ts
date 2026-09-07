import { Component, effect, inject, OnInit } from '@angular/core';
import { BalSelect, BalSelectOption } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { Modelo, P3ModelosService } from '@mnv-autos-clientes/data';
import { GridTarjetasComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p3-modelos',
	imports: [TranslocoDirective, GridTarjetasComponent, BalSelect, BalSelectOption],
	templateUrl: './step-p3-modelos.component.html',
	styleUrl: './step-p3-modelos.component.scss'
})
export class StepP3ModelosComponent implements OnInit{
	private readonly modelosService = inject(P3ModelosService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly errorMsg = this.modelosService.errorMsg;
	protected readonly modelosGrid = this.modelosService.modelosPrincipalesGrid;
	protected readonly modelosSelect = this.modelosService.modelosDesplegableUnicas;
	protected readonly modeloSeleccionado = this.modelosService.modeloSeleccionado;

	constructor() {
		this.modelosService.limpiarErrores();

		effect(() => {
			const trigger = this.modelosService.modelosExitoTrigger();
			if (trigger === 'SUCCESS_MODELO') {
				this.modelosService.resetTrigger();
				this.navigation.next();
			}
		});
	}

	ngOnInit(): void {
		this.modelosService.cargarModelos();
	}

	protected onCardClick(modelo: Modelo): void {
		this.modelosService.seleccionarModelo(modelo);
	}

	protected onSelectUpdate(event: BalEvents.BalSelectCustomEvent<string | string[] | undefined>): void {
		const idSelected = event.detail;
		if (!idSelected) return;

		const modeloObjeto = this.modelosSelect().find((m) => m.id === idSelected);
		if (modeloObjeto) {
			this.modelosService.seleccionarModelo(modeloObjeto);
		}
	}
}
