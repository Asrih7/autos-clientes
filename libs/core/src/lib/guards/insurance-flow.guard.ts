import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { P16ModalidadesService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { InsuranceFlowService } from '../services/insurance-flow.service';
import { InsuranceNavigationService } from '../navigation/insurance-navigation.service';

export const insuranceFlowGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);
	const flowService = inject(InsuranceFlowService);
	const navigationService = inject(InsuranceNavigationService);
	const modalidadesService = inject(P16ModalidadesService);
	const path = route.routeConfig?.path as WizardStep | 'next' | 'sin-precio' | undefined;

	if (!path) return router.createUrlTree(['/autos/busqueda']);

	if (path === 'next') {
		const currentStep = navigationService.currentStep();

		if (!flowService.canContinue(currentStep)) {
			return router.createUrlTree([`/autos/${currentStep}`]);
		}

		return router.createUrlTree([`/autos/${flowService.getNextStep(currentStep)}`]);
	}

	if (path === 'sin-precio') {
		const redirectStep = flowService.getAccessRedirect('precios');
		if (redirectStep) return router.createUrlTree([`/autos/${redirectStep}`]);
		if (navigationService.currentStep() !== 'precios' || !modalidadesService.sinPrecios()) {
			return router.createUrlTree(['/autos/precios']);
		}
		navigationService.setStepFromGuard(path);
		return true;
	}

	const redirectStep = flowService.getAccessRedirect(path);
	if (redirectStep) return router.createUrlTree([`/autos/${redirectStep}`]);

	const activeSteps = flowService.activeStepsMap();

	if (!activeSteps.includes(path)) {
		const fallbackStep = activeSteps.includes(navigationService.currentStep())
			? navigationService.currentStep()
			: 'busqueda';
		return router.createUrlTree([`/autos/${fallbackStep}`]);
	}

	navigationService.setStepFromGuard(path);
	return true;
};
