import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AutoInsuranceData, InsuranceStateService } from '@mnv-autos-clientes/data';

import { InsuranceNavigationService } from './insurance-navigation.service';
import { InsuranceFlowService } from '../services/insurance-flow.service';

describe('InsuranceNavigationService', () => {
	let service: InsuranceNavigationService;
	let stateService: {
		formData: ReturnType<typeof signal<AutoInsuranceData>>;
		canContinueFromStep: ReturnType<typeof vi.fn>;
	};
	let router: { navigate: ReturnType<typeof vi.fn> };
	let flowService: { getPreviousStep: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		sessionStorage.clear();
		stateService = {
			formData: signal<AutoInsuranceData>({}),
			canContinueFromStep: vi.fn().mockReturnValue(false)
		};
		router = { navigate: vi.fn().mockResolvedValue(true) };
		flowService = { getPreviousStep: vi.fn().mockReturnValue(null) };
		TestBed.configureTestingModule({
			providers: [
				{ provide: Router, useValue: router },
				{ provide: InsuranceStateService, useValue: stateService },
				{ provide: InsuranceFlowService, useValue: flowService }
			]
		});
		service = TestBed.inject(InsuranceNavigationService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it.each(['datos-personales', 'datos-contacto'] as const)(
		'should use the form validation to control forward navigation from %s',
		(step) => {
			service.setStepFromGuard(step);

			expect(service.canGoForward()).toBe(false);
			expect(stateService.canContinueFromStep).toHaveBeenCalledWith(step);

			stateService.canContinueFromStep.mockReturnValue(true);
			stateService.formData.update((data) => ({ ...data }));

			expect(service.canGoForward()).toBe(true);
		}
	);

	it('should use the dynamically resolved previous step when going back', async () => {
		service.hydrateNavigation('segundo-conductor', ['busqueda', 'propietario-conductor', 'tomador']);
		flowService.getPreviousStep.mockReturnValue('tomador');

		service.back();
		await Promise.resolve();

		expect(router.navigate).toHaveBeenCalledWith(['/autos/tomador']);
		expect(service.currentStep()).toBe('tomador');
		expect(service._navigationHistoryRaw()).toEqual(['busqueda', 'propietario-conductor']);
	});
});
