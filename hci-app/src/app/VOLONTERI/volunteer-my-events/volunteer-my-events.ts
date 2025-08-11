  import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
  import { CommonModule, DatePipe, NgClass } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import Chart from 'chart.js/auto';
  import {MatIcon} from '@angular/material/icon';

  interface ActiveEvent {
    day: number;
    month: string;
    title: string;
    location: string;
    timeRange: string;
    remainingPlaces: string;
    organizerName: string;
    organizerLogoUrl: string;
    imageUrl: string;
    fullDate: string;
    volunteersSignedUp: number;
    volunteersNeeded: number;
    description: string;
    category: string;
    tags: string[];
  }

  interface ActiveTask {
    organizationName: string;
    location: string;
    time: string;
    duration: string;
    taskTitle: string;
    eventName: string
    isBlurred?: boolean;
  }



  @Component({
    selector: 'app-volunteer-my-events',
    standalone: true,
    imports: [CommonModule, DatePipe, NgClass, FormsModule, MatIcon],
    templateUrl: './volunteer-my-events.html',
    styleUrls: ['./volunteer-my-events.css']
  })
  export class VolunteerMyEvents implements OnInit, OnDestroy, AfterViewInit {
    currentTime: string = '';
    currentDate: string = '';
    private clockInterval: any;

    currentActiveEvent: ActiveEvent | undefined;
    myEvents: ActiveEvent[] = [];
    pastEvents: ActiveEvent[] = [];

    @ViewChild('tasksContainer') tasksContainer!: ElementRef<HTMLElement>;
    @ViewChild('activityChart') activityChart!: ElementRef<HTMLCanvasElement>;
    @ViewChild('chatMessages') chatMessages!: ElementRef<HTMLElement>;

    showDetailsView: boolean = false;
    selectedEvent: ActiveEvent | null = null;
    activeTab: 'sve' | 'zadaci' = 'sve';

    messages: { sender: string, content: string, timestamp: string }[] = [];
    newMessage: string = '';

    allTasks: ActiveTask[] = [];
    activeTasksForEvent: ActiveTask[] = []; // Ispravljeno: novo svojstvo za aktivne zadatke odabranog događaja
    private chartInstance: Chart | undefined;

    canScrollLeft: boolean = false;
    canScrollRight: boolean = true;


    private intersectionObserver: IntersectionObserver | undefined;

    constructor(private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
      this.updateClock();
      this.clockInterval = setInterval(() => this.updateClock(), 1000);
      this.loadMockData();
      this.loadPastEventsData();
    }

    ngAfterViewInit(): void {
      this.setupIntersectionObserver();
      this.updateScrollButtonState();
    }

    ngOnDestroy(): void {
      if (this.clockInterval) {
        clearInterval(this.clockInterval);
      }
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
    }

    updateClock(): void {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      this.currentTime = `${hours}:${minutes}:${seconds}`;

      const months = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN',
        'JUL', 'AVG', 'SEP', 'OKT', 'NOV', 'DEC'
      ];

      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      this.currentDate = `${day} ${month} ${year}`;
    }

    // Ispravljeno: Provjera da li je event definiran prije poziva
    openEventDetails(event: ActiveEvent): void {
      this.selectedEvent = event;
      this.showDetailsView = true;
      this.activeTab = 'sve';
      this.allTasks = this.getMockTasksForEvent(event.title);
      this.activeTasksForEvent = this.allTasks; // Ispravljeno: Koristimo novo svojstvo
      this.cdr.detectChanges();

      setTimeout(() => {
        this.createActivityChart();
      });
    }

    closeDetailsView(): void {
      this.showDetailsView = false;
      this.selectedEvent = null;
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = undefined;
      }
    }

    sendMessage(): void {
      if (this.newMessage.trim() === '') return;

      this.messages.push({
        sender: 'Ja',
        content: this.newMessage,
        timestamp: 'Just Now'
      });
      this.newMessage = '';

      this.cdr.detectChanges();
      this.scrollToBottom();
    }

    scrollToBottom(): void {
      if (this.chatMessages) {
        const chatContainer = this.chatMessages.nativeElement;
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }

    createActivityChart(): void {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }
      if (this.activityChart && this.activityChart.nativeElement) {
        const ctx = this.activityChart.nativeElement.getContext('2d');
        if (!ctx) return;

        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['08', '10', '12', '14', '16', '18', '20'],
            datasets: [{
              label: 'Broj aktivnih volontera po satima',
              data: [6, 14, 23, 15, 0, 0, 0],
              borderColor: '#ff6347',
              backgroundColor: 'rgba(255, 99, 71, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: '#ff6347',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#ff6347',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#888' }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#eee' },
                ticks: { color: '#888', stepSize: 2 }
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    getMockTasksForEvent(eventName: string): ActiveTask[] {
      const allMockTasks: ActiveTask[] = [
        { eventName:"Akcija pošumljavanja", organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '08:30', duration: '30min', taskTitle: 'Prikupljanje sadnica', isBlurred: false },
        { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '09:00', duration: '45min', taskTitle: 'Transport sadnica', isBlurred: false },
        { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '09:45', duration: '45min', taskTitle: 'Priprema terena', isBlurred: false },
        { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '10:30', duration: '3h 30min', taskTitle: 'Sadnja stabala', isBlurred: false },
        { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '14:00', duration: '1h', taskTitle: 'Zalijevanje sadnica' },
        { eventName: "Pomoć starijim osobama", organizationName: 'Pomozi.ba', location: 'Sarajevo', time: '10:00', duration: '2h', taskTitle: 'Distribucija namirnica' },
        { eventName: "Pomoć starijim osobama", organizationName: 'Pomozi.ba', location: 'Sarajevo', time: '12:00', duration: '1h', taskTitle: 'Druženje sa korisnicima' },
        { eventName: "Renoviranje igrališta", organizationName: 'Rastimo zajedno', location: 'Sarajevo', time: '14:00', duration: '3h', taskTitle: 'Farbanje klupa i opreme' },
      ];
      return allMockTasks.filter(task => task.eventName === eventName);
    }

    loadMockData(): void {
      this.currentActiveEvent = {
        day: 10, month: 'MAJ', title: 'Akcija pošumljavanja', location: 'Skakavac', timeRange: '8:30 - 15:00',
        remainingPlaces: '100 mjesta preostalo', organizerName: 'Lovačko društvo Sarajevo', organizerLogoUrl: 'https://shorturl.at/IXOmx',
        imageUrl: 'https://radiosarajevo.ba/s3/img/image/896x589/posumljavanje_Sarajevo_2022.jpg',
        fullDate: '10.05.2025.', volunteersSignedUp: 65, volunteersNeeded: 100, description: '...Opis događaja...',
        category: 'EKOLOGIJA', tags: ['Šuma', 'Priroda']
      };
      this.myEvents = [
        {
          day: 16, month: 'MAJ', title: 'Pomoć starijim osobama', location: 'Sarajevo', timeRange: '10:00 - 12:00',
          remainingPlaces: '50 mjesta preostalo', organizerName: 'Pomozi.ba', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcMbHHJ_KgUrfjFob1lNjPR4-_yI0SSoqAw&s',
          imageUrl: 'https://www.gcs.ba/images/post-images/zgrada7.png',
          fullDate: '16.05.2025.', volunteersSignedUp: 20, volunteersNeeded: 70, description: '...Opis događaja...',
          category: 'POMAGANJE LJUDIMA', tags: ['Starije osobe', 'Socijalna pomoć']
        },
        {
          day: 20, month: 'MAJ', title: 'Renoviranje igrališta', location: 'Sarajevo', timeRange: '14:00 - 17:00',
          remainingPlaces: '20 mjesta preostalo', organizerName: 'Rastimo zajedno', organizerLogoUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kPsD9ZZp5jy72i_i9sw0ZEuDJOq_E8ioHyjEkDcPbHF6U=s900-c-k-c0x00ffffff-no-rj',
          imageUrl: 'https://storage.radiosarajevo.ba/image/467670/1180x732/demolirani_park_betanija1.jpg',
          fullDate: '20.05.2025.', volunteersSignedUp: 30, volunteersNeeded: 50, description: '...Opis događaja...',
          category: 'SPORT', tags: ['Igralište', 'Djeca']
        },
      ];
    }

    loadPastEventsData(): void {
      this.pastEvents = [
        {
          day: 25, month: 'APR', title: 'Čišćenje parka Skenderija', location: 'Sarajevo', timeRange: '10:00 - 13:00',
          remainingPlaces: 'Završeno', organizerName: 'Općina Centar', organizerLogoUrl: 'https://cdn-icons-png.flaticon.com/512/3220/3220737.png',
          imageUrl: 'https://cdn.radiosarajevo.ba/image/449339/1180x732/viber_image_2022-02-18_10-53-06-389.jpg',
          fullDate: '25.04.2025.', volunteersSignedUp: 50, volunteersNeeded: 50, description: '...Opis događaja...',
          category: 'EKOLOGIJA', tags: ['Park', 'Čišćenje']
        },
        {
          day: 15, month: 'APR', title: 'Prikupljanje donacija', location: 'Kulturni centar Skenderija', timeRange: '09:00 - 18:00',
          remainingPlaces: 'Završeno', organizerName: 'Pomozi.ba', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcMbHHJ_KgUrfjFob1lNjPR4-_yI0SSoqAw&s',
          imageUrl: 'https://radiosarajevo.ba/s3/img/image/896x589/pomoziba_donacije_2022_foto_facebook.jpg',
          fullDate: '15.04.2025.', volunteersSignedUp: 100, volunteersNeeded: 100, description: '...Opis događaja...',
          category: 'POMAGANJE LJUDIMA', tags: ['Donacije']
        },
        // ... (ostali prošli događaji)
      ];
    }



    // Handles horizontal scrolling of the tasks container
    scrollTasks(direction: 'left' | 'right'): void {
      if (!this.tasksContainer) return;
      const container = this.tasksContainer.nativeElement;

      const firstCard = container.querySelector('.task-card');
      if (firstCard) {
        const cardWidth = firstCard.clientWidth;
        const columnGap = 20; // 20px, as defined in the inline style
        const scrollAmount = cardWidth + columnGap;

        if (direction === 'left') {
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }

    // Updates the disabled state of scroll arrows based on scroll position
    onTasksScroll(): void {
      this.updateScrollButtonState();
    }

    private updateScrollButtonState(): void {
      if (!this.tasksContainer) {
        this.canScrollLeft = false;
        this.canScrollRight = false;
        return;
      }
      const container = this.tasksContainer.nativeElement;
      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
      this.cdr.detectChanges();
    }

    // Sets up the Intersection Observer for card visibility
    setupIntersectionObserver(): void {
      if (!this.tasksContainer || !this.tasksContainer.nativeElement) {
        return;
      }

      const options = {
        root: this.tasksContainer.nativeElement,
        rootMargin: '0px',
        threshold: Array.from({ length: 101 }, (v, k) => k / 100)
      };

      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const taskElement = entry.target as HTMLElement;
          const children = Array.from(this.tasksContainer.nativeElement.children);
          const taskIndex = children.indexOf(taskElement);

          if (taskIndex !== -1 && this.activeTasksForEvent[taskIndex]) {
            this.activeTasksForEvent[taskIndex].isBlurred = entry.intersectionRatio < 0.98 && entry.intersectionRatio > 0;
          }
        });
        this.cdr.detectChanges();
        this.updateScrollButtonState();
      }, options);

      const taskCards = this.tasksContainer.nativeElement.querySelectorAll('.task-card');
      taskCards.forEach(card => {
        this.intersectionObserver?.observe(card);
      });
    }
  }
