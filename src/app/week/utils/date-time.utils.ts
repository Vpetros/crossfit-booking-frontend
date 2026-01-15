export function normalizeTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t; // "18:00:00" -> "18:00"
}

export function timeToMinutes(t: string): number {
  const norm = normalizeTime(t);
  const [hh, mm] = norm.split(':').map(Number);
  return hh * 60 + mm;
}

export function parseDateTimeLocal(date: string, time: string): Date {
  const norm = normalizeTime(time);
  return new Date(`${date}T${norm}:00`);
}

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.toLocaleDateString(undefined, { weekday: 'short' });
  const dm = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
  return `${day} ${dm}`;
}

export function getIsoWeekday(dateStr: string): number {
  // ISO: Mon=1 .. Sun=7
  const d = new Date(dateStr + 'T00:00:00');
  const js = d.getDay(); // Sun=0..Sat=6
  return js === 0 ? 7 : js;
}