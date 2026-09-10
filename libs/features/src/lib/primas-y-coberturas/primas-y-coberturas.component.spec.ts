import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimasYCoberturasComponent } from './primas-y-coberturas.component';

describe('PrimasYCoberturasComponent', () => {
    let component: PrimasYCoberturasComponent;
    let fixture: ComponentFixture<PrimasYCoberturasComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PrimasYCoberturasComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PrimasYCoberturasComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
