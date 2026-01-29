import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminBookingsApi, AdminBookingDto } from '../../core/api/admin-bookings.api';
import { normalizeTime } from '../../week/utils/date-time.utils';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.css'],
})
export class AdminReservationsComponent {
  
  private readonly adminBookingsApi = inject(AdminBookingsApi);
  private readonly snackBar = inject(MatSnackBar);

  bookingsLoading = false;
  bookingsError: string | null = null;

  bookings: AdminBookingDto[] = [];
  displayedColumns: string[] = ['username', 'date', 'time', 'status', 'timestamp'];

  filterUsername = '';
  filterDate = '';

  ensureLoaded(): void {
    if (this.bookings.length === 0 && !this.bookingsLoading) {
      this.loadAllBookings();
    }
  }

  loadAllBookings(): void {
    this.bookingsLoading = true;
    this.bookingsError = null;

    this.adminBookingsApi.getAllBookings().subscribe({
      next: (rows) => {
        const all = rows ?? [];

        // show bookings
        this.bookings = all;


        this.bookingsLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.bookingsError = 'Failed to load bookings.';
        this.bookingsLoading = false;
      },
    });
  }

  // "clear" button clears past only
  clearPast(): void {
    const before = this.bookings.length;
    this.bookings = this.bookings.filter((b) => !this.isPastReservation(b));

    // reset filters
    this.filterUsername = '';
    this.filterDate = '';
    this.bookingsError = null;

    // info snackbar
    this.snackBar.open('Cleared', 'OK', {
      duration: 2000,
      panelClass: ['snackbar-info'],
    });
  }

  get filteredBookings(): AdminBookingDto[] {
    const u = this.filterUsername.trim().toLowerCase();
    const d = this.filterDate.trim();

    return (this.bookings ?? []).filter((b) => {
      const username = (b.username ?? '').toLowerCase();
      const date = b.date ?? '';

      const matchUser = !u || username.includes(u);
      const matchDate = !d || date === d;

      return matchUser && matchDate;
    });
  }

  // ---------- UI helpers ----------

  formatTimeRange(b: AdminBookingDto): string {
    if (!b.startTime || !b.endTime) return 'Missing schedule';
    return `${normalizeTime(b.startTime)} - ${normalizeTime(b.endTime)}`;
  }

  formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString();
  }

  /**
   * Past logic based on slot start datetime + start time.
   * If schedule info is missing, treat as NOT past so admin can still see it.
   */
  isPastReservation(b: AdminBookingDto): boolean {
    if (!b.date || !b.startTime) return false;

    const start = this.parseLocalDateTime(b.date, b.startTime);
    if (!start) return false;

    const now = new Date();
    return start.getTime() <= now.getTime();
  }

  private parseLocalDateTime(date: string, time: string): Date | null {
    // supports "HH:mm" or "HH:mm:ss"
    const t = time.length === 5 ? `${time}:00` : time;
    const d = new Date(`${date}T${t}`);
    return isNaN(d.getTime()) ? null : d;
  }
}