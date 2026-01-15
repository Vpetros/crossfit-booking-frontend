import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminBookingDto {
  id: string;
  userId: string;
  username: string | null;

  wodScheduleId: string;
  date: string | null;      // YYYY-MM-DD
  startTime: string | null; // HH:mm:ss
  endTime: string | null;   // HH:mm:ss

  timestamp: string;        // ISO string
}

@Injectable({ providedIn: 'root' })
export class AdminBookingsApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAllBookings(): Observable<AdminBookingDto[]> {
    return this.http.get<AdminBookingDto[]>(`${this.baseUrl}/api/admin/bookings`);
  }
}