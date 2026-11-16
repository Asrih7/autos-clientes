import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP2MarcasComponent } from './step-p2-marcas.component';

describe('StepP2MarcasComponent', () => {
	let component: StepP2MarcasComponent;
	let fixture: ComponentFixture<StepP2MarcasComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP2MarcasComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP2MarcasComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
