import { Component, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, NgClass, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// Reusing the ConfirmationDialogComponent from the Organizations component
import { ConfirmationDialogComponent } from '../organizations/organizations.component';


// New Interface for Event
export interface Event {
  name: string;
  location: string;
  dateTime: Date; // Combining date and time
  volunteerCount: number;
  organizationName: string; // To display below event name
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    NgClass,
    MatMenuModule,
    MatDividerModule,
    MatRadioModule,
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [DatePipe],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'] // Reusing shared CSS where possible
})
export class EventsComponent {
  selectedTabIndex = 0;

  // Columns for Events - matching the image
  columns: string[] = ['name', 'location', 'dateTime', 'volunteerCount', 'actions', 'more'];
  dataSource = new MatTableDataSource<Event>();
  allEvents: Event[] = []; // Data array for events
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchEvents(); // Fetch event data
  }

  fetchEvents() {
    this.allEvents = [
      { name: 'Čišćenje okoliša', organizationName: 'Zajedno za Prirodu', location: 'Sarajevo', dateTime: new Date('2025-07-25T11:30:00'), volunteerCount: 12 }, // Changed date to future
      { name: 'Sadnja drveća i zelenila', organizationName: 'Mostar Zeleni', location: 'Mostar', dateTime: new Date('2025-07-22T11:30:00'), volunteerCount: 8 }, // Changed date to future
      { name: 'Kreativne radionice za djecu', organizationName: 'Caritas', location: 'Zenica', dateTime: new Date('2025-07-18T13:00:00'), volunteerCount: 20 }, // Changed date to past
      { name: 'Prikupljanje hrane i odjeće', organizationName: 'Pomozi.ba', location: 'Sarajevo', dateTime: new Date('2025-07-19T13:00:00'), volunteerCount: 5 }, // Changed date to past
      { name: 'Podrška u humanitarnim krizama', organizationName: 'Pomozi.ba', location: 'Sarajevo', dateTime: new Date('2025-07-20T10:45:00'), volunteerCount: 15 }, // Changed date to today (past time)
      { name: 'Renoviranje zajedničkih prostora', organizationName: 'Zajedno za Prirodu', location: 'Tuzla', dateTime: new Date('2025-07-21T11:30:00'), volunteerCount: 16 }, // Changed date to future
      { name: 'Čišćenje okoliša', organizationName: 'Ruka Spasa', location: 'Banja Luka', dateTime: new Date('2025-07-15T10:45:00'), volunteerCount: 15 }, // Changed date to past
      { name: 'ConnectCon', organizationName: 'Connect Arena', location: 'Sarajevo', dateTime: new Date('2025-07-28T13:00:00'), volunteerCount: 25 }, // Changed date to future
      { name: 'Kreativne radionice za djecu', organizationName: 'Centar za Mlade', location: 'Bihać', dateTime: new Date('2025-07-16T10:45:00'), volunteerCount: 10 }, // Changed date to past
      { name: 'Edukacija i podrška u zajednici', organizationName: 'Caritas', location: 'Mostar', dateTime: new Date('2025-07-23T11:30:00'), volunteerCount: 8 }, // Changed date to future
    ];
    this.applyFilter();
  }

  onTabChange(index: number) {
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    let filtered = [...this.allEvents];

    const today = new Date();
    // Set today's date to midnight for comparison without time
    today.setHours(0, 0, 0, 0);

    // Apply status filter based on date (Predstojeći/Završeni)
    if (this.selectedStatus === 'Upcoming') {
      filtered = filtered.filter(event => event.dateTime.getTime() >= today.getTime());
    } else if (this.selectedStatus === 'Completed') {
      filtered = filtered.filter(event => event.dateTime.getTime() < today.getTime());
    }

    // Search by name, location, organizationName (if displayed), and possibly date/time for advanced search
    if (term) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term) ||
        event.organizationName.toLowerCase().includes(term) ||
        new DatePipe('en-US').transform(event.dateTime, 'd/MMM/yyyy HH:mm')?.toLowerCase().includes(term) || false
      );
    }

    this.dataSource.data = filtered;
    this.applySort();
  }

  getTabStatusFilter(): string | null {
    return null;
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: Event, filter: string) => {
      const nameMatch = data.name.toLowerCase().includes(filter);
      const locationMatch = data.location.toLowerCase().includes(filter);
      const orgNameMatch = data.organizationName.toLowerCase().includes(filter);
      const dateTimeMatch = new DatePipe('en-US').transform(data.dateTime, 'd/MMM/yyyy HH:mm')?.toLowerCase().includes(filter);
      return nameMatch || locationMatch || orgNameMatch || (dateTimeMatch || false);
    };

    this.dataSource.filter = term;
  }

  selectedSort: string = '';
  // selectedStatus will now be 'Sve', 'Upcoming', or 'Completed'
  selectedStatus: string = 'Sve';

  applySort() {
    const data = [...this.dataSource.data];

    switch (this.selectedSort) {
      case 'mostVolunteers':
        data.sort((a, b) => b.volunteerCount - a.volunteerCount);
        break;
      case 'leastVolunteers':
        data.sort((a, b) => a.volunteerCount - b.volunteerCount);
        break;
      case 'oldestDate':
        data.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
        break;
      case 'newestDate':
        data.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
        break;
    }

    this.dataSource.data = data;
  }

  // This method is called by the filter menu's 'STATUS DOGAĐAJA' radio buttons.
  applyStatusFilter() {
    // Re-apply all filters including the `selectedStatus` which is now date-based
    this.applyFilter();
  }

  confirmDeleteEvent(event: Event): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { organizationName: event.name },
      panelClass: 'delete-confirmation-dialog-panel'
    });

    dialogRef.afterOpened().subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const deleteButton = this.document.querySelector('.delete-confirmation-dialog-panel .dialog-confirm-delete-button') as HTMLElement;
        if (deleteButton) {
          deleteButton.style.setProperty('background-color', '#e81313', 'important');
          deleteButton.style.setProperty('color', 'white', 'important');
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteEvent(event);
      } else {
        console.log('Deletion cancelled.');
      }
    });
  }

  deleteEvent(event: Event) {
    this.allEvents = this.allEvents.filter(e => e !== event);
    this.applyFilter();
    console.log(`Event ${event.name} deleted.`);
  }
}
