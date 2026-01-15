import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { WodScheduleDto } from './models';

@Injectable({ providedIn: 'root' })
export class AdminWodsApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCurrentWeek(): Observable<WodScheduleDto[]> {
    return this.http.get<WodScheduleDto[]>(
      `${this.baseUrl}/api/wods/current-week`,
    );
  }

  generateCurrentWeek(): Observable<WodScheduleDto[]> {
    return this.http.post<WodScheduleDto[]>(
      `${this.baseUrl}/api/admin/wods/generate-current-week`,
      null,
    );
  }

  generateNextWeek(): Observable<WodScheduleDto[]> {
    return this.http.post<WodScheduleDto[]>(
      `${this.baseUrl}/api/admin/wods/generate-next-week`,
      null,
    );
  }

  updateWod(payload: {
    date: string;
    startTime: string;
    workoutDescription: string;
  }): Observable<WodScheduleDto> {
    return this.http.put<WodScheduleDto>(
      `${this.baseUrl}/api/admin/wods/update`,
      payload,
    );
  }
}