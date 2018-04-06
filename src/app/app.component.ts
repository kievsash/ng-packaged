import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    public myForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
    }

    public ngOnInit() {
        this.myForm = this.formBuilder.group({
            myPhone: [
                '0123456789',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(11)
                ])
            ],
        });
    }

    public shouldShowErrors(control): boolean {
        return control && control.blured && control.invalid;
    }

    public setBlured(control, value) {
        control.blured = value
    }

    public isInvalidAndBlured(control) {
        return control.invalid && control.blured;
    }
}
