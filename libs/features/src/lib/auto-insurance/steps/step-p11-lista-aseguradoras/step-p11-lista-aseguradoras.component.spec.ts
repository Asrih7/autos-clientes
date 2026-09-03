import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP11ListaAseguradorasComponent } from './step-p11-lista-aseguradoras.component';

describe('StepP11ListaAseguradorasComponent', () => {
	let component: StepP11ListaAseguradorasComponent;
	let fixture: ComponentFixture<StepP11ListaAseguradorasComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [StepP11ListaAseguradorasComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(StepP11ListaAseguradorasComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
