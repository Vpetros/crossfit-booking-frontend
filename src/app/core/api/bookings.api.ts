import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BookingResponseDto } from './models';

@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMyBookings(): Observable<BookingResponseDto[]> {
    return this.http.get<BookingResponseDto[]>(`${this.baseUrl}/api/bookings/my`);
  }

  book(wodScheduleId: string): Observable<BookingResponseDto> {
    return this.http.post<BookingResponseDto>(`${this.baseUrl}/api/bookings/${wodScheduleId}`, {});
  }

  cancel(bookingId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/api/bookings/${bookingId}`, { responseType: 'text' });
  }
}