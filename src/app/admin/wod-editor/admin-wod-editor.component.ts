import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminWodsApi } from '../../core/api/admin-wods.api';
import { WodScheduleDto } from '../../core/api/models';

type DayVm = {
  date: string;
  label: string; // Mon, Tue...
};

@Component({
  selector: 'app-admin-wod-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-wod-editor.component.html',
  styleUrls: ['./admin-wod-editor.component.css'],
})
export class AdminWodEditorComponent {
  private readonly api = inject(AdminWodsApi);
  private readonly snack = inject(MatSnackBar);

  loading = false;
  error: string | null = null;

  schedules: WodScheduleDto[] = [];
  days: DayVm[] = [];
  selectedDate: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.api.getCurrentWeek().subscribe({
      next: (res) => {
        this.schedules = res ?? [];
        this.days = this.buildDays(this.schedules);

        if (this.schedules.length === 0) {
          this.error = 'No schedules found for current week.';
          this.selectedDate = null;
          this.loading = false;
          return;
        }

        // default selection: keep selected if exists, else first day
        this.selectedDate =
          this.selectedDate && this.days.some((d) => d.date === this.selectedDate)
            ? this.selectedDate
            : this.days[0]?.date ?? null;

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = 'Failed to load WOD schedules';
      },
    });
  }

  selectDay(date: string): void {
    this.selectedDate = date;
  }

  slotsForSelectedDay(): WodScheduleDto[] {
    if (!this.selectedDate) return [];
    return (this.schedules ?? [])
      .filter((s) => s.date === this.selectedDate)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }

  save(s: WodScheduleDto): void {
    const desc = (s.workoutDescription ?? '').trim();

    this.api
      .updateWod({
        date: s.date,
        startTime: s.startTime,
        workoutDescription: desc,
      })
      .subscribe({
        next: () => {
          this.snack.open('WOD updated', 'OK', {
            duration: 2000,
            panelClass: ['snackbar-success'],
          });
          this.load();
        },
        error: (err) => {
          console.error(err);
          const msg = err?.error?.message || 'Failed to update WOD';
          this.snack.open(msg, 'Close', {
            duration: 3500,
            panelClass: ['snackbar-error'],
          });
        },
      });
  }

  // -------- UI helpers --------

  timeLabel(startTime?: string, endTime?: string): string {
    return `${this.hhmm(startTime)} - ${this.hhmm(endTime)}`;
  }

  private hhmm(t?: string): string {
    if (!t) return '';
    return t.length >= 5 ? t.slice(0, 5) : t;
  }

  private buildDays(schedules: WodScheduleDto[]): DayVm[] {
    const uniq = Array.from(new Set((schedules ?? []).map((s) => s.date))).sort();
    return uniq.map((date) => ({
      date,
      label: this.dayLabel(date),
    }));
  }

  private dayLabel(dateIso: string): string {
    const d = new Date(dateIso + 'T00:00:00');
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return names[d.getDay()];
  }
}