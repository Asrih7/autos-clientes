import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP14DatosPersonalesComponent } from './step-p14-datos-personales.component';

describe('StepP14DatosPersonalesComponent', () => {
	let component: StepP14DatosPersonalesComponent;
	let fixture: ComponentFixture<StepP14DatosPersonalesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP14DatosPersonalesComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP14DatosPersonalesComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
