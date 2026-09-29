import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP10TieneAseguradoraComponent } from './step-p10-tiene-aseguradora.component';

describe('StepP10TieneAseguradoraComponent', () => {
	let component: StepP10TieneAseguradoraComponent;
	let fixture: ComponentFixture<StepP10TieneAseguradoraComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP10TieneAseguradoraComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP10TieneAseguradoraComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
