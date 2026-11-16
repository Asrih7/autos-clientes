import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { BalCard, BalCardContent } from '@baloise/ds-angular';

@Component({
	selector: 'lib-vehicle-price-summary',
	imports: [BalCard, BalCardContent, DecimalPipe],
	templateUrl: './vehicle-price-summary.component.html',
	styleUrl: './vehicle-price-summary.component.scss'
})
export class VehiclePriceSummaryComponent {
	vehicleTitle = input.required<string>();
	vehicleDetail = input('');
	registrationLabel = input('');
	registration = input('');
	modality = input.required<string>();
	amount = input.required<number>();
}