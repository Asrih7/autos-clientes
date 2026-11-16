import { Component } from '@angular/core';
import { StepDatosPersonaRolComponent } from '../shared/step-datos-persona-rol/step-datos-persona-rol.component';

@Component({
	selector: 'lib-step-p27-propietario',
	host: { class: 'w-full' },
	imports: [StepDatosPersonaRolComponent],
	templateUrl: './step-p27-propietario.component.html'
})
export class StepP27PropietarioComponent {}
