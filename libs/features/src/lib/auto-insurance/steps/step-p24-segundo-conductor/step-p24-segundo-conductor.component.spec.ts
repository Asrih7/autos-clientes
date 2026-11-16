import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP24SegundoConductorComponent } from './step-p24-segundo-conductor.component'

describe('StepP24SegundoConductorComponent', () => {
    let component: StepP24SegundoConductorComponent;
    let fixture: ComponentFixture<StepP24SegundoConductorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP24SegundoConductorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP24SegundoConductorComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
