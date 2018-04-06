import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NgxMaskedPhoneInputModule } from '../../my-lib/src/lib.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskedPhoneInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
