import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { InsuranceNavigationService } from '../navigation/insurance-navigation.service';
import { WizardStep } from '@mnv-autos-clientes/shared';

export const insuranceFlowGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);
	const stateService = inject(InsuranceStateService);
	const navigationService = inject(InsuranceNavigationService);

	const path = route.routeConfig?.path;
	const data = stateService.formData();
	const current = navigationService.currentStep();

	if (path !== 'busqueda' && !data.tipoFlujo) {
		return router.createUrlTree(['/autos/busqueda']);
	}

	if (path === 'next') {
		let nextStep: WizardStep = current;

		switch (current) {
			case 'busqueda':
				nextStep = data.tipoFlujo === 'MATRICULA' ? 'versiones' : 'marca';
				break;
			case 'marca':
				nextStep = 'modelo';
				break;
			case 'modelo':
				nextStep = 'fecha-matriculacion';
				break;
			case 'fecha-matriculacion':
				nextStep = 'caracteristicas';
				break;
			case 'caracteristicas':
				nextStep = 'versiones';
				break;
			case 'versiones':
				nextStep = data.tipoFlujo === 'MATRICULA' ? 'fecha-nacimiento' : 'fecha-primera-matriculacion';
				break;
			case 'fecha-primera-matriculacion':
				nextStep = 'fecha-nacimiento';
				break;
			case 'fecha-nacimiento':
				nextStep = 'anos-carnet';
				break;
			case 'anos-carnet':
				nextStep = 'tiene-aseguradora';
				break;
			case 'tiene-aseguradora':
				nextStep = data.tieneAseguradora ? 'lista-aseguradoras' : 'datos-personales';
				break;
			case 'lista-aseguradoras':
				nextStep = 'anos-asegurado';
				break;
			case 'anos-asegurado':
				nextStep = 'historial-partes';
				break;
			case 'historial-partes':
				nextStep = 'datos-personales';
				break;
			case 'datos-personales':
				nextStep = 'datos-contacto';
				break;
			case 'datos-contacto':
				nextStep = 'precios';
				break;
		}

		return router.createUrlTree([`/autos/${nextStep}`]);
	}

	navigationService.setStepFromGuard(path as WizardStep);
	return true;
};
