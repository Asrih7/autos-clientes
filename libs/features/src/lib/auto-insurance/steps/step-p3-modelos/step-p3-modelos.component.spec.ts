import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP3ModelosComponent } from './step-p3-modelos.component';

describe('StepP3ModelosComponent', () => {
	let component: StepP3ModelosComponent;
	let fixture: ComponentFixture<StepP3ModelosComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP3ModelosComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP3ModelosComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
