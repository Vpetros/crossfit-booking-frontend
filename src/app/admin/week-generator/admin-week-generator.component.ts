import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminWodsApi } from '../../core/api/admin-wods.api';

@Component({
  selector: 'app-admin-week-generator',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './admin-week-generator.component.html',
  styleUrls: ['./admin-week-generator.component.css'],
})
export class AdminWeekGeneratorComponent {
  private readonly adminApi = inject(AdminWodsApi);
  private readonly snackBar = inject(MatSnackBar);

  generatingCurrent = false;
  generatingNext = false;

  generateCurrentWeek(): void {
    this.generatingCurrent = true;

    this.adminApi.generateCurrentWeek().subscribe({
      next: () => {
        this.generatingCurrent = false;
        this.showSuccess('Current week generated (missing slots only)');
      },
      error: (err: unknown) => {
        this.generatingCurrent = false;
        console.error(err);
        this.showError(this.extractErrorMessage(err) ?? 'Generate current week failed');
      },
    });
  }

  generateNextWeek(): void {
    this.generatingNext = true;

    this.adminApi.generateNextWeek().subscribe({
      next: () => {
        this.generatingNext = false;
        this.showSuccess('Next week generated');
      },
      error: (err: unknown) => {
        this.generatingNext = false;
        console.error(err);
        this.showError(this.extractErrorMessage(err) ?? 'Generate next week failed');
      },
    });
  }

  private extractErrorMessage(err: unknown): string | null {
    const e: any = (err as any)?.error;
    if (!e) return null;
    if (typeof e === 'string') return e;
    if (typeof e?.message === 'string') return e.message;
    return null;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 2500,
      panelClass: ['snackbar-success'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar-error'],
    });
  }
}