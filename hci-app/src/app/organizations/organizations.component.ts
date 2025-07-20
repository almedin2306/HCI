import { Component, ViewChild, Inject, PLATFORM_ID } from '@angular/core'; // Add PLATFORM_ID
import { CommonModule, DatePipe, NgClass, DOCUMENT, isPlatformBrowser } from '@angular/common'; // Add DOCUMENT, isPlatformBrowser
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

interface Organization {
  name: string;
  email: string;
  activity: 'Aktivna' | 'Neaktivna';
  registrationDate: Date;
  status: 'Odobreno' | 'Odbijeno' | 'Na čekanju';
  statusDate: Date;
  projectCount: number;
}

// Confirmation Dialog Component
@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Potvrdi brisanje</h2>
    <mat-dialog-content class="mat-typography">
      Da li ste sigurni da želite izbrisati organizaciju "<b>{{ data.organizationName }}</b>"?
      Ova akcija se ne može poništiti.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Odustani</button>
      <button mat-button color="warn" class="dialog-confirm-delete-button" (click)="onConfirm()" cdkFocusInitial>Izbriši</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organizationName: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// Organizations Component
@Component({
  selector: 'app-organizations',
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
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent {
  selectedTabIndex = 0;

  columns: string[] = ['name', 'registrationDate', 'status', 'projects', 'actions' , 'more'];
  dataSource = new MatTableDataSource<Organization>();
  allOrganizations: Organization[] = [];
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document, // Inject DOCUMENT
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID for browser check
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this.allOrganizations = [
      { name: 'Ruka Spasa', email: 'rukaspasa@mail.com', activity: 'Aktivna', registrationDate: new Date('2024-12-04'), status: 'Odobreno', statusDate: new Date('2024-12-05'), projectCount: 2 },
      { name: 'Pomozi Ba', email: 'pomozi.ba@email.com', activity: 'Aktivna', registrationDate: new Date('2024-10-15'), status: 'Na čekanju', statusDate: new Date('2024-10-16'), projectCount: 1 },
      { name: 'Nada za Život', email: 'nada@zivot.ba', activity: 'Neaktivna', registrationDate: new Date('2024-08-10'), status: 'Odbijeno', statusDate: new Date('2024-08-15'), projectCount: 0 },
      { name: 'Humanost u Djelu', email: 'humanost@djelu.org', activity: 'Aktivna', registrationDate: new Date('2024-09-01'), status: 'Odobreno', statusDate: new Date('2024-09-03'), projectCount: 4 },
      { name: 'Srcem za Djecu', email: 'srcem@djeca.com', activity: 'Aktivna', registrationDate: new Date('2024-07-25'), status: 'Na čekanju', statusDate: new Date('2024-07-26'), projectCount: 2 },
      { name: 'Dobrovoljci BiH', email: 'info@dobrovoljci.ba',activity: 'Aktivna', registrationDate: new Date('2024-06-12'), status: 'Odobreno', statusDate: new Date('2024-06-13'), projectCount: 3 },
      { name: 'Rijec Nade', email: 'rijecnade@gmail.com', activity: 'Aktivna', registrationDate: new Date('2024-04-05'), status: 'Odbijeno', statusDate: new Date('2024-04-06'), projectCount: 0 },
      { name: 'Pomoc Drugima', email: 'pomoc@drugima.org', activity: 'Aktivna', registrationDate: new Date('2024-03-17'), status: 'Odobreno', statusDate: new Date('2024-03-18'), projectCount: 1 },
      { name: 'Rastimo Zajedno', email: 'rastimo@zajedno.ba', activity: 'Aktivna', registrationDate: new Date('2024-02-20'), status: 'Na čekanju', statusDate: new Date('2024-02-21'), projectCount: 5 },
      { name: 'Volonteri Ujedinjeni', email: 'volonteri@ujedinjeni.net', activity: 'Aktivna', registrationDate: new Date('2024-01-30'), status: 'Odobreno', statusDate: new Date('2024-01-31'), projectCount: 3 },
    ];
    this.applyFilter();
  }

  onTabChange(index: number) {
    const statusFilters: (string | null)[] = [null, 'Na čekanju', 'Odobreno', 'Odbijeno'];
    this.applyFilter(statusFilters[index]);
  }

  applyFilter(tabStatus: string | null = null) {
    const term = this.searchTerm.toLowerCase();

    let filtered = [...this.allOrganizations];

    // 1. Tab status (Na čekanju, Odobreno, Odbijeno)
    if (tabStatus) {
      filtered = filtered.filter(org => org.status === tabStatus);
    }

    // 2. Aktivnost (Aktivni / Neaktivni / Svi)
    if (this.selectedStatus === 'Aktivne') {
      filtered = filtered.filter(org => org.activity === 'Aktivna');
    } else if (this.selectedStatus === 'Neaktivne') {
      filtered = filtered.filter(org => org.activity === 'Neaktivna');
    }

    // 3. Search po imenu i emailu
    if (term) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term)
      );
    }

    this.dataSource.data = filtered;

    // 4. Primijeni sortiranje
    this.applySort();
  }


  getTabStatusFilter(): string | null {
    const map: (string | null)[] = [null, 'Na čekanju', 'Odobreno', 'Odbijeno'];
    return map[this.selectedTabIndex];
  }


  sortBy(field: 'registrationDate' | 'statusDate' | 'projectCount', direction: 'asc' | 'desc') {
    const sorted = [...this.dataSource.data].sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];

      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    this.dataSource.data = sorted;
  }


  getStatusClass(status: string): string {
    return {
      'Odobreno': 'green',
      'Na čekanju': 'orange',
      'Odbijeno': 'red'
    }[status] || 'grey';
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: Organization, filter: string) => {
      const nameMatch = data.name.toLowerCase().includes(filter);
      const emailMatch = data.email.toLowerCase().includes(filter);
      return nameMatch || emailMatch;
    };

    this.dataSource.filter = term;
  }

  selectedSort: string = '';
  selectedStatus: string = 'Sve';

  applySort() {
    const data = [...this.dataSource.data];

    switch (this.selectedSort) {
      case 'mostProjects':
        data.sort((a, b) => b.projectCount - a.projectCount);
        break;
      case 'leastProjects':
        data.sort((a, b) => a.projectCount - b.projectCount);
        break;
      case 'oldestReg':
        data.sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime());
        break;
      case 'newestReg':
        data.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
        break;
      case 'oldestStatus':
        data.sort((a, b) => new Date(a.statusDate).getTime() - new Date(b.statusDate).getTime());
        break;
      case 'newestStatus':
        data.sort((a, b) => new Date(b.statusDate).getTime() - new Date(a.statusDate).getTime());
        break;
    }

    this.dataSource.data = data;
  }


  applyStatusFilter() {
    this.applyFilter(this.getTabStatusFilter());
  }

  changeOrganizationStatus(organization: Organization, newStatus: 'Odobreno' | 'Odbijeno' | 'Na čekanju') {
    organization.status = newStatus;
    organization.statusDate = new Date();

    console.log(`Organization ${organization.name} status changed to: ${newStatus}`);
    this.applyFilter(this.getTabStatusFilter());
  }

  // Method to open the confirmation dialog
  confirmDeleteOrganization(organization: Organization): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { organizationName: organization.name },
      panelClass: 'delete-confirmation-dialog-panel' // Keep this for potential fallback or other styling
    });

    // --- NEW JAVASCRIPT CODE TO OVERRIDE INLINE STYLES ---
    dialogRef.afterOpened().subscribe(() => {
      // Ensure we are in a browser environment (important for Server-Side Rendering)
      if (isPlatformBrowser(this.platformId)) {
        // Find the specific button using a class added to the dialog button
        const deleteButton = this.document.querySelector('.delete-confirmation-dialog-panel .dialog-confirm-delete-button') as HTMLElement;

        if (deleteButton) {
          // Apply the desired styles directly
          deleteButton.style.setProperty('background-color', '#e81313', 'important');
          deleteButton.style.setProperty('color', 'white', 'important');

          // Add hover effect if needed (requires a bit more complex JS or a class toggle)
          // For a simple hover, you might still need CSS with !important in global styles,
          // but setting direct styles via JS is primarily for overriding initial inline styles.
          // For hover, let's keep the CSS approach for now, as it's cleaner if possible.
          // If hover also fails in CSS, then it implies a JS solution for hover too.
        }
      }
    });
    // --- END NEW JAVASCRIPT CODE ---

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteOrganization(organization);
      } else {
        console.log('Deletion cancelled.');
      }
    });
  }

  deleteOrganization(organization: Organization) {
    this.allOrganizations = this.allOrganizations.filter(org => org !== organization);
    this.applyFilter(this.getTabStatusFilter());
    console.log(`Organization ${organization.name} deleted.`);
  }
}
