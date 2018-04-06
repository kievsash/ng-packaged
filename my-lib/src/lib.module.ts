import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhoneNumberComponent } from './phone-number/phone-number.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    PhoneNumberComponent
  ],
  exports: [
    PhoneNumberComponent
  ]
})
export class NgxMaskedPhoneInputModule {
}
