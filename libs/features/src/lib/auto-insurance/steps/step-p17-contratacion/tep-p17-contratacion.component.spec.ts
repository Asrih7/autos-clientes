import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP17ContratacionComponent } from './step-p17-contratacion.component';

describe('StepP17ContratacionComponent', () => {
    let component: StepP17ContratacionComponent;
    let fixture: ComponentFixture<StepP17ContratacionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP17ContratacionComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP17ContratacionComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
