import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { WeekFacade } from './services/week.facade';
import { WeekState } from './models/week.models';
import { normalizeTime, parseDateTimeLocal } from './utils/date-time.utils';
import { WodScheduleDto } from '../core/api/models';

@Component({
  selector: 'app-week',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css'],
})
export class WeekComponent {
  private readonly facade = inject(WeekFacade);
  private readonly snackBar = inject(MatSnackBar);

  state$ = this.facade.state$;

  ngOnInit(): void {
    this.facade.load();
  }

  refresh(): void {
    this.facade.load();
  }

  selectDay(date: string): void {
    this.facade.setSelectedDate(date);
  }

  selectedDay(state: WeekState) {
    if (!state.selectedDate) return null;
    return state.days.find((d) => d.date === state.selectedDate) ?? null;
  }

  // ---- UI ----

  slotLabel(s: WodScheduleDto): string {
    return `${normalizeTime(s.startTime)} - ${normalizeTime(s.endTime)}`;
  }

  availableSpots(s: WodScheduleDto): number {
    return Math.max(0, (s.capacity ?? 0) - (s.bookedCount ?? 0));
  }

  isClosed(s: WodScheduleDto): boolean {
    return !s.workoutDescription || s.workoutDescription.trim().length === 0;
  }

  isFull(s: WodScheduleDto): boolean {
    return this.availableSpots(s) <= 0;
  }

  isBooked(state: WeekState, s: WodScheduleDto): boolean {
    return state.bookingByScheduleId.has(s.id);
  }

  hasBookingSameDay(state: WeekState, s: WodScheduleDto): boolean {
    const b = state.bookingByDate.get(s.date);
    return !!b && b.wodScheduleId !== s.id;
  }

  isPastSlot(s: WodScheduleDto): boolean {
    const now = new Date();
    const start = parseDateTimeLocal(s.date, s.startTime);
    return start.getTime() <= now.getTime();
  }

  canBook(state: WeekState, s: WodScheduleDto): boolean {
    return (
      !this.isClosed(s) &&
      !this.isFull(s) &&
      !this.isPastSlot(s) &&
      !this.hasBookingSameDay(state, s) &&
      !this.isBooked(state, s) &&
      !state.pendingScheduleIds.has(s.id)
    );
  }

  canCancel(state: WeekState, s: WodScheduleDto): boolean {
    return this.isBooked(state, s) && !state.pendingScheduleIds.has(s.id);
  }


  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      panelClass: ['snackbar-error'],
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 2500,
      panelClass: ['snackbar-success'],
    });
  }

  private extractErrorMessage(err: any): string {
    const e = err?.error;
    if (!e) return 'Request failed';
    if (typeof e === 'string') return e;
    if (typeof e?.message === 'string') return e.message;
    return 'Request failed';
  }

  // ---- Actions ----

  book(s: WodScheduleDto): void {
    this.facade.book(s.id).subscribe({
      next: () => {
        this.showSuccess('Booking successful');
        this.facade.load();
      },
      error: (err) => {
        console.error(err);
        this.showError(this.extractErrorMessage(err));
      },
    });
  }

  cancel(state: WeekState, s: WodScheduleDto): void {
    const booking = state.bookingByScheduleId.get(s.id);
    if (!booking) return;

    this.facade.cancel(s.id, booking.id).subscribe({
      next: () => {
        this.showSuccess('Booking cancelled');
        this.facade.load();
      },
      error: (err) => {
        console.error(err);
        this.showError(this.extractErrorMessage(err));
      },
    });
  }
}