import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MainLayout, LucideAngularModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})

export default class StatsComponent {
  readonly ArrowLeftIcon = ArrowLeft;

  selectedTimeRange = signal<string>('today');
  startDate = signal<Date>(new Date());
  endDate = signal<Date>(new Date());

  selectTimeRange(timeRange: string): void {
    const today = new Date();
    const last2weeks = new Date(today);
    last2weeks.setDate(today.getDate() - 14);
    const lastmonth = new Date(today);
    lastmonth.setDate(today.getDate() - 30);

    switch (timeRange) {
      case 'today':
        this.startDate.set(today);
        this.endDate.set(today);
        break;
      case 'last2weeks':
        this.startDate.set(last2weeks);
        this.endDate.set(today);
        break;
      case 'lastmonth':
        this.startDate.set(lastmonth);
        this.endDate.set(today);
        break;
    }

    this.selectedTimeRange.set(timeRange);
  }
}