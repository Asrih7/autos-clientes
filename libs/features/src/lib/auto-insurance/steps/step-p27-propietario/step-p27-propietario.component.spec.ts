import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP27PropietarioComponent } from './step-p27-propietario.component';

describe('StepP27PropietarioComponent', () => {
    let component: StepP27PropietarioComponent;
    let fixture: ComponentFixture<StepP27PropietarioComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP27PropietarioComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP27PropietarioComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
