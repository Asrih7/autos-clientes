import { Component, inject } from '@angular/core';
import { BalButton } from '@baloise/ds-angular';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';

@Component({
    selector: 'lib-step-p18-coberturas-opcionales',
    imports: [BalButton],
    templateUrl: './step-p18-coberturas-opcionales.component.html',
    styleUrl: './step-p18-coberturas-opcionales.component.scss'
})
export class Step18CoberturasOpcionales {
    private navigation = inject(InsuranceNavigationService);

    avanzar() {
        this.navigation.next();
    }
}
