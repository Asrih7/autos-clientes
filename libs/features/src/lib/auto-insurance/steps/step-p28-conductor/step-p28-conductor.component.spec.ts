import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP28ConductorComponent } from './step-p28-conductor.component';

describe('StepP28ConductorComponent', () => {
    let component: StepP28ConductorComponent;
    let fixture: ComponentFixture<StepP28ConductorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP28ConductorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP28ConductorComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
