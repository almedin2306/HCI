import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {CreateEventDialogComponent} from '../create-event-dialog.component/create-event-dialog.component'; // Potreban za Angular templejting ako koristite ngIf/ngFor

@Component({
  selector: 'app-organizer-home.component',
  standalone: true, // Ovo ostaje jer je komponenta standalone
  imports: [CommonModule], // Dodano CommonModule za stvari kao što je Datum Pipe ili druge Angular direktive ako ih budete koristili
  templateUrl: './organizer-home.component.html',
  styleUrl: './organizer-home.component.css'
})
export class OrganizerHomeComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  private clockInterval: any; // Za pohranu reference na setInterval kako bismo ga mogli očistiti

  constructor(public dialog: MatDialog) { }

  // ngOnInit se poziva nakon što Angular inicijalizira view i data-bound svojstva komponente.
  // Ovo je idealno mjesto za inicijalizaciju podataka.
  ngOnInit(): void {
    this.updateClock(); // Pozovi odmah funkciju da se vrijeme prikaže čim se stranica učita
    this.clockInterval = setInterval(() => this.updateClock(), 1000); // Postavi interval da se vrijeme ažurira svake sekunde
  }

  // ngOnDestroy se poziva neposredno prije nego što Angular uništi komponentu.
  // Ovdje treba očistiti resurse poput setInterval kako bi se spriječilo curenje memorije.
  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  updateClock(): void {
    const now = new Date(); // Kreira novi Date objekt s trenutnim vremenom i datumom

    // Ažuriranje vremena
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}:${seconds}`;

    // Ažuriranje datuma
    const months = [
      'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
      'Juli', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
    ];

    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();

    // Formatiranje za "13 Decembar 2024"
    this.currentDate = `${day} ${month} ${year}`;

    // Ako želite "Danas: Utorak", možete koristiti i:
    // const daysOfWeek = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];
    // this.currentDayLabel = `${daysOfWeek[now.getDay()]}:`;
  }

  // Ovdje možete dodati i druge metode za logiku vaše komponente, npr. za rad s događajima
  // loadCurrentEvents(): void { /* ... */ }
  // loadMyEvents(): void { /* ... */ }
  // createNewEvent(): void { /* ... */ }
  openCreateEventDialog(): void {
    const dialogRef = this.dialog.open(CreateEventDialogComponent, {
      width: '840px', // Širina dijaloga
      disableClose: true, // Onemogućava zatvaranje klikom izvan dijaloga
    });

    // Ovdje se može slušati rezultat nakon zatvaranja dijaloga
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog je zatvoren, rezultat: ', result);
    });
  }

}
