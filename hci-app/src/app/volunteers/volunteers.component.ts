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
// Assuming ConfirmationDialogComponent is defined in organizations.component.ts or a shared module
import { ConfirmationDialogComponent } from '../organizations/organizations.component';


// New Interface for Volunteer - Aligned with the structure, but with volunteer-specific data
export interface Volunteer {
  name: string;
  email: string;
  activity: 'Active' | 'Inactive'; // Activity status
  registrationDate: Date;
  hours: number; // For the 'SATI' column (formerly 'Status')
  participations: number; // For the 'UČEŠĆA' column (formerly 'Project Count')
}

@Component({
  selector: 'app-volunteers',
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
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css'] // Reusing shared CSS where possible
})
export class VolunteersComponent {
  selectedTabIndex = 0;

  // Columns for Volunteers - Identical structure to Organizations, but semantic meaning changes
  columns: string[] = ['name', 'registrationDate', 'hours', 'participations', 'actions', 'more'];
  dataSource = new MatTableDataSource<Volunteer>();
  allVolunteers: Volunteer[] = []; // Data array for volunteers
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchVolunteers(); // Fetch volunteer data
  }

  fetchVolunteers() {
    this.allVolunteers = [
      { name: 'Sherman Cannon', email: 'sherman@email.com', activity: 'Active', registrationDate: new Date('2024-12-04'), hours: 5, participations: 2 },
      { name: 'Hassan Wilkins', email: 'hassan@email.com', activity: 'Active', registrationDate: new Date('2024-12-04'), hours: 0, participations: 0 },
      { name: 'Isiah Koch', email: 'isiah@email.com', activity: 'Active', registrationDate: new Date('2024-12-04'), hours: 3, participations: 1 },
      { name: 'Lauren Heath', email: 'lauren@email.com', activity: 'Active', registrationDate: new Date('2024-12-04'), hours: 0, participations: 0 },
      { name: 'Katelyn Benson', email: 'katelyn@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 18, participations: 4 },
      { name: 'Bobbie Sutton', email: 'bobbie@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 23, participations: 7 },
      { name: 'Oswaldo Leon', email: 'oswaldo@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 0, participations: 0 },
      { name: 'Roger Oneill', email: 'roger@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 12, participations: 5 },
      { name: 'Owen Sims', email: 'owen@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 0, participations: 0 },
      { name: 'Wendy Bartlett', email: 'wendy@email.com', activity: 'Active', registrationDate: new Date('2024-12-03'), hours: 27, participations: 8 },
    ];
    this.applyFilter();
  }

  // Tabs for Volunteers: SVI VOLONTERI, Na čekanju, Odobreno, Odbijeno
  // Based on the image, the volunteer page has 'SVI VOLONTERI' tab, but also status filters (Na čekanju etc.) in the 'Sortiraj po' dropdown.
  // The initial screenshot only shows 'SVI VOLONTERI'. Let's keep the tab functionality similar to Organizations for future proofing,
  // mapping to internal activity/status if needed.
  // For now, if no status is explicitly passed by a tab, it means 'All'.
  onTabChange(index: number) {
    // If you plan to add 'Na čekanju', 'Odobreno', 'Odbijeno' tabs for volunteers based on some internal volunteer status,
    // you would map them here. For now, assuming only 'Svi Volonteri' tab, so index 0.
    // If your volunteers also have a 'status' field like organizations:
    // const statusFilters: (string | null)[] = [null, 'Na čekanju', 'Odobreno', 'Odbijeno']; // Example if volunteers had statuses
    // this.applyFilter(statusFilters[index]);
    this.applyFilter(); // No specific tab filter yet, just reapply all filters
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    let filtered = [...this.allVolunteers];

    // No direct tab status filter for volunteers based on the image, but `selectedStatus` from filter menu is used.
    // If `getTabStatusFilter()` needs to influence the initial filter, it should be passed here.
    // For now, tabs are just labels for "SVI VOLONTERI" and do not apply a `status` filter from `Organization` context.

    // Filter by Activity (Aktivni / Neaktivni / Svi) from the filter menu
    if (this.selectedStatus === 'Aktivne') {
      filtered = filtered.filter(vol => vol.activity === 'Active');
    } else if (this.selectedStatus === 'Neaktivne') {
      filtered = filtered.filter(vol => vol.activity === 'Inactive');
    }

    // Search by name and email
    if (term) {
      filtered = filtered.filter(vol =>
        vol.name.toLowerCase().includes(term) ||
        vol.email.toLowerCase().includes(term)
      );
    }

    this.dataSource.data = filtered;

    // Apply sort after filter
    this.applySort();
  }

  // This method would return a status if tabs were filtering by volunteer status.
  // For now, based on the image, there isn't an explicit tab status filter.
  getTabStatusFilter(): string | null {
    // If you implement tabs for volunteer 'status' (e.g., 'Approved', 'Pending', 'Rejected' for volunteers)
    // you'd map selectedTabIndex to that status here.
    // As per the image, only 'SVI VOLONTERI' tab is visible.
    return null;
  }

  // No direct `getStatusClass` needed for `Volunteer` data if there's no `status` property for column.
  // However, `activity` is used in template, so we can use a similar function or direct ngClass.
  getActivityClass(activity: string): string {
    return {
      'Active': 'active',
      'Inactive': 'inactive'
    }[activity] || 'grey';
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: Volunteer, filter: string) => {
      const nameMatch = data.name.toLowerCase().includes(filter);
      const emailMatch = data.email.toLowerCase().includes(filter);
      return nameMatch || emailMatch;
    };

    this.dataSource.filter = term;
  }

  selectedSort: string = '';
  selectedStatus: string = 'Sve'; // Default for Activity filter

  applySort() {
    const data = [...this.dataSource.data];

    switch (this.selectedSort) {
      case 'mostProjects': // This should refer to 'participations' for volunteers
        data.sort((a, b) => b.participations - a.participations);
        break;
      case 'leastProjects': // This should refer to 'participations' for volunteers
        data.sort((a, b) => a.participations - b.participations);
        break;
      case 'mostHours': // New sort option for 'SATI'
        data.sort((a, b) => b.hours - a.hours);
        break;
      case 'leastHours': // New sort option for 'SATI'
        data.sort((a, b) => a.hours - b.hours);
        break;
      case 'oldestReg':
        data.sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime());
        break;
      case 'newestReg':
        data.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
        break;
      // No 'oldestStatus'/'newestStatus' for volunteers based on the image's data structure
    }

    this.dataSource.data = data;
  }

  // This method is called by the filter menu's 'ORGANIZACIJE' (now 'STATUS') radio buttons.
  applyStatusFilter() {
    this.applyFilter(); // Re-apply all filters including the `selectedStatus`
  }

  // Similar to changeOrganizationStatus, but for volunteer activity (if applicable in the 'more' menu)
  changeVolunteerActivity(volunteer: Volunteer, newActivity: 'Active' | 'Inactive') {
    volunteer.activity = newActivity;
    console.log(`Volunteer ${volunteer.name} activity changed to: ${newActivity}`);
    this.applyFilter(); // Re-apply filters to update the view
  }

  // Method to open the confirmation dialog
  confirmDeleteVolunteer(volunteer: Volunteer): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { organizationName: volunteer.name }, // Reusing data.organizationName but passing volunteer name
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
        this.deleteVolunteer(volunteer);
      } else {
        console.log('Deletion cancelled.');
      }
    });
  }

  deleteVolunteer(volunteer: Volunteer) {
    this.allVolunteers = this.allVolunteers.filter(vol => vol !== volunteer);
    this.applyFilter(); // Re-apply filter after deletion
    console.log(`Volunteer ${volunteer.name} deleted.`);
  }
}
