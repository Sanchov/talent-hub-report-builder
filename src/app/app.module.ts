import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReportBuilderModule } from './features/report-builder/report-builder.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ControlToFormGroupPipe } from './pipes/control-to-form-group.pipe';
import { ControlArrayToFormGroupsPipe } from './pipes/control-array-to-form-groups.pipe';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReportBuilderModule,
    BrowserAnimationsModule,
    RouterModule,
    RouterOutlet,
  ],
  providers: [provideAnimationsAsync()],
  bootstrap: [AppComponent],
})
export class AppModule {}
