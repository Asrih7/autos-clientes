import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP13PartesComponent } from './step-p13-partes.component';

describe('StepP13PartesComponent', () => {
	let component: StepP13PartesComponent;
	let fixture: ComponentFixture<StepP13PartesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP13PartesComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP13PartesComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
