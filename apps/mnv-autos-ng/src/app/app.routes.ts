import { Route } from '@angular/router';
import { HeOCPSSOAuthGuardService } from '@archit-lib-helvetiang/core/ocp-sso';
import { wizardGuard } from '@mnv-autos/core';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [HeOCPSSOAuthGuardService],
    loadComponent: () => import('@mnv-autos/features/shell').then((m) => m.ShellComponent),
    canActivateChild: [wizardGuard],
    children: [
      { path: '', redirectTo: 'tu-cliente', pathMatch: 'full' },
      {
        path: 'tu-cliente',
        loadComponent: () => import('@mnv-autos/features/tu-cliente').then((m) => m.TuClienteComponent)
      },
      {
        path: 'vehiculos',
        loadComponent: () => import('@mnv-autos/features/vehiculos').then((m) => m.VehiculosComponent)
      },
      {
        path: 'conductores',
        loadComponent: () => import('@mnv-autos/features/conductores').then((m) => m.ConductoresComponent)
      },
      {
        path: 'primas-y-coberturas',
        loadComponent: () => import('@mnv-autos/features/primas-y-coberturas').then((m) => m.PrimasYCoberturasComponent)
      },
      {
        path: 'produccion',
        loadComponent: () => import('@mnv-autos/features/produccion').then((m) => m.ProduccionComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

