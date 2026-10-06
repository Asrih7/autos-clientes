import { Component } from '@angular/core';
import { StepDatosPersonaRolComponent } from '../shared/step-datos-persona-rol/step-datos-persona-rol.component';

@Component({
	selector: 'lib-step-p28-conductor',
	host: { class: 'w-full' },
	imports: [StepDatosPersonaRolComponent],
	templateUrl: './step-p28-conductor.component.html'
})
export class StepP28ConductorComponent {}
