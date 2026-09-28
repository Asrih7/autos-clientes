import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP8FechaNacimientoComponent } from './step-p8-fecha-nacimiento.component';

describe('StepP8FechaNacimientoComponent', () => {
	let component: StepP8FechaNacimientoComponent;
	let fixture: ComponentFixture<StepP8FechaNacimientoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP8FechaNacimientoComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP8FechaNacimientoComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
