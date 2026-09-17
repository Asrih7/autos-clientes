import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoTarificacionComponent } from './auto-tarificacion.component';

describe('AutoTarificacionComponent', () => {
	let component: AutoTarificacionComponent;
	let fixture: ComponentFixture<AutoTarificacionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [AutoTarificacionComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(AutoTarificacionComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
