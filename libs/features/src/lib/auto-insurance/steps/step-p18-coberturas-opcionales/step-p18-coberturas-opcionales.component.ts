import { Component, computed, inject, signal } from '@angular/core';
import { BalButton, BalCard, BalCardContent, BalCheckbox, BalHeading, BalIcon, BalTooltip, parseCustomEvent } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { CoberturaOpcional, InsuranceStateService, P18CoberturasOpcionalesService } from '@mnv-autos-clientes/data';
import { VehiclePriceSummaryComponent } from '@mnv-autos-clientes/ui';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
    selector: 'lib-step-p18-coberturas-opcionales',
    imports: [BalButton, BalCard, BalCardContent, BalCheckbox, BalHeading, BalIcon, BalTooltip, VehiclePriceSummaryComponent, TranslocoDirective],
    templateUrl: './step-p18-coberturas-opcionales.component.html',
    host: { class: 'w-full' }
})
export class Step18CoberturasOpcionales {
    private readonly navigation = inject(InsuranceNavigationService);
    protected readonly state = inject(InsuranceStateService);
    private readonly coberturasService = inject(P18CoberturasOpcionalesService);
    protected readonly coberturas = this.coberturasService.coberturas;
    protected readonly seleccionadas = this.coberturasService.seleccionadas;
    private readonly coberturasTarificadas = signal<string[]>([]);
    private readonly precioTarificado = signal<number | null>(null);
    protected readonly recalculando = signal(false);
    protected readonly coberturaExpandida = signal<string | null>(null);
    protected readonly modalidad = computed(() => this.state.formData().modalidadSeleccionada ?? null);
    protected readonly requiereRecalculo = computed(() => this.seleccionadas().join('|') !== this.coberturasTarificadas().join('|'));
    protected readonly precio = computed(() => this.precioTarificado() ?? this.modalidad()?.primaTotal ?? 0);
    protected readonly literalBoton = computed(() => this.recalculando() ? 'Recalculando...' : this.requiereRecalculo() ? 'Recalcular' : 'Siguiente');

    constructor() {
        this.coberturasService.cargarCoberturas(this.state.formData().coberturasOpcionalesSeleccionadas);
    }

    protected cambiarCobertura(cobertura: CoberturaOpcional, event: Event): void {
        const marcada = Boolean(parseCustomEvent(event));
        this.coberturasService.cambiarSeleccion(cobertura.codigo, marcada);
        this.state.saveData({ coberturasOpcionalesSeleccionadas: this.seleccionadas() });
    }

    protected estaSeleccionada(cobertura: CoberturaOpcional): boolean {
        return this.coberturasService.estaSeleccionada(cobertura.codigo);
    }

    protected estaExpandida(cobertura: CoberturaOpcional): boolean {
        return this.coberturaExpandida() === cobertura.codigo;
    }

    protected alternarDetalle(cobertura: CoberturaOpcional): void {
        this.coberturaExpandida.update((actual) => actual === cobertura.codigo ? null : cobertura.codigo);
    }

    protected volver(): void { this.navigation.back(); }

    protected avanzar(): void {
        if (this.recalculando()) return;
        if (this.requiereRecalculo()) {
            this.recalculando.set(true);
            const modalidad = this.modalidad();
            const precioRecalculado = (modalidad?.primaTotal ?? 0) + this.coberturasSeleccionadas().reduce((total, cobertura) => total + cobertura.precio, 0);
            if (modalidad) this.state.saveData({ modalidadSeleccionada: { ...modalidad, primaTotal: precioRecalculado } });
            setTimeout(() => {
                this.precioTarificado.set(precioRecalculado);
                this.coberturasTarificadas.set([...this.seleccionadas()]);
                this.recalculando.set(false);
            }, 250);
            return;
        }
        this.navigation.next();
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

    private coberturasSeleccionadas(): CoberturaOpcional[] {
        return this.coberturasService.coberturaSeleccionadas();
    }
}
