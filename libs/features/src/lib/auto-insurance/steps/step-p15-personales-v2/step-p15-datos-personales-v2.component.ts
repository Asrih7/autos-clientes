import { Component, inject, signal } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { TranslocoDirective } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { InsuranceStateService } from '@mnv-autos-clientes/data';
import {
	DatosPersona,
	DatosPersonaField,
	normalizarTelefonoMovil,
	validarDatosPersona
} from '@mnv-autos-clientes/shared';
import { DatosPersonaComponent } from '@mnv-autos-clientes/ui';

@Component({
	selector: 'lib-step-p15-datos-personales-v2',
	host: { class: 'w-full' },
	imports: [BalButton, DatosPersonaComponent, TranslocoDirective],
	templateUrl: './step-p15-datos-personales-v2.component.html',
	styleUrl: './step-p15-datos-personales-v2.component.scss'
})
export class StepP15DatosPersonalesV2Component {
	private readonly navigation = inject(InsuranceNavigationService);
	private readonly stateService = inject(InsuranceStateService);

	protected readonly camposVisibles: readonly DatosPersonaField[] = ['telefonoMovil', 'email', 'privacidadAceptada'];
	protected readonly datos = signal<DatosPersona>(this.stateService.getDatosPersona());
	protected readonly mostrarErrores = signal(false);
	protected readonly formularioValido = signal(false);

	protected actualizarDatos(datos: DatosPersona): void {
		this.datos.set(datos);
		this.stateService.saveDatosPersona(datos);
	}

	protected avanzar(): void {
		this.mostrarErrores.set(true);
		const datosNormalizados = {
			...this.datos(),
			telefonoMovil: normalizarTelefonoMovil(this.datos().telefonoMovil),
			email: this.datos().email.trim()
		};
		this.actualizarDatos(datosNormalizados);
		const valido = validarDatosPersona(datosNormalizados, this.camposVisibles).valido;
		this.formularioValido.set(valido);

		if (valido) this.navigation.next();
	}
}
