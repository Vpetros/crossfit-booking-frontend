import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, throwError, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { TokenStorage } from '../../auth/token.storage';

import { WodScheduleApi } from '../../core/api/wod-schedule.api';
import { BookingsApi } from '../../core/api/bookings.api';
import { BookingResponseDto } from '../../core/api/models';

import { WeekState } from '../models/week.models';
import { todayIsoDate } from '../utils/date-time.utils';
import {
  buildBookingByDate,
  buildBookingByScheduleId,
  buildDays,
  buildMyBookingSummary,
  buildScheduleById,
} from './week.mapper';

function initialState(): WeekState {
  return {
    loading: true,
    error: null,
    days: [],
    selectedDate: null,
    myBookings: [],
    bookingByScheduleId: new Map(),
    bookingByDate: new Map(),
    scheduleById: new Map(),
    pendingScheduleIds: new Set(),
    myBookingSummary: null,
  };
}

@Injectable({ providedIn: 'root' })
export class WeekFacade {
  private readonly subject = new BehaviorSubject<WeekState>(initialState());
  readonly state$ = this.subject.asObservable();

  constructor(
    private wodApi: WodScheduleApi,
    private bookingsApi: BookingsApi
  ) {}

  get snapshot(): WeekState {
    return this.subject.value;
  }

  setSelectedDate(date: string): void {
    this.patch({ selectedDate: date });
  }

  private hasRole(role: string): boolean {
    return TokenStorage.getRoles().includes(role);
  }

  load(): void {
    this.patch({ loading: true, error: null });

    const canLoadMyBookings = this.hasRole('ROLE_USER');

    const requests = canLoadMyBookings
      ? forkJoin({
          week: this.wodApi.getCurrentWeek(),
          mine: this.bookingsApi.getMyBookings()
        })
      : forkJoin({
          week: this.wodApi.getCurrentWeek(),
          mine: of([])
        });

    requests.subscribe({
      next: ({ week, mine }) => {
        const schedules = week ?? [];
        const bookings = mine ?? [];

        const scheduleById = buildScheduleById(schedules);
        const bookingByScheduleId = buildBookingByScheduleId(bookings);
        const days = buildDays(schedules);
        const bookingByDate = buildBookingByDate(bookings, scheduleById);
        const myBookingSummary = buildMyBookingSummary(bookings, scheduleById);
        const selectedDate = this.computeDefaultSelectedDate(days, bookingByDate);

        this.subject.next({
          ...this.snapshot,
          loading: false,
          error: null,
          days,
          myBookings: bookings,
          scheduleById,
          bookingByScheduleId,
          bookingByDate,
          selectedDate,
          myBookingSummary,
        });
      },
      error: (err) => {
        // If token expired/invalid, global interceptor handles logout+redirect.
        if (err?.status === 401 || err?.status === 403) {
          this.patch({ loading: false });
          return;
        }

        console.error(err);
        this.patch({ loading: false, error: 'Failed to load week schedule.' });
      },
    });
  }

  book(scheduleId: string): Observable<BookingResponseDto> {
    const pending = new Set(this.snapshot.pendingScheduleIds);
    pending.add(scheduleId);
    this.patch({ pendingScheduleIds: pending });

    return this.bookingsApi.book(scheduleId).pipe(
      tap(() => {
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => {
        const p = new Set(this.snapshot.pendingScheduleIds);
        p.delete(scheduleId);
        this.patch({ pendingScheduleIds: p });
      }),
    );
  }

  cancel(scheduleId: string, bookingId: string): Observable<string> {
    const pending = new Set(this.snapshot.pendingScheduleIds);
    pending.add(scheduleId);
    this.patch({ pendingScheduleIds: pending });

    return this.bookingsApi.cancel(bookingId).pipe(
      tap(() => {
      }),
      catchError((err) => throwError(() => err)),
      finalize(() => {
        const p = new Set(this.snapshot.pendingScheduleIds);
        p.delete(scheduleId);
        this.patch({ pendingScheduleIds: p });
      }),
    );
  }

  private computeDefaultSelectedDate(
    days: { date: string }[],
    bookingByDate: Map<string, BookingResponseDto>
  ): string | null {
    const bookingDate = Array.from(bookingByDate.keys()).sort()[0];
    if (bookingDate) return bookingDate;

    const today = todayIsoDate();
    if (days.some((d) => d.date === today)) return today;

    return days.length ? days[0].date : null;
  }

  private patch(partial: Partial<WeekState>): void {
    this.subject.next({ ...this.snapshot, ...partial });
  }
}