import { Injectable, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GlobalInsuranceStore } from '@mnv-autos/data';
import { filter, map } from 'rxjs';

export const WIZARD_STEPS = [
	'tu-cliente',
	'vehiculos',
	'conductores',
	'primas-y-coberturas',
	'produccion'
] as const;

export type WizardStep = typeof WIZARD_STEPS[number];

@Injectable({
	providedIn: 'root'
})
export class InsuranceFlowService {
	private readonly router = inject(Router);
	private readonly store = inject(GlobalInsuranceStore);
	/**
	 * Secuencia pública de los pasos para que los componentes puedan consultarla.
	 */
	public readonly stepsSequence = WIZARD_STEPS;

    /**
     * Reglas de acceso para cada paso del flujo.
     * Cada paso requiere que el anterior esté completado.
     */
    private readonly accessRules: Record<WizardStep, () => boolean> = {
        'tu-cliente': () => true,
        'vehiculos': () => this.store.isClienteComplete(),
        'conductores': () => this.store.isVehiculoComplete(),
        'primas-y-coberturas': () => this.store.isConductoresComplete(),
        'produccion': () => this.store.isPrimasCoberturasComplete()
    };

	/**
	 * Señal reactiva que contiene la URL activa del navegador limpia de redirecciones.
	 */
	private readonly currentUrl = toSignal(
		this.router.events.pipe(
			filter((e): e is NavigationEnd => e instanceof NavigationEnd),
			map((e) => e.urlAfterRedirects)
		),
		{ initialValue: this.router.url }
	);

	/**
	 * Señal computada que indica el nombre del paso actual basándose en la URL.
	 */
	public readonly activeRouteStep = computed<WizardStep>(() => {
		const url = this.currentUrl();
		const cleanSegment = url.split('/').filter(Boolean)[0] as WizardStep;
		return cleanSegment || 'tu-cliente';
	});

	/**
	 * Señal computada que indica si los datos de la página actual son válidos.
	 * 
	 * Evalúa el paso actual buscando cuál es el siguiente paso en la secuencia,
	 * ya que las reglas de 'accessRules' definen la validez de la página anterior.
	 */
	public readonly isCurrentPageValid = computed<boolean>(() => {
		const currentStep = this.activeRouteStep();
		
		// 1. Buscamos la posición de la página actual en la secuencia lineal
		const currentIndex = this.stepsSequence.indexOf(currentStep);
		
		// 2. Si es la última página ('produccion'), su validez depende del estado final del flujo
		if (currentIndex === this.stepsSequence.length - 1) {
			return this.store.isFinalFlowComplete();
		}

		// 3. Para las demás páginas, miramos la regla de acceso del paso que viene inmediatamente después
		const nextStep = this.stepsSequence[currentIndex + 1];
		return this.accessRules[nextStep]?.() ?? false;
	});

    /**
     * Comprueba si el usuario puede acceder al paso indicado
     * según el estado actual del flujo.
     *
     * @param step Paso que se desea validar.
     * @returns `true` si el paso es accesible; en caso contrario `false`.
     */
    public canAccess(step: WizardStep): boolean {
        return this.accessRules[step]?.() ?? false;
    }

    /**
     * Obtiene el primer paso pendiente al que debe redirigirse el usuario.
     *
     * Si el paso solicitado es accesible, no se requiere redirección.
     * En caso contrario, se devuelve el primer paso bloqueado del flujo.
     *
     * @param step Paso solicitado por el usuario.
     * @returns El paso de destino para la redirección o `null` si el acceso es válido.
     */
    public getRedirectStep(step: WizardStep): WizardStep | null {
		if (this.canAccess(step)) {
			return null;
		}

        if (!this.store.isClienteComplete()) {
            return 'tu-cliente';
        }

        if (!this.store.isVehiculoComplete()) {
            return 'vehiculos';
        }

        if (!this.store.isConductoresComplete()) {
            return 'conductores';
        }

        if (!this.store.isPrimasCoberturasComplete()) {
            return 'primas-y-coberturas';
        }

		return 'tu-cliente';
	}
}