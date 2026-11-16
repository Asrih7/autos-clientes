import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step18CoberturasOpcionales } from './step-p18-coberturas-opcionales.component';

describe('Step18CoberturasOpcionales', () => {
    let component: Step18CoberturasOpcionales;
    let fixture: ComponentFixture<Step18CoberturasOpcionales>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Step18CoberturasOpcionales]
        }).compileComponents();

        fixture = TestBed.createComponent(Step18CoberturasOpcionales);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
