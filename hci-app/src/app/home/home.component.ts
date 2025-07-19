// src/app/home/home.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('volunteerChart') private chartRef!: ElementRef;
  public volunteerChart: Chart | undefined;

  // Data for cards
  dashboardData = {
    organizations: 10,
    volunteers: 179,
    events: 27
  };

  // Data for volunteer activity graph
  timeframeOptions = [
    { value: 'day', viewValue: 'Dnevno' },
    { value: 'month', viewValue: 'Mjesečno' },
    { value: 'year', viewValue: 'Godišnje' }
  ];
  selectedTimeframe: string = 'month';

  private volunteerActivityData = {
    day: {
      labels: ['01. Jul', '02. Jul', '03. Jul', '04. Jul', '05. Jul', '06. Jul', '07. Jul'],
      data: [5, 12, 8, 15, 10, 18, 14]
    },
    month: {
      labels: ['Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec', 'Jan'],
      data: [15, 22, 28, 38, 12, 29, 31]
    },
    year: {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      data: [100, 150, 130, 180, 190]
    }
  };

  // NEW: Dropdown options for active lists
  activeListOptions = [
    { value: 'volunteers', viewValue: 'Volonteri' },
    { value: 'organizations', viewValue: 'Organizacije' }
  ];
  selectedActiveList: string = 'volunteers'; // Default to volunteers

  // Data for most active volunteers (existing)
  activeVolunteers = [
    { name: 'Ingrid Baxter', email: 'ingrid@gmail.com', time: '17h', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { name: 'Malcom Goodman', email: 'malcom@gmail.com', time: '14h', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { name: 'Dion Mosley', email: 'dion@gmail.com', time: '11h', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: 'Vivian Murray', email: 'vivian@gmail.com', time: '9h', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' }
  ];

  // NEW: Data for most active organizations (example data)
  activeOrganizations = [
    { name: 'Zelena Pomoć', email: 'pomoc@gmail.com', actions: '8 ', logo: 'https://zastita-prirode.hr/wp-content/uploads/2022/01/priroda.jpg' },
    { name: 'Gradski Azil', email: 'gradskiazil@gmail.com', actions: '7 ', logo: 'https://cdn-ezadar.net.hr/wp-content/uploads/461d53fdccfcdb75bec53c72f2179b3d-view_article_new.jpg' },
    { name: 'Klub Čitalaca', email: 'citalaca@gmail.com', actions: '5 ', logo: 'https://as2.ftcdn.net/v2/jpg/01/05/68/07/1000_F_105680756_UbrdfpeC3bLr2K2T3E9mWMexaZS96INR.jpg' },
    { name: 'Mladi Istraživači', email: 'istrazivaci@gmail.com', actions: '5 ', logo: 'https://media.istockphoto.com/id/1429704071/vector/group-diversity-silhouette-multiethnic-people-from-the-side-community-of-colleagues-or.jpg?s=612x612&w=0&k=20&c=Qv4vTvXnhtvGPXLQLoCziExucLfbdxJl1EpdSvG2eSw=' }
  ];


  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createVolunteerActivityChart();
  }

  createVolunteerActivityChart(): void {
    if (this.volunteerChart) {
      this.volunteerChart.destroy();
    }

    const data = this.volunteerActivityData[this.selectedTimeframe as keyof typeof this.volunteerActivityData];

    const ctx = this.chartRef.nativeElement.getContext('2d');
    this.volunteerChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Broj volontera',
          data: data.data,
          borderColor: '#f97828',
          backgroundColor: 'rgba(249, 120, 40, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#f97828',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f97828'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 10,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  onTimeframeChange(): void {
    this.createVolunteerActivityChart();
  }

  // NEW: Method for when active list dropdown changes
  onActiveListChange(): void {
    // No specific logic needed here for now,
    // HTML uses ngIf to switch displayed list based on selectedActiveList
    console.log('Selected active list:', this.selectedActiveList);
  }
}
