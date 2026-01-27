import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSnackBar } from '@angular/material/snack-bar';

import { WeekFacade } from './services/week.facade';
import { WeekState } from './models/week.models';
import { WodScheduleDto } from '../core/api/models';
import { TokenStorage } from '../auth/token.storage';

import {
  normalizeTime,
  parseDateTimeLocal,
} from './utils/date-time.utils';

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

  readonly state$ = this.facade.state$;

  // Keep internal as private; expose to template via getter.
  private readonly _isUserRole = TokenStorage.getRoles().includes('ROLE_USER');

  /** Used by template to show/hide booking actions */
  get isUserRole(): boolean {
    return this._isUserRole;
  }

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

  // ---- UI helpers ----

  slotLabel(s: WodScheduleDto): string {
    return `${normalizeTime(s.startTime)} - ${normalizeTime(s.endTime)}`;
  }

  availableSpots(s: WodScheduleDto): number {
    return (s.capacity ?? 0) - (s.bookedCount ?? 0);
  }

  isFull(s: WodScheduleDto): boolean {
    return this.availableSpots(s) <= 0;
  }

  isClosed(s: WodScheduleDto): boolean {
    return !(s.workoutDescription ?? '').trim();
  }

  isBooked(state: WeekState, s: WodScheduleDto): boolean {
    return state.bookingByScheduleId.has(s.id);
  }

  hasBookingSameDay(state: WeekState, s: WodScheduleDto): boolean {
    const date = s.date;
    if (!date) return false;

    const bookingsForDate = state.bookingByDate.get(date);
    if (!bookingsForDate) return false;

    // If the slot is already booked (same schedule), we don't treat as "conflict"
    return !this.isBooked(state, s);
  }

  isPastSlot(s: WodScheduleDto): boolean {
    const dt = parseDateTimeLocal(s.date, s.startTime);
    return dt.getTime() < Date.now();
  }

  canBook(state: WeekState, s: WodScheduleDto): boolean {
    if (!this.isUserRole) return false; // admin cannot book
    if (this.isBooked(state, s)) return false;
    if (this.isFull(s)) return false;
    if (this.isPastSlot(s)) return false;
    if (this.hasBookingSameDay(state, s)) return false;
    if (this.isClosed(s)) return false;

    return !state.pendingScheduleIds.has(s.id);
  }

  canCancel(state: WeekState, s: WodScheduleDto): boolean {
    if (!this.isUserRole) return false; // admin cannot cancel
    if (!this.isBooked(state, s)) return false;
    if (this.isPastSlot(s)) return false;

    return !state.pendingScheduleIds.has(s.id);
  }

  // ---- Messages ----

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

  private extractErrorMessage(err: unknown): string {
    const anyErr = err as any;
    const e = anyErr?.error;
    if (!e) return 'Request failed';
    if (typeof e === 'string') return e;
    if (typeof e?.message === 'string') return e.message;
    return 'Request failed';
  }

  // ---- Actions ----

  book(s: WodScheduleDto): void {
    if (!this.isUserRole) return;

    this.facade.book(s.id).subscribe({
      next: () => {
        this.showSuccess('Booking successful');
        this.facade.load();
      },
      error: (err: unknown) => {
        console.error(err);
        this.showError(this.extractErrorMessage(err));
      },
    });
  }

  cancel(state: WeekState, s: WodScheduleDto): void {
    if (!this.isUserRole) return;

    const booking = state.bookingByScheduleId.get(s.id);
    if (!booking) return;

    this.facade.cancel(s.id, booking.id).subscribe({
      next: () => {
        this.showSuccess('Booking cancelled');
        this.facade.load();
      },
      error: (err: unknown) => {
        console.error(err);
        this.showError(this.extractErrorMessage(err));
      },
    });
  }
}
