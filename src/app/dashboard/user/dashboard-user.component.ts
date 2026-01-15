import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { WodScheduleApi } from '../../core/api/wod-schedule.api';
import { BookingsApi } from '../../core/api/bookings.api';
import { BookingResponseDto, WodScheduleDto } from '../../core/api/models';

import {
  normalizeTime,
  parseDateTimeLocal,
  todayIsoDate,
} from '../../week/utils/date-time.utils';

type ActivityItem = {
  date: string;
  startTime: string;
  endTime: string;
  bookedAt: string;
  workoutPreview: string;
};

@Component({
  selector: 'app-dashboard-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.css',
})
export class DashboardUserComponent implements OnChanges {
  private readonly wodApi = inject(WodScheduleApi);
  private readonly bookingsApi = inject(BookingsApi);

  @Input({ required: true }) username!: string;
  @Input({ required: true }) refreshToken!: number;

  loading = true;
  error: string | null = null;

  todaysSlots: WodScheduleDto[] = [];
  todaysWorkoutText: string | null = null;

  activity: ActivityItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshToken']) {
      this.load();
    }
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      week: this.wodApi.getCurrentWeek(),
      mine: this.bookingsApi.getMyBookings(),
    }).subscribe({
      next: ({ week, mine }) => {
        const schedules = week ?? [];
        const myBookings = mine ?? [];

        const today = todayIsoDate();

        this.todaysSlots = schedules
          .filter((s) => s.date === today)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const firstWithWod = this.todaysSlots.find(
          (s) => (s.workoutDescription ?? '').trim().length > 0
        );
        this.todaysWorkoutText = firstWithWod?.workoutDescription?.trim() || null;

        const scheduleById = new Map<string, WodScheduleDto>();
        for (const s of schedules) scheduleById.set(s.id, s);

        this.activity = myBookings
          .map((b) => {
            const s = scheduleById.get(b.wodScheduleId);
            if (!s) return null;

            const preview = (s.workoutDescription ?? '').trim();
            return {
              date: s.date,
              startTime: s.startTime,
              endTime: s.endTime,
              bookedAt: b.timestamp,
              workoutPreview: preview ? preview.slice(0, 80) : '(no WOD posted)',
            } as ActivityItem;
          })
          .filter((x): x is ActivityItem => !!x)
          .sort((a, b) => {
            const da = parseDateTimeLocal(a.date, a.startTime).getTime();
            const db = parseDateTimeLocal(b.date, b.startTime).getTime();
            return db - da;
          })
          .slice(0, 8);

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load user dashboard.';
        this.loading = false;
      },
    });
  }

  slotLabel(s: WodScheduleDto): string {
    return `${normalizeTime(s.startTime)} - ${normalizeTime(s.endTime)}`;
  }
}