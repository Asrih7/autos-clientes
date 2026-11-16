import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP1BusquedaComponent } from './step-p1-busqueda.component';

describe('StepP1BusquedaComponent', () => {
	let component: StepP1BusquedaComponent;
	let fixture: ComponentFixture<StepP1BusquedaComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP1BusquedaComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP1BusquedaComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
