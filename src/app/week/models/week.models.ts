import { BookingResponseDto, WodScheduleDto } from '../../core/api/models';

export type DayGroup = {
  date: string;        // YYYY-MM-DD
  label: string;       // Mon 06/01
  weekdayIndex: number; // ISO: 1=Mon..7=Sun
  slots: WodScheduleDto[];
};

export type BookingSummary = {
  bookingId: string;
  wodScheduleId: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  label: string;     // "Wed 07/01 20:00 - 21:00"
};

export type WeekState = {
  loading: boolean;
  error: string | null;

  days: DayGroup[];
  selectedDate: string | null;

  myBookings: BookingResponseDto[];

  bookingByScheduleId: Map<string, BookingResponseDto>;
  bookingByDate: Map<string, BookingResponseDto>;
  scheduleById: Map<string, WodScheduleDto>;

  pendingScheduleIds: Set<string>;

  myBookingSummary: BookingSummary | null;
};