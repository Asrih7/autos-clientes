import { Routes } from '@angular/router';
import { insuranceFlowGuard } from '@mnv-autos-clientes/core';

export const AUTO_INSURANCE_ROUTES: Routes = [
	{
		path: '',
		loadComponent: () =>
			import('./auto-tarificacion/auto-tarificacion.component').then((m) => m.AutoTarificacionComponent),
		children: [
			{ path: '', redirectTo: 'busqueda', pathMatch: 'full' },
			{
				path: 'next',
				children: [],
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'busqueda',
				loadComponent: () =>
					import('./steps/step-p1-busqueda/step-p1-busqueda.component').then((m) => m.StepP1BusquedaComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'marca',
				loadComponent: () =>
					import('./steps/step-p2-marcas/step-p2-marcas.component').then((m) => m.StepP2MarcasComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'modelo',
				loadComponent: () =>
					import('./steps/step-p3-modelos/step-p3-modelos.component').then((m) => m.StepP3ModelosComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'fecha-matriculacion',
				loadComponent: () =>
					import('./steps/step-p4-fecha-matriculacion/step-p4-fecha-matriculacion.component').then(
						(m) => m.StepP4FechaMatriculacionComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'caracteristicas',
				loadComponent: () =>
					import('./steps/step-p5-caracteristicas/step-p5-caracteristicas.component').then(
						(m) => m.StepP5CaracteristicasComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'versiones',
				loadComponent: () =>
					import('./steps/step-p6-versiones/step-p6-versiones.component').then((m) => m.StepP6VersionesComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'fecha-primera-matriculacion',
				loadComponent: () =>
					import('./steps/step-p7-fecha-primera-mat/step-p7-fecha-primera-mat.component').then(
						(m) => m.StepP7FechaPrimeraMatComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'fecha-nacimiento',
				loadComponent: () =>
					import('./steps/step-p8-fecha-nacimiento/step-p8-fecha-nacimiento.component').then(
						(m) => m.StepP8FechaNacimientoComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'anos-carnet',
				loadComponent: () =>
					import('./steps/step-p9-anos-carnet/step-p9-anos-carnet.component').then((m) => m.StepP9AnosCarnetComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'tiene-aseguradora',
				loadComponent: () =>
					import('./steps/step-p10-tiene-aseguradora/step-p10-tiene-aseguradora.component').then(
						(m) => m.StepP10TieneAseguradoraComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'lista-aseguradoras',
				loadComponent: () =>
					import('./steps/step-p11-lista-aseguradoras/step-p11-lista-aseguradoras.component').then(
						(m) => m.StepP11ListaAseguradorasComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'anos-asegurado',
				loadComponent: () =>
					import('./steps/step-p12-anos-asegurado/step-p12-anos-asegurado.component').then(
						(m) => m.StepP12AnosAseguradoComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'historial-partes',
				loadComponent: () =>
					import('./steps/step-p13-partes/step-p13-partes.component').then((m) => m.StepP13PartesComponent),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'datos-personales',
				loadComponent: () =>
					import('./steps/step-p14-personales/step-p14-datos-personales.component').then(
						(m) => m.StepP14DatosPersonalesComponent
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'datos-contacto',
				loadComponent: () =>
					import('./steps/step-p15-personales-v2/step-p15-datos-personales-v2.component').then(
						(m) => m.StepP15DatosPersonalesV2Component
					),
				canActivate: [insuranceFlowGuard]
			},
			{
				path: 'precios',
				loadComponent: () =>
					import('./steps/step-p16-parrilla-precios/step-p16-parrilla-precios.component').then(
						(m) => m.StepP16ParrillaPreciosComponent
					),
				canActivate: [insuranceFlowGuard]
			}
		]
	}
];
