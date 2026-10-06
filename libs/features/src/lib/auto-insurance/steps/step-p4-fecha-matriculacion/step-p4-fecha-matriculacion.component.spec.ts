import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP4FechaMatriculacionComponent } from './step-p4-fecha-matriculacion.component';

describe('StepP4FechaMatriculacionComponent', () => {
	let component: StepP4FechaMatriculacionComponent;
	let fixture: ComponentFixture<StepP4FechaMatriculacionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP4FechaMatriculacionComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP4FechaMatriculacionComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
