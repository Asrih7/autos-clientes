import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP6VersionesComponent } from './step-p6-versiones.component';

describe('StepP6VersionesComponent', () => {
	let component: StepP6VersionesComponent;
	let fixture: ComponentFixture<StepP6VersionesComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP6VersionesComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP6VersionesComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
