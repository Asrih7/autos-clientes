import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepP16SinPrecioComponent } from './step-p16-sin-precio.component';

describe('StepP16SinPrecioComponent', () => {
    let component: StepP16SinPrecioComponent;
    let fixture: ComponentFixture<StepP16SinPrecioComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StepP16SinPrecioComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StepP16SinPrecioComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
