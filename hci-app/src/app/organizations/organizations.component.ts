// src/app/organizations/organizations.component.ts (or wherever your organizations component is)

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
import {MatDivider, MatDividerModule} from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

// --- UPDATED INTERFACE (unchanged from last iteration, just showing for context) ---
interface Organization {
  name: string;
  email: string;
  activity: 'Aktivna' | 'Neaktivna';
  registrationDate: Date;
  status: 'Odobreno' | 'Odbijeno' | 'Na čekanju';
  statusDate: Date;
  projectCount: number;
  logoUrl?: string; // New: URL for organization logo
  country?: string; // New
  canton?: string;  // New
  city?: string;    // New
  address?: string; // New
  phoneNumber?: string; // New
  description?: string; // New: Optional description
}

// Confirmation Dialog Component (unchanged)
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

// --- MODIFIED: Organization Details Dialog Component ---
@Component({
  selector: 'app-organization-details-dialog',
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <img *ngIf="data.logoUrl" [src]="data.logoUrl" alt="Org Logo" class="organization-logo">
      {{ data.name }}
      <button mat-icon-button class="close-button" mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content class="mat-typography dialog-content">
      <div class="info-section" style="margin-top:10px;"> <h3 style="padding-top:5px;">Osnovne informacije</h3> <div class="info-grid">
        <div class="info-row-pair">
          <div class="info-item">
            <div class="label">Email:</div>
            <div class="value">{{ data.email }}</div>
          </div>
          <div class="info-item">
            <div class="label">Broj telefona:</div>
            <div class="value">{{ data.phoneNumber || 'N/A' }}</div>
          </div>
        </div>

        <div class="info-row-pair">
          <div class="info-item">
            <div class="label">Datum registracije:</div>
            <div class="value">{{ data.registrationDate | date: 'd/MMM/yyyy' }}</div>
          </div>
          <div class="info-item">
            <div class="label">Broj organizovanih događaja:</div>
            <div class="value">{{ data.projectCount }}</div>
          </div>
        </div>

        <div class="info-row-pair">
          <div class="info-item">
            <div class="label" style="margin-bottom: 3px;">Status:</div>
            <div class="value">
              <span class="badge" [ngClass]="getStatusClass(data.status)">● {{ data.status }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="label">Datum promjene statusa:</div>
            <div class="value">{{ data.statusDate | date: 'd/MMM/yyyy' }}</div>
          </div>
        </div>

        <div class="info-item full-width-item">
          <div class="label" style="margin-bottom: 3px;">Aktivnost:</div>
          <div class="value">
              <span [ngClass]="data.activity === 'Aktivna' ? 'active' : 'inactive'">
                ● {{ data.activity }}
              </span>
          </div>
        </div>
      </div>
      </div>

      <mat-divider></mat-divider>

      <div class="info-section">
        <h3 style="padding-top:5px;">Lokacija i Adresa</h3> <div class="info-grid">
        <div class="info-row-pair">
          <div class="info-item">
            <div class="label">Država:</div>
            <div class="value">{{ data.country || 'N/A' }}</div>
          </div>
          <div class="info-item">
            <div class="label">Kanton:</div>
            <div class="value">{{ data.canton || 'N/A' }}</div>
          </div>
        </div>
        <div class="info-row-pair">
          <div class="info-item">
            <div class="label">Grad:</div>
            <div class="value">{{ data.city || 'N/A' }}</div>
          </div>
          <div class="info-item">
            <div class="label">Adresa:</div>
            <div class="value">{{ data.address || 'N/A' }}</div>
          </div>
        </div>
      </div>
      </div>

      <mat-divider *ngIf="data.description"></mat-divider>

      <div class="info-section" *ngIf="data.description">
        <h3 style="padding-top:5px;">Opis</h3> <p class="description-text">{{ data.description }}</p>
      </div>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="primary">Zatvori</button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px 24px;
      font-size: 24px;
      font-weight: 600;
      color: #333;
      border-bottom: 1px solid #eee;
      position: relative; /* For close button positioning */
    }
    .organization-logo {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid #eee;
    }
    .close-button {
      position: absolute;
      right: 15px;
      top: 15px;
      color: #777;
    }
    .dialog-content {
      padding: 24px;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .info-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #555;
      margin-top: 25px; /* Added margin-top */
      margin-bottom: 15px; /* Adjusted margin-bottom */
      border-left: 4px solid #FF7043; /* Accent border */
      padding-left: 10px;
      padding-bottom: 5px; /* Added padding-bottom for visual balance */
      /* Removed padding-top here as it was handled by inline style */
    }
    /* Specific adjustment for the very first title */
    .dialog-content .info-section:first-of-type h3 {
      margin-top: 0; /* Remove top margin for the first section title */
      padding-top: 0; /* Ensure padding-top is also 0 for the first title if margin-top is 0 */
    }

    .info-grid {
      display: grid;
      /* Adjusted gap for better spacing with paired items */
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px 30px; /* Increased row gap for row-pairs, column gap for columns */
    }

    /* Styling for paired info items */
    .info-row-pair {
      display: flex;
      gap: 20px; /* Space between the two items in the pair */
      flex-wrap: wrap; /* Allow items to wrap on smaller screens */
      grid-column: span 1; /* Make the pair take one grid column */
    }
    .info-row-pair .info-item {
      flex: 1 1 calc(50% - 10px); /* Each takes roughly 50% minus half the gap */
      min-width: 120px; /* Prevent shrinking too much */
      display: flex; /* Keep the label/value column layout */
      flex-direction: column;
      gap: 3px;
    }

    /* Existing single info-item styling (retained for non-paired items) */
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    /* If an info-item needs to span full width of the grid, e.g., activity */
    .full-width-item {
      grid-column: 1 / -1; /* Spans all columns in the grid */
    }

    .info-item .label {
      font-weight: 500;
      color: #777;
      font-size: 14px;
    }
    .info-item .value {
      font-size: 16px;
      color: #333;
      word-wrap: break-word; /* Ensure long text wraps */
    }
    /* Re-using existing badge, green, orange, red, active, inactive classes */
    .mat-dialog-actions {
      border-top: 1px solid #eee;
      padding: 15px 24px;
    }
    .description-text {
      font-size: 15px;
      line-height: 1.6;
      color: #444;
    }
    .green {
      background-color: #cdffcc;
      border-radius: 20px;
      padding: 3px 10px;
      color: #017f01;
    }

    .orange {
      background-color: #ffeccc;
      border-radius: 20px;
      padding: 3px 10px;
      color: #ce8600;
    }

    .red {
      background-color: #fee0e0;
      border-radius: 20px;
      padding: 3px 10px;
      color: #d20000;
    }
    .active {
      background-color: #d5d5ed;
      border-radius: 20px;
      padding: 3px 10px;
      color: #4a4bfe;
    }

    .inactive {
      background-color: #f1d6d6;
      border-radius: 20px;
      padding: 3px 10px;
      color: #e53935;
    }

  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, NgClass, MatIconModule, DatePipe, MatDivider]
})
export class OrganizationDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Organization,
  ) {}

  getStatusClass(status: string): string {
    return {
      'Odobreno': 'green',
      'Na čekanju': 'orange',
      'Odbijeno': 'red'
    }[status] || 'grey';
  }
}

// Organizations Component (unchanged from previous step, except for imports and potentially `applySort` for new options)
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
    ConfirmationDialogComponent,
    OrganizationDetailsDialogComponent // Ensure this is imported
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
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.fetchOrganizations();
  }

  fetchOrganizations() {
    this.allOrganizations = [
      {
        name: 'Ruka Spasa',
        email: 'rukaspasa@mail.com',
        activity: 'Aktivna',
        registrationDate: new Date('2024-12-04'),
        status: 'Odobreno',
        statusDate: new Date('2024-12-05'),
        projectCount: 2,
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzAeMG8d6i2owqbLRpb8B_kkVeoGB6_y4vmQ&s', // Placeholder image
        country: 'Bosna i Hercegovina',
        canton: 'Kanton Sarajevo',
        city: 'Sarajevo',
        address: 'Titova 1',
        phoneNumber: '+387 33 123 456',
        description: 'Organizacija "Ruka Spasa" posvećena je pružanju pomoći ugroženim porodicama kroz razne humanitarne akcije i projekte. Cilj nam je osigurati osnovne životne potrepštine i pružiti podršku u kriznim situacijama. Aktivno radimo na terenu kako bismo došli do onih kojima je pomoć najpotrebnija.'
      },
      {
        name: 'Pomozi Ba',
        email: 'pomozi.ba@email.com',
        activity: 'Aktivna',
        registrationDate: new Date('2024-10-15'),
        status: 'Na čekanju',
        statusDate: new Date('2024-10-16'),
        projectCount: 1,
        logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDcMbHHJ_KgUrfjFob1lNjPR4-_yI0SSoqAw&s',
        country: 'Bosna i Hercegovina',
        canton: 'Kanton Sarajevo',
        city: 'Sarajevo',
        address: 'Hamdije Kreševljakovića 14',
        phoneNumber: '+387 33 555 123',
        description: 'Pomozi.ba je vodeća humanitarna organizacija koja se bavi prikupljanjem i distribucijom pomoći širom Bosne i Hercegovine. Naši napori su usmjereni na brzu reakciju u hitnim slučajevima i dugoročnu podršku. Kroz brojne kampanje, uključujemo građane u zajedničko djelovanje za opće dobro.'
      },
      {
        name: 'Nada za Život',
        email: 'nada@zivot.ba',
        activity: 'Neaktivna',
        registrationDate: new Date('2024-08-10'),
        status: 'Odbijeno',
        statusDate: new Date('2024-08-15'),
        projectCount: 0,
        logoUrl: 'https://via.placeholder.com/50/f44336/FFFFFF?text=NŽ',
        country: 'Bosna i Hercegovina',
        canton: 'Tuzlanski kanton',
        city: 'Tuzla',
        address: 'Ulica Nade 7',
        phoneNumber: '+387 35 789 012',
        description: 'Organizacija "Nada za Život" se fokusira na podršku mladima i edukaciju, s ciljem stvaranja bolje budućnosti. Kroz radionice i mentorske programe, osnažujemo mlade generacije da preuzmu aktivnu ulogu u društvu. Iako trenutno neaktivna, vjerujemo u našu misiju i potencijal za buduće projekte.'
      },
      {
        name: 'Humanost u Djelu',
        email: 'humanost@djelu.org',
        activity: 'Aktivna',
        registrationDate: new Date('2024-09-01'),
        status: 'Odobreno',
        statusDate: new Date('2024-09-03'),
        projectCount: 4,
        logoUrl: 'https://via.placeholder.com/50/2196F3/FFFFFF?text=HD',
        country: 'Bosna i Hercegovina',
        canton: 'Zeničko-dobojski kanton',
        city: 'Zenica',
        address: 'Bulevar Kralja Tvrtka 5',
        phoneNumber: '+387 32 456 789',
        description: 'Bavimo se humanitarnim radom i podrškom socijalno ugroženim kategorijama stanovništva. Naši projekti obuhvataju podjelu hrane, odjeće i pružanje psihosocijalne podrške. Težimo pravednijem društvu u kojem niko nije zaboravljen.'
      },
      {
        name: 'Srcem za Djecu',
        email: 'srcem@djeca.com',
        activity: 'Aktivna',
        registrationDate: new Date('2024-07-25'),
        status: 'Na čekanju',
        statusDate: new Date('2024-07-26'),
        projectCount: 2,
        logoUrl: 'https://via.placeholder.com/50/9C27B0/FFFFFF?text=SD',
        country: 'Bosna i Hercegovina',
        canton: 'Hercegovačko-neretvanski kanton',
        city: 'Mostar',
        address: 'Kralja Petra Krešimira IV 10',
        phoneNumber: '+387 36 987 654',
        description: 'Misija organizacije je pružanje podrške djeci s posebnim potrebama i njihovim porodicama. Radimo na stvaranju inkluzivnog okruženja gdje svako dijete ima priliku za razvoj i učenje. Kroz terapije i edukativne programe, poboljšavamo kvalitet života djece i njihovih staratelja.'
      },
      {
        name: 'Dobrovoljci BiH',
        email: 'info@dobrovoljci.ba',
        activity: 'Aktivna',
        registrationDate: new Date('2024-06-12'),
        status: 'Odobreno',
        statusDate: new Date('2024-06-13'),
        projectCount: 3,
        logoUrl: 'https://via.placeholder.com/50/FFEB3B/000000?text=DBH',
        country: 'Bosna i Hercegovina',
        canton: 'Unsko-sanski kanton',
        city: 'Bihać',
        address: 'Bosanska 15',
        phoneNumber: '+387 37 234 567',
        description: 'Udruženje koje okuplja volontere spremne da pomognu u različitim akcijama širom Bosne i Hercegovine. Naši volonteri su srce naše organizacije, posvećeni rješavanju društvenih izazova. Organizujemo akcije čišćenja, podrške starijima i edukativne kampanje za mlade.'
      },
      {
        name: 'Rijec Nade',
        email: 'rijecnade@gmail.com',
        activity: 'Aktivna',
        registrationDate: new Date('2024-04-05'),
        status: 'Odbijeno',
        statusDate: new Date('2024-04-06'),
        projectCount: 0,
        logoUrl: 'https://via.placeholder.com/50/607D8B/FFFFFF?text=RN',
        country: 'Bosna i Hercegovina',
        canton: 'Srednjobosanski kanton',
        city: 'Travnik',
        address: 'Vile Velebita 22',
        phoneNumber: '+387 30 111 222',
        description: 'Fokusirani smo na edukativne programe i podršku ranjivim grupama kroz savjetovanje i mentorske programe. Pružamo individualnu podršku i grupne radionice za razvoj vještina. Naš cilj je osnažiti pojedince da prebrode prepreke i ostvare svoj puni potencijal.'
      },
      {
        name: 'Pomoc Drugima',
        email: 'pomoc@drugima.org',
        activity: 'Aktivna',
        registrationDate: new Date('2024-03-17'),
        status: 'Odobreno',
        statusDate: new Date('2024-03-18'),
        projectCount: 1,
        logoUrl: 'https://via.placeholder.com/50/795548/FFFFFF?text=PD',
        country: 'Bosna i Hercegovina',
        canton: 'Posavski kanton',
        city: 'Orašje',
        address: 'Trg Slobode 3',
        phoneNumber: '+387 31 444 555',
        description: 'Naš cilj je pružanje direktne pomoći pojedincima i porodicama u potrebi kroz donacije i socijalne programe. Redovno organizujemo distribuciju paketa pomoći i podržavamo lokalne inicijative. Vjerujemo da male radnje mogu napraviti veliku razliku u životima ljudi.'
      },
      {
        name: 'Rastimo Zajedno',
        email: 'rastimo@zajedno.ba',
        activity: 'Aktivna',
        registrationDate: new Date('2024-02-20'),
        status: 'Na čekanju',
        statusDate: new Date('2024-02-21'),
        projectCount: 5,
        logoUrl: 'https://via.placeholder.com/50/FFC107/000000?text=RZ',
        country: 'Bosna i Hercegovina',
        canton: 'Zapadnohercegovački kanton',
        city: 'Široki Brijeg',
        address: 'Fra. Didaka Buntića 1',
        phoneNumber: '+387 39 777 888',
        description: 'Organizacija posvećena razvoju zajednice kroz podršku obrazovanju, sportu i kulturnim inicijativama. Kreiramo programe koji potiču aktivno učešće građana i jačaju društvene veze. Naš rad doprinosi stvaranju dinamične i podržavajuće zajednice za sve njene članove.'
      },
      {
        name: 'Volonteri Ujedinjeni',
        email: 'volonteri@ujedinjeni.net',
        activity: 'Aktivna',
        registrationDate: new Date('2024-01-30'),
        status: 'Odobreno',
        statusDate: new Date('2024-01-31'),
        projectCount: 3,
        logoUrl: 'https://via.placeholder.com/50/FF9800/FFFFFF?text=VU',
        country: 'Bosna i Hercegovina',
        canton: 'Kanton 10',
        city: 'Livno',
        address: 'Kraljice Jelene 25',
        phoneNumber: '+387 34 999 000',
        description: 'Mreža volontera koja koordiniše akcije pomoći širom zemlje, s fokusom na ekologiju i socijalnu podršku. Organizujemo ekološke radionice i podržavamo inicijative za zaštitu okoliša. Povezujemo ljude dobre volje kako bismo zajedno radili na pozitivnim promjenama u društvu.'
      },
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

  // Method to open the confirmation dialog (unchanged)
  confirmDeleteOrganization(organization: Organization): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { organizationName: organization.name },
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

  // Method to open organization details dialog (unchanged)
  viewOrganizationDetails(org: Organization): void {
    this.dialog.open(OrganizationDetailsDialogComponent, {
      width: '700px',
      data: org,
      panelClass: 'organization-details-dialog-panel'
    });
  }
}
