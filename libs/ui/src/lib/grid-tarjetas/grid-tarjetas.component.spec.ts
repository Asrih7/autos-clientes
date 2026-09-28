import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridTarjetasComponent } from './grid-tarjetas.component';

describe('GridTarjetasComponent', () => {
	let component: GridTarjetasComponent;
	let fixture: ComponentFixture<GridTarjetasComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GridTarjetasComponent]
		}).compileComponents();

		fixture = TestBed.createComponent(GridTarjetasComponent);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
