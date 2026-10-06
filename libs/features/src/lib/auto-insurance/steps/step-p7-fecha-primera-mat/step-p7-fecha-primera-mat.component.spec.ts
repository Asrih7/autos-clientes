import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP7FechaPrimeraMatComponent } from './step-p7-fecha-primera-mat.component';

describe('StepP7PrimeraMatComponent', () => {
	let component: StepP7FechaPrimeraMatComponent;
	let fixture: ComponentFixture<StepP7FechaPrimeraMatComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP7FechaPrimeraMatComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP7FechaPrimeraMatComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
