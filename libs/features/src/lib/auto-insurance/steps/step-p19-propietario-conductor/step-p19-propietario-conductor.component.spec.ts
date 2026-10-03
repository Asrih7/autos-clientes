import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { InsuranceNavigationService } from '@mnv-autos-clientes/core';
import { AutoInsuranceApiService, InsuranceStateService } from '@mnv-autos-clientes/data';
import { StepP19PropietarioConductorComponent } from './step-p19-propietario-conductor.component';

describe('StepP19PropietarioConductorComponent', () => {
	let stateService: InsuranceStateService;
	let navigation: { back: ReturnType<typeof vi.fn>; next: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		sessionStorage.clear();
		navigation = { back: vi.fn(), next: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [
				StepP19PropietarioConductorComponent,
				TranslocoTestingModule.forRoot({
					langs: { es: translations() },
					translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
					preloadLangs: true
				})
			],
			providers: [
				{ provide: InsuranceNavigationService, useValue: navigation },
				{ provide: AutoInsuranceApiService, useValue: { limpiarCache: vi.fn() } }
			]
		}).compileComponents();

		stateService = TestBed.inject(InsuranceStateService);
	});

	it('restores both answers and renders the vehicle summary', () => {
		stateService.saveData({
			esTomadorConductorPrincipal: false,
			esTomadorPropietarioVehiculo: true,
			matricula: '1234ABC'
		});
		const { access, fixture } = createComponent();

		expect(access.esTomadorConductorPrincipal()).toBe(false);
		expect(access.esTomadorPropietarioVehiculo()).toBe(true);
		expect(access.puedeContinuar()).toBe(true);
		expect(fixture.nativeElement.textContent).toContain('¿Es el tomador el conductor principal?');
		expect(fixture.nativeElement.querySelector('lib-vehicle-price-summary')).not.toBeNull();
	});

	it('persists answers and only advances after answering both questions', () => {
		const { access } = createComponent();

		access.continuar();
		expect(navigation.next).not.toHaveBeenCalled();

		access.seleccionarTomadorConductorPrincipal(false);
		expect(stateService.formData().esTomadorConductorPrincipal).toBe(false);
		access.continuar();
		expect(navigation.next).not.toHaveBeenCalled();

		access.seleccionarTomadorPropietarioVehiculo(true);
		expect(stateService.formData().esTomadorPropietarioVehiculo).toBe(true);
		access.continuar();
		expect(navigation.next).toHaveBeenCalledOnce();
	});

	it('navigates back to the previous step', () => {
		const { access } = createComponent();

		access.volver();

		expect(navigation.back).toHaveBeenCalledOnce();
	});

	function createComponent(): {
		fixture: ComponentFixture<StepP19PropietarioConductorComponent>;
		access: {
			esTomadorConductorPrincipal: () => boolean | null;
			esTomadorPropietarioVehiculo: () => boolean | null;
			puedeContinuar: () => boolean;
			seleccionarTomadorConductorPrincipal: (respuesta: boolean) => void;
			seleccionarTomadorPropietarioVehiculo: (respuesta: boolean) => void;
			continuar: () => void;
			volver: () => void;
		};
	} {
		const fixture = TestBed.createComponent(StepP19PropietarioConductorComponent);
		fixture.detectChanges();
		const access = fixture.componentInstance as unknown as {
			esTomadorConductorPrincipal: () => boolean | null;
			esTomadorPropietarioVehiculo: () => boolean | null;
			puedeContinuar: () => boolean;
			seleccionarTomadorConductorPrincipal: (respuesta: boolean) => void;
			seleccionarTomadorPropietarioVehiculo: (respuesta: boolean) => void;
			continuar: () => void;
			volver: () => void;
		};
		return { fixture, access };
	}
});

function translations(): Record<string, unknown> {
	return {
		tarificacion: {
			p19: {
				title: 'Contratación online de tu seguro de coche',
				subtitle: 'Te queda muy poco para disfrutar de Caser Auto.',
				form_title: 'Relación del tomador con el vehículo',
				registration: 'Matrícula',
				modality: 'Modalidad seleccionada',
				conductor_question: '¿Es el tomador el conductor principal?',
				owner_question: '¿Es el tomador el propietario del vehículo?',
				yes: 'Sí',
				no: 'No'
			}
		}
	};
}
