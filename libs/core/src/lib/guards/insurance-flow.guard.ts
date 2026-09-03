import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { WizardStep } from '@mnv-autos-clientes/shared';
import { InsuranceFlowService } from '../services/insurance-flow.service';
import { InsuranceNavigationService } from '../navigation/insurance-navigation.service';

export const insuranceFlowGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);
	const flowService = inject(InsuranceFlowService);
	const navigationService = inject(InsuranceNavigationService);
	const stateService = inject(InsuranceStateService);
	const path = route.routeConfig?.path as WizardStep | 'next' | undefined;

	if (!path) return router.createUrlTree(['/autos/busqueda']);

	if (path === 'next') {
		const currentStep = navigationService.currentStep();

		if (!flowService.canContinue(currentStep)) {
			return router.createUrlTree([`/autos/${currentStep}`]);
		}

		return router.createUrlTree([`/autos/${flowService.getNextStep(currentStep)}`]);
	}

	if (!stateService.activeStepsMap().includes(path)) {
		const fallbackStep = stateService.activeStepsMap().includes(navigationService.currentStep())
			? navigationService.currentStep()
			: 'busqueda';
		return router.createUrlTree([`/autos/${fallbackStep}`]);
	}

	const redirectStep = flowService.getAccessRedirect(path);
	if (redirectStep) return router.createUrlTree([`/autos/${redirectStep}`]);

	navigationService.setStepFromGuard(path);
	return true;
};
