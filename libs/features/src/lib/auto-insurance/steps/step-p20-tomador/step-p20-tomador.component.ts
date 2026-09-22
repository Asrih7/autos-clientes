import { Component } from '@angular/core';
import { StepDatosPersonaRolComponent } from '../shared/step-datos-persona-rol/step-datos-persona-rol.component';

@Component({
	selector: 'lib-step-p20-tomador',
	host: { class: 'w-full' },
	imports: [StepDatosPersonaRolComponent],
	templateUrl: './step-p20-tomador.component.html'
})
export class StepP20TomadorComponent {}
