import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { InsuranceFlowService } from '../navigation/insurance-flow.service';
import { WizardStep } from '../navigation/insurance-flow.service';

/**
 * Protege la navegación entre los pasos del flujo.
 *
 * Valida si el paso solicitado puede visitarse y, en caso contrario,
 * redirige al primer paso pendiente del flujo.
 */
export const wizardGuard: CanActivateFn = (route) => {
    const router = inject(Router);
    const flowService = inject(InsuranceFlowService);

    // Obtiene el paso asociado a la ruta actual.
    const path = route.routeConfig?.path as WizardStep | undefined;

    // Si la ruta no corresponde a un paso válido,
    // redirige al inicio del flujo.
    if (!path) {
        return router.createUrlTree(['/tu-cliente']);
    }

    // Determina si es necesario redirigir al usuario.
    const redirectStep = flowService.getRedirectStep(path);

    if (redirectStep) {
        return router.createUrlTree([`/${redirectStep}`]);
    }

    // Permite la navegación cuando el acceso es válido.
    return true;
};