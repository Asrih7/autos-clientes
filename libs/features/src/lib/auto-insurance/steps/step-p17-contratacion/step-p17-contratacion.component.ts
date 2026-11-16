import { AfterViewInit, Component, computed, effect, inject, signal, viewChildren } from '@angular/core';
import {
	BalButton,
	BalHeading,
	BalIcon,
	BalInput,
	BalNotification,
	BalTooltip,
	parseCustomEvent
} from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import {
	ContratacionStore,
	CorePersistenceStore,
	P17PolizaActualService,
	P6VersionesService,
	VehiculoStore
} from '@mnv-autos-clientes/data';
import { NotificationBusService } from '@mnv-autos-clientes/shared';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';

@Component({
	selector: 'lib-step-p17-contratacion',
	imports: [
		BalButton,
		BalHeading,
		BalIcon,
		BalInput,
		BalNotification,
		BalTooltip,
		TranslocoDirective,
		VehiclePriceSummaryComponent
	],
	templateUrl: './step-p17-contratacion.component.html',
	host: { class: 'w-full' }
})
export class StepP17ContratacionComponent implements AfterViewInit {
	private readonly contratacionStore = inject(ContratacionStore);
	private readonly vehiculoStore = inject(VehiculoStore);
	private readonly coreStore = inject(CorePersistenceStore);

	private readonly navigation = inject(InsuranceNavigationService);
	private readonly polizaActualService = inject(P17PolizaActualService);
	private readonly versionesService = inject(P6VersionesService);
	private readonly notifications = inject(NotificationBusService);
	private readonly transloco = inject(TranslocoService);

	protected readonly digitosPoliza = signal<string[]>(this.inicializarDigitos());
	protected readonly requiereRecalculo = signal(false);
	protected readonly recalculando = signal(false);
	private readonly polizaTarificada = signal<string | null>(null);
	protected readonly email = signal('');
	protected readonly privacidadAceptada = signal(false);

	protected readonly poliza = computed(() => this.digitosPoliza().join(''));
	protected readonly error = computed(() => this.poliza().length > 0 && this.poliza().length !== 5);

	protected readonly modalidad = computed(() => this.contratacionStore.state().modalidadSeleccionada ?? null);
	protected readonly precio = computed(() => this.modalidad()?.primaTotal ?? 0);
	protected readonly emailValido = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
	protected readonly puedeGuardarPresupuesto = computed(() => this.emailValido() && this.privacidadAceptada());

	private readonly polizaInputs = viewChildren<BalInput>('polizaInput');

	constructor() {
		const metadata = this.coreStore.metadata();
		const vehiculoState = this.vehiculoStore.state();

		if (metadata.tipoFlujo === 'MANUAL' && vehiculoState.modeloSeleccionado?.id && !vehiculoState.versionSeleccionada) {
			this.versionesService.obtenerVersiones(String(vehiculoState.modeloSeleccionado.id));
		}

		effect(() => {
			const currentMeta = this.coreStore.metadata();
			const currentVehiculo = this.vehiculoStore.state();
			if (currentMeta.tipoFlujo !== 'MANUAL' || currentVehiculo.versionSeleccionada || !currentVehiculo.versionId)
				return;

			const version = this.versionesService
				.listadoVersiones()
				.find((item) => item.version.id === currentVehiculo.versionId);
			if (version) {
				this.vehiculoStore.confirmarVersionSeleccionada(version.version.id, version.anioLanzamiento);
			}
		});
	}

	ngAfterViewInit(): void {
		if (!this.poliza()) this.enfocarDigito(0);
	}

	protected actualizarDigito(indice: number, event: Event): void {
		const digito = (parseCustomEvent(event)?.toString() ?? '').replace(/\D/g, '').slice(-1);
		this.actualizarValor(indice, digito);
		if (digito && indice < 4) this.enfocarDigito(indice + 1);
		if (digito && indice === 4) this.enfocarBotonContinuar();
		if (!digito && indice > 0) this.enfocarDigito(indice - 1);
	}

	protected gestionarTecla(indice: number, event: KeyboardEvent): void {
		if ((event.key !== 'Backspace' && event.key !== 'Delete') || this.digitosPoliza()[indice] || indice === 0) return;

		event.preventDefault();
		this.actualizarValor(indice - 1, '');
		this.enfocarDigito(indice - 1);
	}

	protected alPerderFoco(): void {
		if (this.poliza().length !== 5) return;

		this.requiereRecalculo.set(true);
	}

	protected actualizarEmail(event: Event): void {
		this.email.set((parseCustomEvent(event)?.toString() ?? '').trim());
	}

	protected validarEmail(): void {
		if (this.email() && !this.emailValido()) {
			this.notifications.emit('tarificacion.p17.email_invalid', 'warning', undefined, true);
		}
	}

	protected actualizarPrivacidad(event: Event): void {
		this.privacidadAceptada.set(Boolean(parseCustomEvent(event)));
	}

	protected guardarPresupuesto(): void {
		if (!this.puedeGuardarPresupuesto()) return;
		this.notifications.emit('tarificacion.p17.quote_saved', 'success', 4000, true);
	}

	protected continuar(avanzarTrasRecalculo = false): void {
		if (this.error() || this.poliza().length !== 5 || this.recalculando()) return;

		if (this.requiereRecalculo() || this.polizaTarificada() !== this.poliza()) {
			this.recalcularPoliza(avanzarTrasRecalculo);
			return;
		}

		this.navigation.next();
	}

	protected volver(): void {
		this.navigation.back();
	}

	protected tituloVehiculo(): string | null {
		const vehiculoData = this.vehiculoStore.state();
		const versionManual = vehiculoData.versionSeleccionada;
		if (versionManual) return [versionManual.marca.nombre, versionManual.modelo.nombre].filter(Boolean).join(' ');

		const version =
			vehiculoData.busqueda?.versiones?.find((item) => item.version.id === vehiculoData.versionId) ??
			vehiculoData.busqueda?.versiones?.[0];
		return (
			[version?.marca.nombre, version?.modelo.nombre].filter(Boolean).join(' ') ||
			[vehiculoData.marcaSeleccionada?.nombre, vehiculoData.modeloSeleccionado?.nombre].filter(Boolean).join(' ') ||
			null
		);
	}

	protected detalleVehiculo(): string {
		const metadata = this.coreStore.metadata();
		const vehiculoData = this.vehiculoStore.state();

		if (metadata.tipoFlujo === 'MANUAL') {
			const versionManual = this.versionSeleccionada();
			if (!versionManual) return '';

			const detalles = [
				versionManual.version.nombre,
				versionManual.cilindradaCc && `${versionManual.cilindradaCc}cc`,
				versionManual.potenciaCv && `${versionManual.potenciaCv}CV`,
				versionManual.numeroPuertas &&
					`${versionManual.numeroPuertas} ${this.transloco.translate('tarificacion.p17.doors')}`
			]
				.filter(Boolean)
				.join(', ');

			return versionManual.anioLanzamiento ? `${detalles} (${versionManual.anioLanzamiento})` : detalles;
		}

		const version =
			vehiculoData.busqueda?.versiones?.find((item) => item.version.id === vehiculoData.versionId) ??
			vehiculoData.busqueda?.versiones?.[0];
		if (!version) return '';
		const detalles = [
			version.version.nombre,
			version.motorizacion.cilindradaCc && `${version.motorizacion.cilindradaCc}cc`,
			version.motorizacion.potenciaCv && `${version.motorizacion.potenciaCv}CV`,
			version.caracteristicas.numeroPuertas &&
				`${version.caracteristicas.numeroPuertas} ${this.transloco.translate('tarificacion.p17.doors')}`
		]
			.filter(Boolean)
			.join(', ');

		return version.comercial.anioLanzamiento ? `${detalles} (${version.comercial.anioLanzamiento})` : detalles;
	}

	protected matriculaVehiculo(): string | null {
		return this.vehiculoStore.matricula() ?? null;
	}

	private inicializarDigitos(): string[] {
		const ultimosDigitos = this.contratacionStore.state().ultimosDigitosPoliza;
		return Array.from({ length: 5 }, (_, indice) => ultimosDigitos?.[indice] ?? '');
	}

	private versionSeleccionada() {
		const vehiculoData = this.vehiculoStore.state();
		return (
			vehiculoData.versionSeleccionada ??
			this.versionesService.listadoVersiones().find((version) => version.version.id === vehiculoData.versionId) ??
			null
		);
	}

	private actualizarValor(indice: number, valor: string): void {
		this.digitosPoliza.update((digitos) => digitos.map((actual, posicion) => (posicion === indice ? valor : actual)));
		this.polizaTarificada.set(null);

		const modalidadActual = this.modalidad();
		if (modalidadActual) {
			this.contratacionStore.guardarRecalculoPolizaContratacion(this.poliza(), modalidadActual);
		}
	}

	private recalcularPoliza(avanzarTrasRecalculo: boolean): void {
		if (this.recalculando()) return;

		const modalidad = this.modalidad();
		if (!modalidad) return;

		this.recalculando.set(true);
		this.polizaActualService.recalcular(modalidad, this.poliza()).subscribe({
			next: (modalidadRecalculada) => {
				this.contratacionStore.guardarRecalculoPolizaContratacion(this.poliza(), modalidadRecalculada);

				this.requiereRecalculo.set(false);
				this.polizaTarificada.set(this.poliza());
				this.recalculando.set(false);
				if (avanzarTrasRecalculo) this.navigation.next();
			},
			error: () => this.recalculando.set(false)
		});
	}

	private enfocarDigito(indice: number): void {
		requestAnimationFrame(() => void this.polizaInputs()?.[indice]?.setFocus());
	}

	private enfocarBotonContinuar(): void {
		requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
	}
}
