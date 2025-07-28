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
  selector: 'app-volunteer-home',
  standalone: true,
  imports: [CommonModule, DatePipe, NgClass],
  templateUrl: './volunteer-home.component.html',
  styleUrls: ['./volunteer-home.component.css']
})
export class VolunteerHomeComponent implements OnInit, OnDestroy, AfterViewInit { // Implement AfterViewInit
  currentTime: string = '';
  currentDate: string = '';
  private clockInterval: any;

  activeEvents: ActiveEvent[] = [];
  activeTasks: ActiveTask[] = [];

  // ViewChild to get a reference to the scrollable container
  @ViewChild('tasksContainer') tasksContainer!: ElementRef<HTMLElement>;

  private intersectionObserver: IntersectionObserver | undefined;

  // Properties to control arrow button disabled state
  canScrollLeft: boolean = false;
  canScrollRight: boolean = true; // Initially assume can scroll right

  constructor(private cdr: ChangeDetectorRef) { } // Inject ChangeDetectorRef for manual change detection

  ngOnInit(): void {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.loadMockData(); // Load event and task data
  }

  // After the view (including *ngFor elements) has been initialized
  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    // Initial check for scroll button state after view is rendered
    this.updateScrollButtonState();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect(); // Disconnect observer to prevent memory leaks
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

  // Method to load mock data for both events and tasks
  loadMockData(): void {
    this.activeTasks = [
      { eventName:"Akcija pošumljavanja", organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '08:30', duration: '30min', taskTitle: 'Prikupljanje sadnica', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Skladište', time: '09:00', duration: '45min', taskTitle: 'Transport sadnica', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '09:45', duration: '45min', taskTitle: 'Priprema terena', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '10:30', duration: '3h 30min', taskTitle: 'Sadnja stabala', isBlurred: false },
      { eventName:"Akcija pošumljavanja",organizationName: 'Lovačko društvo Sarajevo', location: 'Lokacija Akcije', time: '14:00', duration: '1h', taskTitle: 'Zalijevanje sadnica', isBlurred: false },
    ];
  }

  // Handles horizontal scrolling of the tasks container
  scrollTasks(direction: 'left' | 'right'): void {
    if (!this.tasksContainer) return; // Safety check if element is not yet available
    const container = this.tasksContainer.nativeElement;

    // Get the width of one task card plus its column gap for scrolling
    const firstCard = container.querySelector('.task-card');
    if (firstCard) {
      const cardWidth = firstCard.clientWidth;
      // Get the computed column-gap from the container's styles
      const columnGap = parseFloat(getComputedStyle(container).columnGap || '0');
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
    // Check if scrolled to the beginning
    this.canScrollLeft = container.scrollLeft > 0;
    // Check if scrolled to the end (allow a small tolerance)
    this.canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1; // -1 for tolerance
    this.cdr.detectChanges(); // Manually trigger change detection for these properties
  }

  // Sets up the Intersection Observer for card visibility
  setupIntersectionObserver(): void {
    if (!this.tasksContainer || !this.tasksContainer.nativeElement) {
      return;
    }

    const options = {
      root: this.tasksContainer.nativeElement, // Observe relative to the scrolling container
      rootMargin: '0px',
      threshold: Array.from({ length: 101 }, (v, k) => k / 100) // Granular thresholds from 0 to 1
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const taskElement = entry.target as HTMLElement;
        // Find the corresponding task object in the activeTasks array
        const children = Array.from(this.tasksContainer.nativeElement.children);
        const taskIndex = children.indexOf(taskElement);

        if (taskIndex !== -1 && this.activeTasks[taskIndex]) {
          // Blur if the card is not fully visible (intersectionRatio < 0.98)
          // AND it's not completely out of view (intersectionRatio > 0).
          // This ensures only partially visible cards are blurred.
          this.activeTasks[taskIndex].isBlurred = entry.intersectionRatio < 0.98 && entry.intersectionRatio > 0;
        }
      });
      this.cdr.detectChanges(); // Manually trigger change detection as we are updating array object properties
      this.updateScrollButtonState(); // Update scroll button state after visibility changes
    }, options);

    // Observe each task card element
    const taskCards = this.tasksContainer.nativeElement.querySelectorAll('.task-card');
    taskCards.forEach(card => {
      this.intersectionObserver?.observe(card);
    });
  }
}
