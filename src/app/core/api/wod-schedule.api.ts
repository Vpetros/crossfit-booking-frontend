import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { WodScheduleDto } from './models';

@Injectable({ providedIn: 'root' })
export class WodScheduleApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getCurrentWeek(): Observable<WodScheduleDto[]> {
    return this.http.get<WodScheduleDto[]>(`${this.baseUrl}/api/wods/current-week`);
  }
}