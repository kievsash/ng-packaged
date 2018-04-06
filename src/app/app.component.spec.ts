import { TestBed, async } from '@angular/core/testing';
import { NgxMaskedPhoneInputModule } from '../../my-lib/src/lib.module';
import { PhoneNumberComponent } from '../../my-lib/src/public_api';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgxMaskedPhoneInputModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [
                AppComponent
            ],
        }).compileComponents();
    }));

    it('should create the app', async(() => {
        const fixture = TestBed
            .overrideComponent(PhoneNumberComponent, {
                set: {
                    template: '<span>PhoneNumberComponent</span>'
                }
            })
            .createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

});
