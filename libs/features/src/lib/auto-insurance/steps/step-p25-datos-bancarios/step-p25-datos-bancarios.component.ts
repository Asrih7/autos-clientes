import { Component, computed, inject, signal } from '@angular/core';
import {
	BalButton,
	BalCheckbox,
	BalDate,
	BalField,
	BalFieldControl,
	BalFieldLabel,
	BalFieldMessage,
	BalHeading,
	BalIcon,
	BalInput,
	BalNotification,
	BalTooltip,
	parseCustomEvent
} from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	ContratacionStore,
	VehiculoStore,
	CorePersistenceStore,
	AutoInsuranceState,
	isDatosBancariosValidos
} from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p25-datos-bancarios',
	imports: [
		BalButton,
		BalCheckbox,
		BalDate,
		BalField,
		BalFieldControl,
		BalFieldLabel,
		BalFieldMessage,
		BalHeading,
		BalIcon,
		BalInput,
		BalNotification,
		BalTooltip,
		TranslocoDirective,
		VehiclePriceSummaryComponent
	],
	templateUrl: './step-p25-datos-bancarios.component.html',
	host: { class: 'w-full' }
})
export class StepP25DatosBancariosComponent {
	protected readonly contratacionStore = inject(ContratacionStore);
	protected readonly vehiculoStore = inject(VehiculoStore);
	private readonly coreStore = inject(CorePersistenceStore);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly fechaEfecto = signal(this.contratacionStore.state().fechaEfectoPoliza ?? this.fechaHoy());
	protected readonly titular = signal(this.contratacionStore.state().titularCuentaBancaria ?? '');
	protected readonly iban = signal(this.contratacionStore.state().iban ?? '');
	protected readonly informacionContractualAceptada = signal(
		this.contratacionStore.state().aceptaciones?.informacionContractualAceptada ?? false
	);
	protected readonly mostrarErrores = signal(false);

	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);
	protected readonly titularInvalido = computed(() => this.mostrarErrores() && !this.titular().trim());
	protected readonly ibanInvalido = computed(() => this.mostrarErrores() && !this.esIbanValido(this.iban()));
	protected readonly fechaInvalida = computed(() => this.mostrarErrores() && !this.fechaEfecto());
	protected readonly contractualInvalida = computed(
		() => this.mostrarErrores() && !this.informacionContractualAceptada()
	);

	protected actualizarFecha(event: Event): void {
		this.fechaEfecto.set(parseCustomEvent(event)?.toString() ?? '');
	}
	protected actualizarTitular(event: Event): void {
		this.titular.set(parseCustomEvent(event)?.toString() ?? '');
	}
	protected actualizarIban(event: Event): void {
		this.iban.set((parseCustomEvent(event)?.toString() ?? '').replace(/\s/g, '').toUpperCase());
	}
	protected actualizarInformacionContractual(event: Event): void {
		this.informacionContractualAceptada.set(Boolean(parseCustomEvent(event)));
	}
	protected volver(): void {
		this.navigation.back();
	}

	protected contratar(): void {
		this.mostrarErrores.set(true);
		this.guardarDatos();

		if (!isDatosBancariosValidos(this.getFormData())) return;

		this.navigation.next();
	}

	protected tituloVehiculo(): string {
		const vehiculoData = this.vehiculoStore.state();
		const version = vehiculoData.versionSeleccionada;
		return version
			? `${version.marca.nombre} ${version.modelo.nombre}`
			: [vehiculoData.marcaSeleccionada?.nombre, vehiculoData.modeloSeleccionado?.nombre].filter(Boolean).join(' ') ||
					'Vehículo seleccionado';
	}

	protected detalleVehiculo(): string {
		const version = this.vehiculoStore.state().versionSeleccionada;
		return version
			? [
					version.version.nombre,
					`${version.cilindradaCc}cc`,
					`${version.potenciaCv}CV`,
					`${version.numeroPuertas} puertas`,
					`(${version.anioLanzamiento})`
				].join(', ')
			: '';
	}

	private guardarDatos(): void {
		this.contratacionStore.guardarDatosBancariosContratacion(
			this.fechaEfecto(),
			this.titular().trim(),
			this.iban(),
			this.informacionContractualAceptada()
		);
	}

	private getFormData(): AutoInsuranceState {
		const baseSnapshot = this.coreStore.globalSnapshot();
		return {
			...baseSnapshot,
			contratacion: {
				...baseSnapshot.contratacion,
				fechaEfectoPoliza: this.fechaEfecto(),
				titularCuentaBancaria: this.titular().trim(),
				iban: this.iban(),
				metodoPago: 'CUENTA_BANCARIA',
				aceptaciones: {
					...baseSnapshot.contratacion?.aceptaciones,
					privacidadContratacionAceptada: this.informacionContractualAceptada(),
					informacionContractualAceptada: this.informacionContractualAceptada()
				}
			}
		};
	}

	private esIbanValido(iban: string): boolean {
		const valor = iban.replace(/\s/g, '');
		if (!/^ES\d{22}$/.test(valor)) return false;
		let resto = 0;
		for (const caracter of `${valor.slice(4)}${valor.slice(0, 4)}`) {
			const digitos = /[A-Z]/.test(caracter) ? String(caracter.charCodeAt(0) - 55) : caracter;
			for (const digito of digitos) resto = (resto * 10 + Number(digito)) % 97;
		}
		return resto === 1;
	}

	private fechaHoy(): string {
		return new Date().toISOString().slice(0, 10);
	}
}
