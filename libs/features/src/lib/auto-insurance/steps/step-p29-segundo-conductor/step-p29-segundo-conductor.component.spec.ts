import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP29SegundoConductorComponent } from './step-p29-segundo-conductor.component';

describe('StepP29SegundoConductorComponent', () => {
    let component: StepP29SegundoConductorComponent;
    let fixture: ComponentFixture<StepP29SegundoConductorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP29SegundoConductorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP29SegundoConductorComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
