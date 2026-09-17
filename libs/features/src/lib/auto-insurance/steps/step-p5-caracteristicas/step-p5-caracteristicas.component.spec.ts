import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP5CaracteristicasComponent } from './step-p5-caracteristicas.component';

describe('StepP5CaracteristicasComponent', () => {
	let component: StepP5CaracteristicasComponent;
	let fixture: ComponentFixture<StepP5CaracteristicasComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP5CaracteristicasComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP5CaracteristicasComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
