import { Component, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import { DatosPersona, DatosPersonaField, validarDatosPersona } from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p14-datos-personales',
	host: { class: 'w-full' },
	imports: [BalButton, DatosPersonaComponent, TranslocoDirective],
	templateUrl: './step-p14-datos-personales.component.html',
	styleUrl: './step-p14-datos-personales.component.scss'
})
export class StepP14DatosPersonalesComponent {
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly stateService = inject(InsuranceStateService);

	protected readonly camposVisibles: readonly DatosPersonaField[] = [
		'nif',
		'direccion',
		'numero',
		'piso',
		'bloque',
		'letra'
	];
	protected readonly datos = signal<DatosPersona>(this.stateService.getDatosPersona());
	protected readonly mostrarErrores = signal(false);
	protected readonly formularioValido = signal(false);

	protected actualizarDatos(datos: DatosPersona): void {
		this.datos.set(datos);
		this.stateService.saveDatosPersona(datos);
		this.stateService.saveData({ codigoPostalVehiculo: datos.codigoPostal ?? '' });
	}

	protected avanzar(): void {
		this.mostrarErrores.set(true);
		const datosNormalizados = normalizarDatos(this.datos());
		this.actualizarDatos(datosNormalizados);
		const valido = validarDatosPersona(datosNormalizados, this.camposVisibles).valido;
		this.formularioValido.set(valido);

		if (valido) this.navigation.next();
	}
}

function normalizarDatos(datos: DatosPersona): DatosPersona {
	return {
		...datos,
		nif: datos.nif.replace(/[\s-]/g, '').toUpperCase(),
		direccion: datos.direccion.trim(),
		numero: datos.numero.trim(),
		piso: datos.piso.trim(),
		bloque: datos.bloque.trim(),
		letra: datos.letra.trim().toUpperCase()
	};
}
