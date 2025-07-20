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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


// ConfirmationDialogComponent (No changes needed here)
@Component({
  selector: 'app-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="mat-typography">
      {{ data.message }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Odustani</button>
      <button mat-button color="warn" class="dialog-confirm-button" (click)="onConfirm()" cdkFocusInitial>
        {{ data.confirmButtonText }}
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmButtonText: string; }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}


// New Interface for UserRole
export interface UserRole {
  name: string;
  email: string;
  activity: 'Aktivan' | 'Neaktivan';
  registrationDate: Date;
  role: 'Admin' | 'Moderator' | 'Podrška';
  roleChangeDate: Date;
  phoneNumber: string;
}

@Component({
  selector: 'app-admin',
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
    MatSnackBarModule,
    ConfirmationDialogComponent
  ],
  providers: [DatePipe],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  selectedTabIndex = 0;

  columns: string[] = ['name', 'registrationDate', 'role', 'phoneNumber', 'actions', 'more'];
  dataSource = new MatTableDataSource<UserRole>();
  allUsers: UserRole[] = [];
  searchTerm: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchUsers();
  }

  fetchUsers() {
    this.allUsers = [
      { name: 'Moderator 1', email: 'moderator1@example.com', activity: 'Aktivan', registrationDate: new Date('2024-12-01'), role: 'Moderator', roleChangeDate: new Date('2024-12-05'), phoneNumber: '061 123 458' },
      { name: 'Admin 1', email: 'admin1@example.com', activity: 'Aktivan', registrationDate: new Date('2024-12-05'), role: 'Admin', roleChangeDate: new Date('2024-12-05'), phoneNumber: '061 123 456' },
      { name: 'Podrška 1', email: 'podrska1@example.com', activity: 'Aktivan', registrationDate: new Date('2024-12-01'), role: 'Podrška', roleChangeDate: new Date('2024-12-01'), phoneNumber: '061 123 457' },
      { name: 'Admin 2', email: 'admin2@example.com', activity: 'Aktivan', registrationDate: new Date('2024-11-15'), role: 'Admin', roleChangeDate: new Date('2024-11-15'), phoneNumber: '061 555 111' },
      { name: 'Moderator 2', email: 'moderator2@example.com', activity: 'Neaktivan', registrationDate: new Date('2024-11-20'), role: 'Moderator', roleChangeDate: new Date('2024-11-20'), phoneNumber: '061 222 333' },
      { name: 'Podrška 2', email: 'podrska2@example.com', activity: 'Aktivan', registrationDate: new Date('2024-12-02'), role: 'Podrška', roleChangeDate: new Date('2024-12-02'), phoneNumber: '061 777 888' },
      { name: 'Moderator 3', email: 'moderator3@example.com', activity: 'Aktivan', registrationDate: new Date('2024-10-10'), role: 'Moderator', roleChangeDate: new Date('2024-10-10'), phoneNumber: '061 999 000' },
      { name: 'Admin 3', email: 'admin3@example.com', activity: 'Neaktivan', registrationDate: new Date('2024-12-10'), role: 'Admin', roleChangeDate: new Date('2024-12-10'), phoneNumber: '061 444 666' },
      { name: 'Podrška 3', email: 'podrska3@example.com', activity: 'Aktivan', registrationDate: new Date('2024-11-25'), role: 'Podrška', roleChangeDate: new Date('2024-11-25'), phoneNumber: '061 111 222' },
    ];
    this.applyFilter();
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    let filtered = [...this.allUsers];

    const roleFilter = this.getTabRoleFilter();
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (this.selectedActivity !== 'Sve') {
      filtered = filtered.filter(user => user.activity === this.selectedActivity);
    }

    if (term) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phoneNumber.includes(term)
      );
    }

    this.dataSource.data = filtered;
    this.applySort();
  }

  getTabRoleFilter(): 'Admin' | 'Moderator' | 'Podrška' | null {
    switch (this.selectedTabIndex) {
      case 1: return 'Admin';
      case 2: return 'Moderator';
      case 3: return 'Podrška';
      default: return null;
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'Admin': return 'red';
      case 'Moderator': return 'green';
      case 'Podrška': return 'orange';
      default: return 'grey';
    }
  }

  getActivityClass(activity: string): string {
    switch (activity) {
      case 'Aktivan': return 'active';
      case 'Neaktivan': return 'inactive';
      default: return '';
    }
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.dataSource.filterPredicate = (data: UserRole, filter: string) => {
      const nameMatch = data.name.toLowerCase().includes(filter);
      const emailMatch = data.email.toLowerCase().includes(filter);
      const phoneMatch = data.phoneNumber.includes(filter);
      return nameMatch || emailMatch || phoneMatch;
    };

    this.dataSource.filter = term;
  }

  selectedSort: string = '';
  selectedActivity: string = 'Sve';

  applySort() {
    const data = [...this.dataSource.data];

    switch (this.selectedSort) {
      case 'oldestRegistration':
        data.sort((a, b) => a.registrationDate.getTime() - b.registrationDate.getTime());
        break;
      case 'newestRegistration':
        data.sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime());
        break;
      case 'nameAsc':
        data.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        data.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldestRoleChange':
        data.sort((a, b) => a.roleChangeDate.getTime() - b.roleChangeDate.getTime());
        break;
      case 'newestRoleChange':
        data.sort((a, b) => b.roleChangeDate.getTime() - a.roleChangeDate.getTime());
        break;
    }
    this.dataSource.data = data;
  }

  applyActivityFilter() {
    this.applyFilter();
  }

  // Handle role change request from menu item click
  onRoleChangeRequest(user: UserRole, intendedNewRole: UserRole['role']): void {
    const currentRole = user.role; // Get the role BEFORE any changes are processed

    // Case 1: Trying to change to the current role
    if (currentRole === intendedNewRole) {
      this.snackBar.open(
        `Korisnik "${user.name}" već ima ulogu '${intendedNewRole}'.`,
        'Zatvori',
        { duration: 3000, panelClass: ['info-snackbar'] }
      );
      return; // Stop here, no change needed, no dialog
    }

    // Case 2: Admin role restriction
    if (currentRole === 'Admin' && intendedNewRole !== 'Admin') {
      this.snackBar.open(
        `Uloga korisnika "${user.name}" ne može biti promijenjena iz 'Admin' u '${intendedNewRole}'.`,
        'Zatvori',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      return; // Stop here, admin role change is forbidden
    }

    // Case 3: Proceed with confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Potvrdi promjenu uloge',
        message: `Jeste li sigurni da želite promijeniti ulogu korisnika "${user.name}" u "${intendedNewRole}"?`,
        confirmButtonText: 'Promijeni ulogu'
      },
      panelClass: 'status-change-confirmation-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // User confirmed
        user.role = intendedNewRole; // ONLY NOW update the user object
        user.roleChangeDate = new Date();
        this.applyFilter(); // Refresh table to reflect change
        this.snackBar.open(
          `Uloga korisnika "${user.name}" je uspješno promijenjena u '${intendedNewRole}'.`,
          'Zatvori',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        console.log(`User ${user.name} role changed to ${intendedNewRole}.`);
      } else { // User cancelled
        this.snackBar.open(
          `Promjena uloge za korisnika "${user.name}" je otkazana.`,
          'Zatvori',
          { duration: 3000, panelClass: ['info-snackbar'] }
        );
        console.log('Role change cancelled.');
        // No need to revert UI here, as user.role was never changed in the first place due to (click)
      }
    });
  }

  // Activity change (Aktivan/Neaktivan) - similar logic for confirmation
  onActivityChangeRequest(user: UserRole, intendedNewActivity: UserRole['activity']): void {
    const currentActivity = user.activity; // Get the activity BEFORE any changes are processed

    // Case 1: Trying to change to the current activity
    if (currentActivity === intendedNewActivity) {
      this.snackBar.open(
        `Korisnik "${user.name}" je već '${intendedNewActivity}'.`,
        'Zatvori',
        { duration: 3000, panelClass: ['info-snackbar'] }
      );
      return; // Stop here, no change needed, no dialog
    }

    // Case 2: Proceed with confirmation dialog
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Potvrdi promjenu aktivnosti',
        message: `Jeste li sigurni da želite promijeniti aktivnost korisnika "${user.name}" u "${intendedNewActivity}"?`,
        confirmButtonText: 'Promijeni aktivnost'
      },
      panelClass: 'status-change-confirmation-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Only proceed if confirmed
        user.activity = intendedNewActivity; // ONLY NOW update the user object
        this.applyFilter(); // Refresh table to reflect change
        this.snackBar.open(
          `Aktivnost korisnika "${user.name}" je uspješno promijenjena u '${intendedNewActivity}'.`,
          'Zatvori',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        console.log(`User ${user.name} activity changed to ${intendedNewActivity}.`);
      } else {
        this.snackBar.open(
          `Promjena aktivnosti za korisnika "${user.name}" je otkazana.`,
          'Zatvori',
          { duration: 3000, panelClass: ['info-snackbar'] }
        );
        console.log('Activity change cancelled.');
        // No need to revert UI here, as user.activity was never changed in the first place due to (click)
      }
    });
  }

  confirmDeleteUser(user: UserRole): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Potvrdi brisanje',
        message: `Da li ste sigurni da želite izbrisati korisnika "${user.name}"? Ova akcija se ne može poništiti.`,
        confirmButtonText: 'Izbriši'
      },
      panelClass: 'delete-confirmation-dialog-panel'
    });

    dialogRef.afterOpened().subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const confirmButton = this.document.querySelector('.delete-confirmation-dialog-panel .dialog-confirm-button') as HTMLElement;
        if (confirmButton) {
          confirmButton.style.setProperty('background-color', '#e81313', 'important');
          confirmButton.style.setProperty('color', 'white', 'important');
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Only proceed if confirmed
        this.deleteUser(user);
        this.snackBar.open(
          `Korisnik "${user.name}" je uspješno izbrisan.`,
          'Zatvori',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      } else {
        console.log('Deletion cancelled.');
      }
    });
  }

  deleteUser(user: UserRole) {
    this.allUsers = this.allUsers.filter(u => u !== user);
    this.applyFilter();
    console.log(`User ${user.name} deleted.`);
  }
}
