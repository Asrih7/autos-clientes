import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP9AnosCarnetComponent } from './step-p9-anos-carnet.component';

describe('StepP9AnosCarnetComponent', () => {
	let component: StepP9AnosCarnetComponent;
	let fixture: ComponentFixture<StepP9AnosCarnetComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP9AnosCarnetComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP9AnosCarnetComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
