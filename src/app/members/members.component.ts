import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminMembersApi } from '../core/api/admin-members.api';
import { AdminMemberDto } from '../core/api/models';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
})
export class MembersComponent {
  private readonly api = inject(AdminMembersApi);
  private readonly snackBar = inject(MatSnackBar);

  loading = false;
  error: string | null = null;

  members: AdminMemberDto[] = [];
  displayedColumns: string[] = ['username', 'email', 'createdAt'];

  filter = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.api.getMembers().subscribe({
      next: (rows) => {
        this.members = (rows ?? []).slice().sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load members.';
        this.loading = false;
      },
    });
  }

  clearFilter(): void {
    this.filter = '';
    this.snackBar.open('Cleared', 'OK', {
      duration: 1500,
      panelClass: ['snackbar-info'],
    });
  }

  get filteredMembers(): AdminMemberDto[] {
    const q = this.filter.trim().toLowerCase();
    if (!q) return this.members;

    return this.members.filter((m) => {
      const u = (m.username ?? '').toLowerCase();
      const e = (m.email ?? '').toLowerCase();
      return u.includes(q) || e.includes(q);
    });
  }

  formatCreatedAt(iso: string): string {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toLocaleString();
  }
}