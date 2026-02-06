import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { LucideAngularModule, ArrowLeft, CircleAlert } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { StatisticsService } from '@core/services/statistics.service';
import { DashboardStats } from '@core/models/statistics.model';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MainLayout, LucideAngularModule, ChartModule, RouterLink, TooltipModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})

export default class StatsComponent {
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CircleAlertIcon = CircleAlert;
  private statisticsService = inject(StatisticsService);
  private messageService = inject(MessageService);

  isLoading = signal<boolean>(false);
  selectedTimeRange = signal<string>('today');
  startDate = signal<Date>(new Date());
  endDate = signal<Date>(new Date());
  statsData = signal<DashboardStats | null>(null);

  barOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: '#94a3b8'
        },
        grid: {
          color: '#f1f5f9'
        }
      },
      x: {
        ticks: { color: '#64748b' },
        grid: { display: false }
      }
    }
  };

  pieOptions = {
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: '#94a3b8'
        }
      }
    }
  };

  lineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          precision: 0
        },
        grid: {
          color: '#f1f5f9',
          drawBorder: false
        }
      }
    }
  };

  /* Computed function that retrieves data for the bar chart. */
  barChartData = computed(() => {
    const data = this.statsData();
    if (!data) return null;
    return {
      labels: ['Jóvenes', 'Pre-Jóvenes'],
      datasets: [
        {
          label: 'Asistencias',
          data: [data.summary.attendance_jovenes, data.summary.attendance_prejovenes],
          backgroundColor: ['rgba(65, 97, 175, 0.2)', 'rgba(44, 103, 67, 0.2)'],
          borderColor: ['rgba(65, 97, 175, 1)', 'rgba(44, 103, 67, 1)'],
          borderWidth: 1,
        },
      ],
    };
  });

  /* Computed function that retrieves data for the pie chart. */
  pieChartData = computed(() => {
    const data = this.statsData();
    if (!data) return null;
    return {
      labels: ['Varones', 'Señoritas'],
      datasets: [
        {
          data: [data.by_gender.M, data.by_gender.F],
          backgroundColor: ['rgba(65, 97, 175, 1)', '#F473B7'],
          borderWidth: 1,
        },
      ],
    };
  });

  /* Computed function that retrieves data for the line chart. */
  lineChartData = computed(() => {
    const data = this.statsData();
    if (!data) return null;
    return {
      labels: data.timeline.map(t => t.date),
      datasets: [
        {
          label: 'Jóvenes',
          data: data.timeline.map(t => t.jovenes_count),
          backgroundColor: 'rgba(65, 97, 175, 0.2)',
          borderColor: 'rgba(65, 97, 175, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Pre-Jóvenes',
          data: data.timeline.map(t => t.prejovenes_count),
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.4
        },
      ],
    };
  });

  constructor() {
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();
      this.loadStatistics(start, end);
    });
  }

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

  async loadStatistics(start: Date, end: Date) {
    this.isLoading.set(true);
    try {
      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const stats = await this.statisticsService.getDashboardStats(
        formatDate(start),
        formatDate(end)
      );
      
      this.statsData.set(stats);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar las estadísticas'
      });
    } finally {
      this.isLoading.set(false);
    }
  }
}