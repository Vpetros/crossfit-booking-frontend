import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AdminMemberDto } from './models';

@Injectable({ providedIn: 'root' })
export class AdminMembersApi {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<AdminMemberDto[]> {
    return this.http.get<AdminMemberDto[]>(`${this.baseUrl}/api/admin/members`);
  }
}