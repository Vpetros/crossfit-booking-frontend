import { BookingResponseDto, WodScheduleDto } from '../../core/api/models';
import { BookingSummary, DayGroup } from '../models/week.models';
import { formatDayLabel, getIsoWeekday, normalizeTime, timeToMinutes } from '../utils/date-time.utils';

export function buildScheduleById(schedules: WodScheduleDto[]): Map<string, WodScheduleDto> {
  const map = new Map<string, WodScheduleDto>();
  for (const s of schedules) map.set(s.id, s);
  return map;
}

export function buildBookingByScheduleId(bookings: BookingResponseDto[]): Map<string, BookingResponseDto> {
  const map = new Map<string, BookingResponseDto>();
  for (const b of bookings) map.set(b.wodScheduleId, b);
  return map;
}

export function buildDays(schedules: WodScheduleDto[]): DayGroup[] {
  const grouped = new Map<string, WodScheduleDto[]>();

  for (const s of schedules) {
    if (!grouped.has(s.date)) grouped.set(s.date, []);
    grouped.get(s.date)!.push(s);
  }

  for (const slots of grouped.values()) {
    slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }

  const dates = Array.from(grouped.keys()).sort();
  return dates.map((date) => ({
    date,
    label: formatDayLabel(date),
    weekdayIndex: getIsoWeekday(date),
    slots: grouped.get(date)!,
  }));
}

export function buildBookingByDate(
  bookings: BookingResponseDto[],
  scheduleById: Map<string, WodScheduleDto>
): Map<string, BookingResponseDto> {
  const map = new Map<string, BookingResponseDto>();
  for (const b of bookings) {
    const s = scheduleById.get(b.wodScheduleId);
    if (s) map.set(s.date, b);
  }
  return map;
}

export function buildMyBookingSummary(
  bookings: BookingResponseDto[],
  scheduleById: Map<string, WodScheduleDto>
): BookingSummary | null {
  const pairs: Array<{ b: BookingResponseDto; s: WodScheduleDto }> = [];

  for (const b of bookings) {
    const s = scheduleById.get(b.wodScheduleId);
    if (s) pairs.push({ b, s });
  }

  if (!pairs.length) return null;

  pairs.sort((x, y) => {
    if (x.s.date !== y.s.date) return x.s.date.localeCompare(y.s.date);
    return timeToMinutes(x.s.startTime) - timeToMinutes(y.s.startTime);
  });

  const { b, s } = pairs[0];
  const start = normalizeTime(s.startTime);
  const end = normalizeTime(s.endTime);
  const label = `${formatDayLabel(s.date)} ${start} - ${end}`;

  return {
    bookingId: b.id,
    wodScheduleId: b.wodScheduleId,
    date: s.date,
    startTime: start,
    endTime: end,
    label,
  };
}