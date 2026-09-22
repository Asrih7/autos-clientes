import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP12AnosAseguradoComponent } from './step-p12-anos-asegurado.component';

describe('StepP12AnosAseguradoComponent', () => {
	let component: StepP12AnosAseguradoComponent;
	let fixture: ComponentFixture<StepP12AnosAseguradoComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP12AnosAseguradoComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP12AnosAseguradoComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
