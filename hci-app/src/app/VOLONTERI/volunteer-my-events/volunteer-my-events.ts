import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';

// Interface for the "Trenutno aktivni događaji" cards (Existing)
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
}

// Interface for the "Trenutno aktivni zadaci" cards (MODIFIED)
interface ActiveTask {
  organizationName: string;
  location: string;
  time: string;
  duration: string;
  taskTitle: string;
  isBlurred?: boolean; // NEW: Property to control the blur effect
  eventName: string;
}

@Component({
  selector: 'app-volunteer-my-events',
  standalone: true,
  imports: [CommonModule, DatePipe, NgClass],
  templateUrl: './volunteer-my-events.html',
  styleUrl: './volunteer-my-events.css'
})
export class VolunteerMyEvents  implements OnInit, OnDestroy, AfterViewInit {
  currentTime: string = '';
  currentDate: string = '';
  private clockInterval: any;

  activeEvents: ActiveEvent[] = [];
  activeTasks: ActiveTask[] = [];
  pastEvents: ActiveEvent[] = []; // NEW: Array for past events

  @ViewChild('tasksContainer') tasksContainer!: ElementRef<HTMLElement>;
  @ViewChild('pastEventsContainer') pastEventsContainer!: ElementRef<HTMLElement>; // NEW: ViewChild for past events

  private intersectionObserver: IntersectionObserver | undefined;

  canScrollLeft: boolean = false;
  canScrollRight: boolean = true;

  canScrollPastLeft: boolean = false; // NEW: Scroll state for past events
  canScrollPastRight: boolean = true; // NEW: Scroll state for past events


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.loadMockData();
    this.loadPastEventsData(); // NEW: Load past events data
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.updateScrollButtonState();
    this.updatePastEventsScrollButtonState(); // NEW: Initial state for past events
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  updateClock(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    const months = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
      'Juli', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];

    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    this.currentDate = `${day} ${month} ${year}`;
  }

  loadMockData(): void {
    this.activeTasks = [
      { eventName:"Akcija pošumljavanja", organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '08:30', duration: '30min', taskTitle: 'Prikupljanje sadnica', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '09:00', duration: '45min', taskTitle: 'Transport sadnica', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '09:45', duration: '45min', taskTitle: 'Priprema terena', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '10:30', duration: '3h 30min', taskTitle: 'Sadnja stabala', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '14:00', duration: '1h', taskTitle: 'Zalijevanje sadnica', isBlurred: false },
    ];
  }

  // NEW: Method to load mock data for past events
  loadPastEventsData(): void {
    this.pastEvents = [
      { day: 25, month: 'APR', title: 'Čišćenje parka Skenderija', location: 'Sarajevo', timeRange: '10:00 - 13:00', remainingPlaces: 'Završeno', organizerName: 'Općina Centar', organizerLogoUrl: 'https://cdn-icons-png.flaticon.com/512/3220/3220737.png', imageUrl: 'https://cdn.radiosarajevo.ba/image/449339/1180x732/viber_image_2022-02-18_10-53-06-389.jpg' },
      { day: 15, month: 'APR', title: 'Prikupljanje donacija', location: 'Kulturni centar Skenderija', timeRange: '09:00 - 18:00', remainingPlaces: 'Završeno', organizerName: 'Pomozi.ba', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcMbHHJ_KgUrfjFob1lNjPR4-_yI0SSoqAw&s', imageUrl: 'https://radiosarajevo.ba/s3/img/image/896x589/pomoziba_donacije_2022_foto_facebook.jpg' },
      { day: 10, month: 'APR', title: 'Podjela obroka', location: 'Narodna kuhinja', timeRange: '12:00 - 14:00', remainingPlaces: 'Završeno', organizerName: 'Merhamet', organizerLogoUrl: 'https://merhamet.ba/wp-content/uploads/2021/02/merhamet-logo-1.png', imageUrl: 'https://www.klix.ba/thumbnail.ashx?uri=http://img.klix.ba/20/12/31/m_201231024.jpg&w=720&h=438' },
      { day: 2, month: 'APR', title: 'Pomoć azilu za životinje', location: 'Prača', timeRange: '11:00 - 16:00', remainingPlaces: 'Završeno', organizerName: 'SOS Dječija Sela', organizerLogoUrl: 'https://www.sos-ds.ba/fileadmin/template/dist/img/logo-sos.png', imageUrl: 'https://www.sarajevoclicks.com/uploads/photo/images/large/2023_04/IMG_1648.jpg' },
      { day: 28, month: 'MAR', title: 'Edukativna radionica', location: 'Biblioteka, Ilidža', timeRange: '16:00 - 18:00', remainingPlaces: 'Završeno', organizerName: 'Lovačko društvo Sarajevo', organizerLogoUrl: 'https://shorturl.at/IXOmx', imageUrl: 'https://shorturl.at/bdhF0' },
      { day: 20, month: 'MAR', title: 'Humanitarni bazar', location: 'Plato Skenderija', timeRange: '10:00 - 18:00', remainingPlaces: 'Završeno', organizerName: 'Rastimo zajedno', organizerLogoUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_kPsD9ZZp5jy72i_i9sw0ZEuDJOq_E8ioHyjEkDcPbHF6U=s900-c-k-c0x00ffffff-no-rj', imageUrl: 'https://shorturl.at/eIMQ5' }
    ];
  }

  scrollTasks(direction: 'left' | 'right'): void {
    if (!this.tasksContainer) return;
    const container = this.tasksContainer.nativeElement;
    const firstCard = container.querySelector('.task-card');
    if (firstCard) {
      const cardWidth = firstCard.clientWidth;
      const columnGap = parseFloat(getComputedStyle(container).columnGap || '0');
      const scrollAmount = cardWidth + columnGap;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

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

  // NEW: Method to handle scrolling for past events
  scrollPastEvents(direction: 'left' | 'right'): void {
    if (!this.pastEventsContainer) return;
    const container = this.pastEventsContainer.nativeElement;
    const firstCard = container.querySelector('.card');
    if (firstCard) {
      const cardWidth = firstCard.clientWidth;
      const columnGap = parseFloat(getComputedStyle(container).columnGap || '0');
      const scrollAmount = cardWidth + columnGap;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

  // NEW: Handler for past events scroll event
  onPastEventsScroll(): void {
    this.updatePastEventsScrollButtonState();
  }

  // NEW: Updates the disabled state of scroll arrows for past events
  private updatePastEventsScrollButtonState(): void {
    if (!this.pastEventsContainer) {
      this.canScrollPastLeft = false;
      this.canScrollPastRight = false;
      return;
    }
    const container = this.pastEventsContainer.nativeElement;
    this.canScrollPastLeft = container.scrollLeft > 0;
    this.canScrollPastRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
    this.cdr.detectChanges();
  }

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

        if (taskIndex !== -1 && this.activeTasks[taskIndex]) {
          this.activeTasks[taskIndex].isBlurred = entry.intersectionRatio < 0.98 && entry.intersectionRatio > 0;
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
