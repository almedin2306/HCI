import { Component, OnInit, ViewChildren, ElementRef, QueryList, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

// Interface for the "Trenutno aktivni događaji" cards
interface ActiveEvent {
  day: number;
  month: string;
  title: string;
  location: string;
  timeRange: string;
  remainingPlaces: string;
  organizerName: string;
  organizerLogoUrl: string;
  imageUrl: string; // Background image for the card header
}

// Interface for the "Trenutno aktivni zadaci" cards
interface ActiveTask {
  organizationName: string;
  location: string;
  time: string;
  duration: string;
  taskTitle: string;
}


@Component({
  selector: 'app-volunteer-home.component',
  standalone: true,
  imports: [CommonModule, DatePipe, NgClass],
  templateUrl: './volunteer-home.component.html',
  styleUrl: './volunteer-home.component.css'
})

export class VolunteerHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  activeEvents: ActiveEvent[] = [];
  activeTasks: ActiveTask[] = [];

  // ViewChildren to get references to the card wrappers for scrolling
  @ViewChildren('eventCardWrapper') eventCardWrapper!: QueryList<ElementRef>;
  @ViewChildren('taskCardWrapper') taskCardWrapper!: QueryList<ElementRef>;

  // Properties to control arrow visibility/disabled state
  isEventScrollLeftDisabled: boolean = true;
  isEventScrollRightDisabled: boolean = false;
  isTaskScrollLeftDisabled: boolean = true;
  isTaskScrollRightDisabled: boolean = false;

  private scrollSubscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadMockData();
  }

  ngAfterViewInit(): void {
    // Set initial arrow states after view is initialized and data is loaded
    this.updateScrollButtonStates('events');
    this.updateScrollButtonStates('tasks');

    // Subscribe to scroll events to update button states
    this.eventCardWrapper.changes.subscribe(() => {
      if (this.eventCardWrapper.first) {
        this.scrollSubscriptions.push(
          fromEvent(this.eventCardWrapper.first.nativeElement, 'scroll')
            .pipe(throttleTime(100)) // Throttle to prevent excessive calls
            .subscribe(() => this.updateScrollButtonStates('events'))
        );
      }
      this.updateScrollButtonStates('events'); // Update if content changes
    });

    this.taskCardWrapper.changes.subscribe(() => {
      if (this.taskCardWrapper.first) {
        this.scrollSubscriptions.push(
          fromEvent(this.taskCardWrapper.first.nativeElement, 'scroll')
            .pipe(throttleTime(100)) // Throttle to prevent excessive calls
            .subscribe(() => this.updateScrollButtonStates('tasks'))
        );
      }
      this.updateScrollButtonStates('tasks'); // Update if content changes
    });

    // Initial check in case data loads before ngAfterViewInit changes subscription fires
    setTimeout(() => {
      this.updateScrollButtonStates('events');
      this.updateScrollButtonStates('tasks');
    }, 0);
  }

  ngOnDestroy(): void {
    this.scrollSubscriptions.forEach(sub => sub.unsubscribe());
  }

  loadMockData(): void {
    this.activeEvents = [
      { day: 13, month: 'DEC', title: 'Akcija pošumljavanja', location: 'Skakavac', timeRange: '8:30 - 15:00', remainingPlaces: '100 mjesta preostalo', organizerName: 'Naziv organizatora', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/forest.jpg' },
      { day: 10, month: 'JAN', title: 'Čišćenje gradskog parka', location: 'Park Općine Centar', timeRange: '9:00 - 12:00', remainingPlaces: '75 mjesta preostalo', organizerName: 'Zajedno za prirodu', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/park-clean.jpg' },
      { day: 15, month: 'JAN', title: 'Prikupljanje donacija', location: 'Mercator Dobrinja', timeRange: '10:00 - 18:00', remainingPlaces: 'Neograničeno', organizerName: 'Pomozi.ba', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/donation.jpg' },
      { day: 20, month: 'JAN', title: 'Radionica recikliranja', location: 'Biblioteka Grada', timeRange: '14:00 - 16:00', remainingPlaces: '15 mjesta preostalo', organizerName: 'Eko Aktivisti', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/recycling.jpg' },
      { day: 25, month: 'JAN', title: 'Posjeta staračkom domu', location: 'Dom za starije i nemoćne', timeRange: '11:00 - 14:00', remainingPlaces: '5 mjesta preostalo', organizerName: 'Srcem za Stare', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/elderly.jpg' },
      { day: 28, month: 'JAN', title: 'Edukacija mladih', location: 'Omladinski centar', timeRange: '10:00 - 13:00', remainingPlaces: '30 mjesta preostalo', organizerName: 'Mladi za Mlade', organizerLogoUrl: 'assets/images/user-placeholder.png', imageUrl: 'assets/images/education.jpg' }
    ];

    this.activeTasks = [
      { organizationName: 'Zajedno za Prirodu', location: 'Skladište', time: '8:30', duration: '1h 20min', taskTitle: 'Prikupljanje sadnica' },
      { organizationName: 'Zajedno za Prirodu', location: 'Skladište', time: '8:30', duration: '1h 20min', taskTitle: 'Prikupljanje sadnica' },
      { organizationName: 'Zajedno za Prirodu', location: 'Skladište', time: '8:30', duration: '1h 20min', taskTitle: 'Prikupljanje sadnica' },
      { organizationName: 'Pomoc Svima', location: 'Distributivni centar', time: '9:00', duration: '2h 0min', taskTitle: 'Sortiranje donacija' },
      { organizationName: 'Gradska Cistoca', location: 'Park Centar', time: '10:00', duration: '1h 0min', taskTitle: 'Ciscenje parka' },
      { organizationName: 'Nase Naslijedje', location: 'Muzej', time: '13:00', duration: '3h 30min', taskTitle: 'Arhiviranje dokumenata' },
      { organizationName: 'Studentska Unija', location: 'Kampus', time: '14:00', duration: '2h 0min', taskTitle: 'Pomoc pri tutorstvu' }
    ];
  }

  scroll(direction: 'left' | 'right', wrapperType: 'events' | 'tasks'): void {
    let wrapperElement: HTMLElement | undefined;
    const cardWidth = wrapperType === 'events' ? 350 : 300; // Match CSS card width
    const gap = 20; // Match CSS gap
    const scrollAmount = cardWidth + gap;

    if (wrapperType === 'events' && this.eventCardWrapper.first) {
      wrapperElement = this.eventCardWrapper.first.nativeElement;
    } else if (wrapperType === 'tasks' && this.taskCardWrapper.first) {
      wrapperElement = this.taskCardWrapper.first.nativeElement;
    }

    if (wrapperElement) {
      if (direction === 'left') {
        wrapperElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        wrapperElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      // Update states immediately after scroll initiation
      setTimeout(() => this.updateScrollButtonStates(wrapperType), 300); // Small delay to allow scroll to complete
    }
  }

  updateScrollButtonStates(wrapperType: 'events' | 'tasks'): void {
    let wrapperElement: HTMLElement | undefined;

    if (wrapperType === 'events' && this.eventCardWrapper.first) {
      wrapperElement = this.eventCardWrapper.first.nativeElement;
    } else if (wrapperType === 'tasks' && this.taskCardWrapper.first) {
      wrapperElement = this.taskCardWrapper.first.nativeElement;
    }

    if (wrapperElement) {
      const scrollLeft = wrapperElement.scrollLeft;
      const scrollWidth = wrapperElement.scrollWidth;
      const clientWidth = wrapperElement.clientWidth;

      if (wrapperType === 'events') {
        this.isEventScrollLeftDisabled = scrollLeft === 0;
        this.isEventScrollRightDisabled = scrollLeft + clientWidth >= scrollWidth - 1; // -1 for minor precision issues
      } else {
        this.isTaskScrollLeftDisabled = scrollLeft === 0;
        this.isTaskScrollRightDisabled = scrollLeft + clientWidth >= scrollWidth - 1; // -1 for minor precision issues
      }

      // If content is not scrollable at all (all fits in view), disable both
      if (scrollWidth <= clientWidth) {
        if (wrapperType === 'events') {
          this.isEventScrollLeftDisabled = true;
          this.isEventScrollRightDisabled = true;
        } else {
          this.isTaskScrollLeftDisabled = true;
          this.isTaskScrollRightDisabled = true;
        }
      }
    }
  }
}
