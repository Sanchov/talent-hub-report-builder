import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportBuilderComponent } from './features/report-builder/containers/report-builder/report-builder.component';

const routes: Routes = [
  { path: '', redirectTo: 'report-builder', pathMatch: 'full' },
  { path: 'report-builder', component: ReportBuilderComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
