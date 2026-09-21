import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AutoInsuranceData, InsuranceStateService } from '@mnv-autos-clientes/data';

import { InsuranceNavigationService } from './insurance-navigation.service';

describe('InsuranceNavigationService', () => {
	let service: InsuranceNavigationService;
	let stateService: {
		formData: ReturnType<typeof signal<AutoInsuranceData>>;
		canContinueFromStep: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		sessionStorage.clear();
		stateService = {
			formData: signal<AutoInsuranceData>({}),
			canContinueFromStep: vi.fn().mockReturnValue(false)
		};
		TestBed.configureTestingModule({
			providers: [
				{ provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
				{ provide: InsuranceStateService, useValue: stateService }
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
});
