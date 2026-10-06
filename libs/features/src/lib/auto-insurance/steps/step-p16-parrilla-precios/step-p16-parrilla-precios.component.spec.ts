import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP16ParrillaPreciosComponent } from './step-p16-parrilla-precios.component';

describe('StepP16ParrillaPreciosComponent', () => {
	let component: StepP16ParrillaPreciosComponent;
	let fixture: ComponentFixture<StepP16ParrillaPreciosComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP16ParrillaPreciosComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP16ParrillaPreciosComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
