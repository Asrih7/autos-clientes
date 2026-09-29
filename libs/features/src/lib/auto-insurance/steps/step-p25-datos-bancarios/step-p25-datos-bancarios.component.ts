import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalCheckbox, BalDate, BalField, BalFieldControl, BalFieldLabel, BalFieldMessage, BalHeading, BalIcon, BalInput, BalNotification, BalTooltip, parseCustomEvent } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p25-datos-bancarios',
	imports: [BalButton, BalCheckbox, BalDate, BalField, BalFieldControl, BalFieldLabel, BalFieldMessage, BalHeading, BalIcon, BalInput, BalNotification, BalTooltip, TranslocoDirective, VehiclePriceSummaryComponent],
	templateUrl: './step-p25-datos-bancarios.component.html',
	host: { class: 'w-full' }
})
export class StepP25DatosBancariosComponent {
	protected readonly state = inject(InsuranceStateService);
	private readonly navigation = inject(InsuranceNavigationService);

	protected readonly fechaEfecto = signal(this.state.formData().fechaEfectoPoliza ?? this.fechaHoy());
	protected readonly titular = signal(this.state.formData().titularCuentaBancaria ?? '');
	protected readonly iban = signal(this.state.formData().iban ?? '');
	protected readonly informacionContractualAceptada = signal(this.state.formData().informacionContractualAceptada ?? false);
	protected readonly mostrarErrores = signal(false);
	protected readonly contratado = signal(false);
	protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);
	protected readonly titularInvalido = computed(() => this.mostrarErrores() && !this.titular().trim());
	protected readonly ibanInvalido = computed(() => this.mostrarErrores() && !this.esIbanValido(this.iban()));
	protected readonly fechaInvalida = computed(() => this.mostrarErrores() && !this.fechaEfecto());
	protected readonly contractualInvalida = computed(() => this.mostrarErrores() && !this.informacionContractualAceptada());

	protected actualizarFecha(event: Event): void { this.fechaEfecto.set(parseCustomEvent(event)?.toString() ?? ''); }
	protected actualizarTitular(event: Event): void { this.titular.set(parseCustomEvent(event)?.toString() ?? ''); }
	protected actualizarIban(event: Event): void { this.iban.set((parseCustomEvent(event)?.toString() ?? '').replace(/\s/g, '').toUpperCase()); }
	protected actualizarInformacionContractual(event: Event): void { this.informacionContractualAceptada.set(Boolean(parseCustomEvent(event))); }
	protected volver(): void { this.navigation.back(); }

	protected contratar(): void {
		this.mostrarErrores.set(true);
		this.guardarDatos();
		if (!this.state.isDatosBancariosValidos()) return;
		this.contratado.set(true);
	}

	protected tituloVehiculo(): string {
		const data = this.state.formData();
		const version = data.versionSeleccionada;
		return version ? `${version.marca.nombre} ${version.modelo.nombre}` : [data.marcaSeleccionada?.nombre, data.modeloSeleccionado?.nombre].filter(Boolean).join(' ') || 'Vehículo seleccionado';
	}

	protected detalleVehiculo(): string {
		const version = this.state.formData().versionSeleccionada;
		return version ? [version.version.nombre, `${version.cilindradaCc}cc`, `${version.potenciaCv}CV`, `${version.numeroPuertas} puertas`, `(${version.anioLanzamiento})`].join(', ') : '';
	}

	private guardarDatos(): void {
		this.state.saveData({ fechaEfectoPoliza: this.fechaEfecto(), titularCuentaBancaria: this.titular().trim(), iban: this.iban(), metodoPago: 'CUENTA_BANCARIA', privacidadContratacionAceptada: this.informacionContractualAceptada(), informacionContractualAceptada: this.informacionContractualAceptada() });
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

	private fechaHoy(): string { return new Date().toISOString().slice(0, 10); }
}
