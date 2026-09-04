import { Route } from '@angular/router';
import { HeOCPSSOAuthGuardService } from '@archit-lib-helvetiang/core/ocp-sso';

export const appRoutes: Route[] = [
	{
		path: 'autos',
		canActivate: [HeOCPSSOAuthGuardService],
		loadChildren: () => import('@mnv-autos-clientes/features').then((m) => m.AUTO_INSURANCE_ROUTES)
	},
	{
		path: '',
		redirectTo: 'autos',
		pathMatch: 'full'
	},
	{
		path: '**',
		redirectTo: 'autos'
	}
];
