import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';

import { AdminWeekGeneratorComponent } from './week-generator/admin-week-generator.component';
import { AdminWodEditorComponent } from './wod-editor/admin-wod-editor.component';
import { AdminReservationsComponent } from './reservations/admin-reservations.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    AdminWeekGeneratorComponent,
    AdminWodEditorComponent,
    AdminReservationsComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  @ViewChild(AdminReservationsComponent)
  reservationsComp?: AdminReservationsComponent;

  onTabChange(e: MatTabChangeEvent): void {
    if (e.tab.textLabel === 'Reservations') {
      // Auto-load reservations
      this.reservationsComp?.ensureLoaded();
    }
  }
}