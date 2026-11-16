import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MetodoBusqueda, P1BusquedaService, VehiculoStore } from '@mnv-autos-clientes/data';
import {
	BalButton,
	BalDivider,
	BalField,
	BalFieldControl,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
		BalField,
		BalFieldControl,
		TranslocoDirective
	],
	templateUrl: './step-p1-busqueda.component.html',
	styleUrl: './step-p1-busqueda.component.scss'
})
export class StepP1BusquedaComponent {
	private readonly busquedaService = inject(P1BusquedaService);
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly destroyRef = inject(DestroyRef);

	protected readonly matriculaValue = signal<string>('');
	protected readonly tipoBusqueda = signal<MetodoBusqueda>('matricula');
	protected readonly errorMsg = this.busquedaService.errorMsg;

	protected readonly isButtonDisabled = computed(() => {
		const valor = this.matriculaValue().trim();
		return valor.length === 0;
	});

	constructor() {
		this.busquedaService.limpiarErrores();
	}

	protected onInputUpdate(event: Event): void {
		const parsedEvent = parseCustomEvent(event);
		const customEvent = parsedEvent as string | undefined;
		this.matriculaValue.set((customEvent ?? '').toUpperCase());

		if (this.errorMsg()) {
			this.busquedaService.limpiarErrores();
		}
	}

	protected onMatriculaKeyPress(event: CustomEvent<KeyboardEvent>): void {
		if (event.detail && event.detail.key === 'Enter') {
			this.irPorMatricula();
		}
	}

	protected irPorMatricula(): void {
		if (this.isButtonDisabled()) return;

		const valorBusqueda = this.matriculaValue();
		const metodo = this.tipoBusqueda();

		this.busquedaService
			.buscarVehiculo(metodo, valorBusqueda)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					const normalized = this.vehiculoStore.state().matricula;
					if (normalized) {
						this.matriculaValue.set(normalized);
					}
					this.navigation.next();
				}
			});
	}

	protected irPorManual(): void {
		this.vehiculoStore.configurarFlujoManual();
		this.navigation.next();
	}
}
