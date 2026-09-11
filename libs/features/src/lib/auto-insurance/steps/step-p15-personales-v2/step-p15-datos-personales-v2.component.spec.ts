import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP15DatosPersonalesV2Component } from './step-p15-datos-personales-v2.component';

describe('StepP15DatosPersonalesV2Component', () => {
	let component: StepP15DatosPersonalesV2Component;
	let fixture: ComponentFixture<StepP15DatosPersonalesV2Component>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP15DatosPersonalesV2Component]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP15DatosPersonalesV2Component);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
