import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP21MatriculaComponent } from './step-p21-matricula.component';

describe('StepP21MatriculaComponent', () => {
    let component: StepP21MatriculaComponent;
    let fixture: ComponentFixture<StepP21MatriculaComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP21MatriculaComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP21MatriculaComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
