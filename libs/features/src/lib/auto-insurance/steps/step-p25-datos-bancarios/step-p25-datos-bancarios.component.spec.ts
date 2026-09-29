import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP25DatosBancariosComponent } from './step-p25-datos-bancarios.component';

describe('StepP25DatosBancariosComponent', () => {
    let component: StepP25DatosBancariosComponent;
    let fixture: ComponentFixture<StepP25DatosBancariosComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP25DatosBancariosComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP25DatosBancariosComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
