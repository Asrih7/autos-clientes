import { Component, computed, inject, signal, effect } from '@angular/core';
import { InsuranceStateService, MetodoBusqueda, P1BusquedaService } from '@mnv-autos-clientes/data';
import {
	BalButton,
	BalDivider,
	BalInput,
	BalList,
	BalListItem,
	BalListItemAccordionBody,
	BalListItemAccordionHead,
	BalListItemContent,
	BalListItemTitle,
	parseCustomEvent
} from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p1-busqueda',
	imports: [
		BalButton,
		BalDivider,
		BalInput,
		BalList,
		BalListItem,
		BalListItemAccordionHead,
		BalListItemContent,
		BalListItemTitle,
		BalListItemAccordionBody,
		TranslocoDirective,
	],
	templateUrl: './step-p1-busqueda.component.html',
	styleUrl: './step-p1-busqueda.component.scss'
})
export class StepP1BusquedaComponent {
	private readonly busquedaService = inject(P1BusquedaService);
	private readonly stateService = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly matriculaValue = signal<string>('');
	protected readonly tipoBusqueda = signal<MetodoBusqueda>('matricula');

	protected readonly errorMsg = this.busquedaService.errorMsg;

	protected readonly isButtonDisabled = computed(() => {
		const valor = this.matriculaValue().trim();
		return valor.length === 0;
	});

	constructor() {
		this.busquedaService.limpiarErrores();

		effect(() => {
			const trigger = this.busquedaService.busquedaExitoTrigger();

			if (trigger === 'SUCCESS_BUSQUEDA') {
				this.busquedaService.resetTrigger();
				this.navigation.next();
			}
		});
	}

	onInputUpdate(event: Event): void {
		const parsedEvent = parseCustomEvent(event);
		if (!parsedEvent) return;

		const customEvent = parsedEvent as string | undefined;
		this.matriculaValue.set((customEvent ?? '').toUpperCase());
	}

	irPorMatricula(): void {
		if (this.isButtonDisabled()) return;

		const valorBusqueda = this.matriculaValue();
		const metodo = this.tipoBusqueda();

		this.busquedaService.buscarPorMatricula(metodo, valorBusqueda);
	}

	irPorManual(): void {
		this.stateService.saveData({
			tipoFlujo: 'MANUAL',
			vehiculo: undefined
		});
		this.navigation.next();
	}
}
