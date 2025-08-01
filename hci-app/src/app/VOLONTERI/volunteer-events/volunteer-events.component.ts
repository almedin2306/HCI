import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

// Updated Interface for the event cards
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
  category: string;
  // NEW: Fields for the popup modal
  fullDate: string;
  description: string;
  volunteersSignedUp: number;
  volunteersNeeded: number;
  imageUrls: string[];
  tags: string[];
}


@Component({
  selector: 'app-volunteer-events',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule], // Add FormsModule here
  templateUrl: './volunteer-events.component.html',
  styleUrls: ['./volunteer-events.component.css']
})
export class VolunteerEventsComponent implements OnInit, AfterViewInit {

  originalEventsYouMightLike: ActiveEvent[] = [];
  originalNearbyEvents: ActiveEvent[] = [];
  allEvents: ActiveEvent[] = [];

  eventsYouMightLike: ActiveEvent[] = [];
  nearbyEvents: ActiveEvent[] = [];
  filteredEvents: ActiveEvent[] = [];

  searchTerm: string = '';

  categories: string[] = [
    'SVE', 'EKOLOGIJA', 'POMAGANJE LJUDIMA', 'ŽIVOTINJE',
    'SPORT', 'ZDRAVLJE', 'KULTURA I UMJETNOST', 'TEHNOLOGIJA'
  ];
  selectedCategory: string = 'SVE';

  @ViewChild('eventsContainer') eventsContainer!: ElementRef<HTMLElement>;
  @ViewChild('nearbyEventsContainer') nearbyEventsContainer!: ElementRef<HTMLElement>;

  canScrollLeft: boolean = false;
  canScrollRight: boolean = true;

  canNearbyScrollLeft: boolean = false;
  canNearbyScrollRight: boolean = true;

  noEventsYouMightLikeResults: boolean = false;
  noNearbyEventsResults: boolean = false;
  noCategoryEventsResults: boolean = false;

  // NEW: Pop-up properties
  showModal: boolean = false;
  selectedEvent: ActiveEvent | null = null;
  currentImageIndex: number = 0;


  showNotification: boolean = false;
  notificationMessage: string = '';


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadOriginalMockEvents();
    this.loadOriginalMockNearbyEvents();
    this.loadAllEventsForCategories();

    this.eventsYouMightLike = [...this.originalEventsYouMightLike];
    this.nearbyEvents = [...this.originalNearbyEvents];
    this.filterEvents(this.selectedCategory);
  }

  ngAfterViewInit(): void {
    this.updateScrollButtonState();
    this.updateNearbyScrollButtonState();
  }

  // NEW: Metode za pop-up
  openEventDetails(event: ActiveEvent): void {
    this.selectedEvent = event;
    this.currentImageIndex = 0; // Resetirajte galeriju na prvu sliku
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEvent = null;
  }

  nextImage(): void {
    if (this.selectedEvent && this.currentImageIndex < this.selectedEvent.imageUrls.length - 1) {
      this.currentImageIndex++;
    }
  }

  prevImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  applyForEvent(): void {
    if (this.selectedEvent) {
      const eventTitle = this.selectedEvent.title; // Spremi naslov događaja za poruku

      // Povećaj broj prijavljenih volontera
      this.selectedEvent.volunteersSignedUp++;

      // Ukloni događaj iz svih nizova
      this.eventsYouMightLike = this.eventsYouMightLike.filter(event => event.title !== eventTitle);
      this.nearbyEvents = this.nearbyEvents.filter(event => event.title !== eventTitle);
      this.allEvents = this.allEvents.filter(event => event.title !== eventTitle);
      this.filteredEvents = this.filteredEvents.filter(event => event.title !== eventTitle);

      // Ažuriraj stanje scroll tipki
      this.cdr.detectChanges();
      this.updateScrollButtonState();
      this.updateNearbyScrollButtonState();

      this.closeModal();

      // NOVO: Prikaži snackbar notifikaciju
      this.showSnackbarNotification(`Uspješno ste se prijavili na događaj "${eventTitle}"!`);
    }
  }

  /**
   * NOVO: Metoda za prikaz snackbar notifikacije
   */
  showSnackbarNotification(message: string): void {
    this.notificationMessage = message;
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000); // Notifikacija će nestati nakon 3 sekunde
  }


  // Updated Data Loading Methods with new fields
  loadOriginalMockEvents(): void {
    this.originalEventsYouMightLike = [
      {
        day: 5, month: 'AVG', title: 'Čišćenje obale rijeke', location: 'Vilsonovo Šetalište',
        timeRange: '9:00 - 12:00', remainingPlaces: '45 mjesta preostalo',
        organizerName: 'Zeleni put', organizerLogoUrl: 'https://www.zeleniput.com/wp-content/uploads/2022/04/cropped-zeleniputllogosajt.jpg',
        imageUrl: 'https://raport.ba/wp-content/uploads/2023/08/vils.jpg', category: 'EKOLOGIJA',
        fullDate: '05.08.2025.', description: 'Pridružite nam se u akciji čišćenja obala rijeke Miljacke na Vilsonovom šetalištu. Zajedno ćemo ukloniti otpad i doprinijeti ljepšem i čišćem okolišu za sve građane Sarajeva. Dobrodošli su svi koji žele dati svoj doprinos, bez obzira na godine i iskustvo. Očekuje vas ugodno druženje i rad u prirodi.', volunteersSignedUp: 55, volunteersNeeded: 100, tags: ['Ekologija', 'Pomaganje ljudima', 'Životinje', 'Zdravlje'],
        imageUrls: [
          'https://raport.ba/wp-content/uploads/2023/08/vils.jpg',
          'https://avaz.ba/media/2019/01/27/830190/vilsonovo-mufa.jpg',
          'https://storage.radiosarajevo.ba/article/567007/871x540/vilsonovo-jesen-admir-kuburovic-rsa-novembar-2024-3.jpg?v1730906531'
        ]
      },
      {
        day: 12, month: 'AVG', title: 'Radionica reciklaže', location: 'Centar za mlade',
        timeRange: '13:00 - 16:00', remainingPlaces: '20 mjesta preostalo',
        organizerName: 'Recikliraj s nama', organizerLogoUrl: 'https://www.cistoca.ba/wp-content/uploads/2014/06/New-Picture.png',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIGXXoZ67Spa6Xccucv6bKJmuXolvrXLoX8g&s', category: 'EKOLOGIJA',
        fullDate: '12.08.2025.', description: 'Naučite osnove reciklaže i kako pravilno odvajati otpad u našoj zabavnoj i edukativnoj radionici. Kroz praktične primjere, saznat ćete kako prenamijeniti stare materijale i doprinijeti smanjenju zagađenja. Radionica je namijenjena svima, od najmlađih do najstarijih entuzijasta.', volunteersSignedUp: 30, volunteersNeeded: 50, tags: ['Ekologija', 'Edukacija'],
        imageUrls: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIGXXoZ67Spa6Xccucv6bKJmuXolvrXLoX8g&s',
          'https://www.prijatelji-zivotinja.hr/data/images/2020/60/radionica-reciklaze-u-zagrebu-2.jpg',
          'https://www.cistoca.ba/wp-content/uploads/2014/06/New-Picture.png'
        ]
      },
      {
        day: 18, month: 'AVG', title: 'Podjela obroka beskućnicima', location: 'Stari Grad',
        timeRange: '17:00 - 19:00', remainingPlaces: '10 mjesta preostalo',
        organizerName: 'Srce grada', organizerLogoUrl: 'https://depo.ba/media/pictures/2023/07/20/thumbs/64b90a16-7524-482d-9ea9-44f40a0a0a78-heart-of-sarajevo-award-preview.jpeg',
        imageUrl: 'https://www.etrafika.net/slike/2020/12/mozaik-prijateljstva-banjaluka-foto-ajdin-kamber-3.jpg', category: 'POMAGANJE LJUDIMA',
        fullDate: '18.08.2025.', description: 'Pridružite se našem timu u pripremi i podjeli toplih obroka za sugrađane u potrebi. Vaša pomoć je dragocjena i čini razliku u životima onih koji nemaju svoj dom. Sastajemo se ispred gradske vijećnice, a zatim krećemo u akciju.', volunteersSignedUp: 40, volunteersNeeded: 50, tags: ['Socijalna pomoć'],
        imageUrls: [
          'https://www.etrafika.net/slike/2020/12/mozaik-prijateljstva-banjaluka-foto-ajdin-kamber-3.jpg',
          'https://depo.ba/media/pictures/2023/07/20/thumbs/64b90a16-7524-482d-9ea9-44f40a0a0a78-heart-of-sarajevo-award-preview.jpeg',
          'https://www.osmicajurajac.com/wp-content/uploads/2020/09/pomoc-hrana-beskucnicima.jpg'
        ]
      },
      {
        day: 25, month: 'AVG', title: 'Edukacija o prvoj pomoći', location: 'Dom zdravlja',
        timeRange: '10:00 - 14:00', remainingPlaces: '30 mjesta preostalo',
        organizerName: 'Crveni križ', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVL9kea7k8Yd8M0g_urDsQ2MI65A41TAFOXw&s',
        imageUrl: 'https://inz.ba/wp-content/uploads/2024/09/PRVA-POMOC.jpg', category: 'ZDRAVLJE',
        fullDate: '25.08.2025.', description: 'Kroz ovu interaktivnu radionicu, naučit ćete osnovne vještine prve pomoći koje mogu spasiti život. Instruktori Crvenog križa će vas provesti kroz tehnike oživljavanja, zaustavljanja krvarenja i zbrinjavanja povreda. Svi polaznici će dobiti certifikat o završenoj obuci.', volunteersSignedUp: 20, volunteersNeeded: 50, tags: ['Zdravlje', 'Edukacija'],
        imageUrls: [
          'https://inz.ba/wp-content/uploads/2024/09/PRVA-POMOC.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVL9kea7k8Yd8M0g_urDsQ2MI65A41TAFOXw&s',
          'https://www.zzjz.hr/wp-content/uploads/2019/08/prva_pomoc.jpg'
        ]
      },
      {
        day: 3, month: 'SEP', title: 'Pomoć u skloništu za životinje', location: 'Azil Sarajevo',
        timeRange: '11:00 - 15:00', remainingPlaces: '15 mjesta preostalo',
        organizerName: 'Sretne šape', organizerLogoUrl: 'https://azildubrovnik.com/wp-content/uploads/2025/01/Logo-azil.png',
        imageUrl: 'https://banjalukain.com/media/pictures/2013/09/04/78e4a13d723b83a32d47002e75ed4211.jpg', category: 'ŽIVOTINJE',
        fullDate: '03.09.2025.', description: 'Volontirajte u azilu i pomozite napuštenim životinjama. Vaš zadatak će biti šetanje pasa, čišćenje boksova i maženje s mačkama. Svaka pomoć je dobrodošla i doprinosi boljem životu naših četveronožnih prijatelja.', volunteersSignedUp: 35, volunteersNeeded: 50, tags: ['Životinje'],
        imageUrls: [
          'https://banjalukain.com/media/pictures/2013/09/04/78e4a13d723b83a32d47002e75ed4211.jpg',
          'https://azildubrovnik.com/wp-content/uploads/2025/01/Logo-azil.png',
          'https://azilsretnesape.ba/wp-content/uploads/2022/01/volontiranje.jpg'
        ]
      }
    ];
  }

  loadOriginalMockNearbyEvents(): void {
    this.originalNearbyEvents = [
      {
        day: 8, month: 'SEP', title: 'Pošumljavanje Trebevića', location: 'Sarajevo, Trebević',
        timeRange: '9:00 - 16:00', remainingPlaces: '60 mjesta preostalo',
        organizerName: 'Šume BiH', organizerLogoUrl: 'https://i.ibb.co/C5fLw1D/Screenshot-2024-07-29-173602.png',
        imageUrl: 'https://i.ibb.co/y55L31Q/Screenshot-2024-07-29-173822.png', category: 'EKOLOGIJA',
        fullDate: '08.09.2025.', description: 'Pridružite se akciji pošumljavanja na Trebeviću i pomozite u obnovi šumskog fonda. Posadit ćemo hiljade novih sadnica i doprinijeti zdravijem ekosistemu. Osigurani su sav alat i stručno vodstvo, a očekuje vas i ukusan obrok u prirodi.', volunteersSignedUp: 40, volunteersNeeded: 100, tags: ['Ekologija', 'Šumarstvo'],
        imageUrls: [
          'https://i.ibb.co/y55L31Q/Screenshot-2024-07-29-173822.png',
          'https://i.ibb.co/C5fLw1D/Screenshot-2024-07-29-173602.png',
          'https://www.portal-bihać.com/wp-content/uploads/2021/04/posumljavanje-bihac.jpg'
        ]
      },
      {
        day: 15, month: 'SEP', title: 'Čišćenje obale Neretve', location: 'Mostar, Stari most',
        timeRange: '10:00 - 13:00', remainingPlaces: '30 mjesta preostalo',
        organizerName: 'Čista Neretva', organizerLogoUrl: 'https://i.ibb.co/F827J6F/Screenshot-2024-07-29-173541.png',
        imageUrl: 'https://i.ibb.co/zXqX3V2/Screenshot-2024-07-29-173950.png', category: 'EKOLOGIJA',
        fullDate: '15.09.2025.', description: 'Udružimo snage i očistimo obale Neretve od otpada. Ova akcija ima za cilj podizanje svijesti o važnosti očuvanja naših rijeka i prirodnih resursa. Svi volonteri će dobiti opremu i osvježenje. Pokažimo da nam je stalo!', volunteersSignedUp: 10, volunteersNeeded: 40, tags: ['Ekologija', 'Voda'],
        imageUrls: [
          'https://i.ibb.co/zXqX3V2/Screenshot-2024-07-29-173950.png',
          'https://i.ibb.co/F827J6F/Screenshot-2024-07-29-173541.png',
          'https://www.startbih.info/wp-content/uploads/2019/08/neretva-ciscenje-rijeke.jpg'
        ]
      },
      {
        day: 22, month: 'SEP', title: 'Volontiranje u azilu', location: 'Banja Luka, Azil Sretni Dom',
        timeRange: '11:00 - 15:00', remainingPlaces: '10 mjesta preostalo',
        organizerName: 'Banjalučki azil', organizerLogoUrl: 'https://i.ibb.co/hK7JgWk/Screenshot-2024-07-29-173702.png',
        imageUrl: 'https://i.ibb.co/YyY4R0F/Screenshot-2024-07-29-174100.png', category: 'ŽIVOTINJE',
        fullDate: '22.09.2025.', description: 'Pomozite u brizi za napuštene životinje u banjalučkom azilu. Vaši zadaci uključuju šetnju pasa, hranjenje, čišćenje prostora i druženje sa životinjama. Pokažite im ljubav i pažnju koju zaslužuju.', volunteersSignedUp: 15, volunteersNeeded: 25, tags: ['Životinje'],
        imageUrls: [
          'https://i.ibb.co/YyY4R0F/Screenshot-2024-07-29-174100.png',
          'https://i.ibb.co/hK7JgWk/Screenshot-2024-07-29-173702.png',
          'https://www.azilsretnapsapa.ba/wp-content/uploads/2021/05/volontiranje.jpg'
        ]
      },
      {
        day: 1, month: 'OKT', title: 'Uređenje parka Slana Banja', location: 'Tuzla, Slana Banja',
        timeRange: '9:30 - 14:00', remainingPlaces: '25 mjesta preostalo',
        organizerName: 'Gradska čistoća', organizerLogoUrl: 'https://i.ibb.co/R9m0sL3/Screenshot-2024-07-29-173621.png',
        imageUrl: 'https://i.ibb.co/r735fXN/Screenshot-2024-07-29-173909.png', category: 'EKOLOGIJA',
        fullDate: '01.10.2025.', description: 'Pridružite se akciji uređenja najljepšeg tuzlanskog parka. Očistit ćemo staze, posaditi nove cvjetne gredice i obnoviti klupe. Učinite Slana Banju još ljepšom za sve građane.', volunteersSignedUp: 20, volunteersNeeded: 45, tags: ['Ekologija', 'Uređenje'],
        imageUrls: [
          'https://i.ibb.co/r735fXN/Screenshot-2024-07-29-173909.png',
          'https://i.ibb.co/R9m0sL3/Screenshot-2024-07-29-173621.png',
          'https://tuzlanski.ba/wp-content/uploads/2018/05/slana-banja-park.jpg'
        ]
      },
      {
        day: 8, month: 'OKT', title: 'Akcija hranjenja pasa lutalica', location: 'Zenica, Kamberovića Polje',
        timeRange: '16:00 - 18:00', remainingPlaces: '12 mjesta preostalo',
        organizerName: 'Prijatelji životinja Zenica', organizerLogoUrl: 'https://i.ibb.co/Fhmr61w/Screenshot-2024-07-29-173641.png',
        imageUrl: 'https://i.ibb.co/9gPjH43/Screenshot-2024-07-29-174026.png', category: 'ŽIVOTINJE',
        fullDate: '08.10.2025.', description: 'Organizujemo akciju hranjenja pasa lutalica u Zenici. Vaša pomoć u pripremi i distribuciji hrane je neprocjenjiva. Pokazat ćemo humanost i brigu za životinje koje nemaju dom.', volunteersSignedUp: 18, volunteersNeeded: 30, tags: ['Životinje'],
        imageUrls: [
          'https://i.ibb.co/9gPjH43/Screenshot-2024-07-29-174026.png',
          'https://i.ibb.co/Fhmr61w/Screenshot-2024-07-29-173641.png',
          'https://faktor.ba/wp-content/uploads/2021/03/psi-lutalice-zenica.jpg'
        ]
      },
      {
        day: 15, month: 'OKT', title: 'Očuvanje vlažnih staništa', location: 'Livanjsko Polje',
        timeRange: '8:00 - 17:00', remainingPlaces: '18 mjesta preostalo',
        organizerName: 'Eko Livanjsko Polje', organizerLogoUrl: 'https://i.ibb.co/C5fLw1D/Screenshot-2024-07-29-173602.png',
        imageUrl: 'https://i.ibb.co/y55L31Q/Screenshot-2024-07-29-173822.png', category: 'EKOLOGIJA',
        fullDate: '15.10.2025.', description: 'Pridružite nam se u akciji očuvanja jedinstvenih vlažnih staništa Livanjskog polja. Radit ćemo na čišćenju kanala i obnovi ekosistema. Očekuje vas cjelodnevno volontiranje u prelijepoj prirodi.', volunteersSignedUp: 32, volunteersNeeded: 50, tags: ['Ekologija', 'Priroda'],
        imageUrls: [
          'https://i.ibb.co/y55L31Q/Screenshot-2024-07-29-173822.png',
          'https://i.ibb.co/C5fLw1D/Screenshot-2024-07-29-173602.png',
          'https://www.bljesak.info/assets/img/content/livanjko-polje.jpg'
        ]
      },
      {
        day: 20, month: 'OKT', title: 'Edukacija o pčelarstvu', location: 'Bihać, Centar za pčelarstvo',
        timeRange: '10:00 - 14:00', remainingPlaces: '22 mjesta preostalo',
        organizerName: 'Pčelarsko društvo Bihać', organizerLogoUrl: 'https://i.ibb.co/F827J6F/Screenshot-2024-07-29-173541.png',
        imageUrl: 'https://i.ibb.co/zXqX3V2/Screenshot-2024-07-29-173950.png', category: 'EKOLOGIJA',
        fullDate: '20.10.2025.', description: 'Naučite osnove pčelarstva, važnost pčela za ekosistem i kako im pomoći. Kroz teorijski i praktični dio, iskusni pčelari će vas uvesti u fascinantni svijet pčela. Radionica je otvorena za sve zainteresovane.', volunteersSignedUp: 18, volunteersNeeded: 40, tags: ['Ekologija', 'Edukacija'],
        imageUrls: [
          'https://i.ibb.co/zXqX3V2/Screenshot-2024-07-29-173950.png',
          'https://i.ibb.co/F827J6F/Screenshot-2024-07-29-173541.png',
          'https://www.bihać.com/wp-content/uploads/2020/07/pcelarstvo-radionica.jpg'
        ]
      },
    ];
  }

  loadAllEventsForCategories(): void {
    const allCombinedEvents = [
      ...this.originalEventsYouMightLike,
      ...this.originalNearbyEvents,
      {
        day: 10, month: 'NOV', title: 'Turnir u malom nogometu', location: 'Sarajevo, Skenderija',
        timeRange: '10:00 - 18:00', remainingPlaces: '50 mjesta preostalo',
        organizerName: 'Sport za sve', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M3y_jYkR7m_QkP_1kP2k_8P_1kP2k_8P_1kP2k_8P&s',
        imageUrl: 'https://sportsport.ba/assets/pictures/article/2023/10/thumb/banjaluka-futsal-foto-futsalsrbija-crop.jpg', category: 'SPORT',
        fullDate: '10.11.2025.', description: 'Organizujemo humanitarni turnir u malom nogometu. Prijavite svoju ekipu i pomozite nam prikupiti sredstva za lokalnu dječiju bolnicu. Uz sportsko nadmetanje, očekuje vas i odlična atmosfera.', volunteersSignedUp: 80, volunteersNeeded: 100, tags: ['Sport'],
        imageUrls: [
          'https://sportsport.ba/assets/pictures/article/2023/10/thumb/banjaluka-futsal-foto-futsalsrbija-crop.jpg',
          'https://www.skenderija.ba/wp-content/uploads/2021/09/mali-nogomet.jpg',
          'https://www.klix.ba/sport/futsal/futsal-turnir-sarajevo-skenderija/190804034.jpg'
        ]
      },
      {
        day: 17, month: 'NOV', title: 'Maraton za djecu', location: 'Banja Luka, Mladen Stojanović',
        timeRange: '9:00 - 12:00', remainingPlaces: '100 mjesta preostalo',
        organizerName: 'Dječiji osmijeh', organizerLogoUrl: 'https://www.osmijeh.com/wp-content/uploads/2020/07/Osmijeh-logo.png',
        imageUrl: 'https://banjalukain.com/media/pictures/2017/04/23/thumb/maraton-banjaluka-foto-rtvbn-crop.jpg', category: 'SPORT',
        fullDate: '17.11.2025.', description: 'Pridružite se najmlađim učesnicima u njihovom prvom maratonu. Cilj je promicanje zdravih životnih navika kod djece, a sav prihod ide u humanitarne svrhe. Navijajte za male trkače i podržite ih u njihovom podvigu.', volunteersSignedUp: 150, volunteersNeeded: 250, tags: ['Sport', 'Djeca'],
        imageUrls: [
          'https://banjalukain.com/media/pictures/2017/04/23/thumb/maraton-banjaluka-foto-rtvbn-crop.jpg',
          'https://www.osmijeh.com/wp-content/uploads/2020/07/Osmijeh-logo.png',
          'https://www.klix.ba/sport/atletika/maraton-za-djecu-banja-luka/180517034.jpg'
        ]
      },
      {
        day: 24, month: 'NOV', title: 'Pomoć u galeriji Ars Aevi', location: 'Sarajevo, Ars Aevi',
        timeRange: '14:00 - 17:00', remainingPlaces: '5 mjesta preostalo',
        organizerName: 'Ars Aevi', organizerLogoUrl: 'https://ars-aevi.eu/wp-content/uploads/2016/09/cropped-ArsAevi-LOGO.png',
        imageUrl: 'https://i.pinimg.com/736x/87/a6/0b/87a60b94c3c3a9f0f9b6e8e8e7c7c7a5.jpg', category: 'KULTURA I UMJETNOST',
        fullDate: '24.11.2025.', description: 'Volontirajte u pripremi izložbe u galeriji Ars Aevi. Vaša pomoć će biti potrebna pri postavljanju umjetnina, pripremi kataloga i dočeku posjetitelja. Ovo je jedinstvena prilika da budete dio kulturnog događaja godine.', volunteersSignedUp: 5, volunteersNeeded: 10, tags: ['Kultura', 'Umjetnost'],
        imageUrls: [
          'https://i.pinimg.com/736x/87/a6/0b/87a60b94c3c3a9f0f9b6e8e8e7c7c7a5.jpg',
          'https://ars-aevi.eu/wp-content/uploads/2016/09/cropped-ArsAevi-LOGO.png',
          'https://www.klix.ba/magazin/kultura/ars-aevi-sarajevo-izlozba/191124034.jpg'
        ]
      },
      {
        day: 2, month: 'DEC', title: 'Veče poezije i književnosti', location: 'Mostar, OKC Abrašević',
        timeRange: '19:00 - 21:00', remainingPlaces: '15 mjesta preostalo',
        organizerName: 'Mostarski krug', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7-M3y_jYkR7m_QkP_1kP2k_8P_1kP2k_8P_1kP2k_8P&s',
        imageUrl: 'https://pbs.twimg.com/media/F4P0_49WwAEp99v?format=jpg&name=large', category: 'KULTURA I UMJETNOST',
        fullDate: '02.12.2025.', description: 'Pomozite u organizaciji večeri poezije i književnosti. Bit ćete zaduženi za doček gostiju, tehničku podršku i osiguravanje ugodne atmosfere. Uživajte u književnosti i doprinesite lokalnoj kulturnoj sceni.', volunteersSignedUp: 15, volunteersNeeded: 30, tags: ['Kultura', 'Književnost'],
        imageUrls: [
          'https://pbs.twimg.com/media/F4P0_49WwAEp99v?format=jpg&name=large',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7-M3y_jYkR7m_QkP_1kP2k_8P_1kP2k_8P_1kP2k_8P&s',
          'https://www.okc-abrasevic.ba/wp-content/uploads/2018/03/poezija.jpg'
        ]
      },
      {
        day: 9, month: 'DEC', title: 'Radionica kodiranja za početnike', location: 'Tuzla, BIT Centar',
        timeRange: '10:00 - 15:00', remainingPlaces: '20 mjesta preostalo',
        organizerName: 'Code Hub BiH', organizerLogoUrl: 'https://bitcamp.ba/wp-content/uploads/2023/08/logo-bit.png',
        imageUrl: 'https://www.bitcamp.ba/wp-content/uploads/2023/07/kodiranje-za-pocetnike.jpg', category: 'TEHNOLOGIJA',
        fullDate: '09.12.2025.', description: 'Učestvujte kao mentor na radionici kodiranja za mlade. Pomozite im da naprave prve korake u svijetu programiranja i inspirirajte ih da nastave razvijati svoje vještine. Poznavanje osnova kodiranja je poželjno, ali nije obavezno.', volunteersSignedUp: 20, volunteersNeeded: 40, tags: ['Tehnologija', 'Edukacija'],
        imageUrls: [
          'https://www.bitcamp.ba/wp-content/uploads/2023/07/kodiranje-za-pocetnike.jpg',
          'https://bitcamp.ba/wp-content/uploads/2023/08/logo-bit.png',
          'https://www.klix.ba/scitech/tehnologija/radionica-kodiranja-tuzla/170908034.jpg'
        ]
      },
      {
        day: 16, month: 'DEC', title: 'Sastavljanje računara za škole', location: 'Zenica, IT Hub',
        timeRange: '9:00 - 17:00', remainingPlaces: '10 mjesta preostalo',
        organizerName: 'Digitalni most', organizerLogoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_1J_x_1J_x_1J_x_1J_x_1J_x_1J_x_1J&s',
        imageUrl: 'https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/media/image/2016/08/179853-ordenador-partes.jpg', category: 'TEHNOLOGIJA',
        fullDate: '16.12.2025.', description: 'Pomozite nam da sastavimo i pripremimo računare za lokalne škole. Vaš doprinos će omogućiti učenicima da uče u modernijim učionicama i razvijaju digitalne vještine. Tražimo volontere sa osnovnim tehničkim znanjem.', volunteersSignedUp: 10, volunteersNeeded: 20, tags: ['Tehnologija'],
        imageUrls: [
          'https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/media/image/2016/08/179853-ordenador-partes.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_1J_x_1J_x_1J_x_1J_x_1J_x_1J_x_1J&s',
          'https://www.bitcamp.ba/wp-content/uploads/2023/07/sastavljanje-racunara.jpg'
        ]
      },
      {
        day: 23, month: 'DEC', title: 'Savjetovalište za mentalno zdravlje', location: 'Sarajevo, Centar za podršku',
        timeRange: '10:00 - 14:00', remainingPlaces: 'Nema ograničenja',
        organizerName: 'Život Plus', organizerLogoUrl: 'https://www.zivotplus.ba/wp-content/uploads/2017/01/logo.png',
        imageUrl: 'https://www.psiho.ba/wp-content/uploads/2020/09/mentalno-zdravlje.jpg', category: 'ZDRAVLJE',
        fullDate: '23.12.2025.', description: 'Pridružite nam se u našem savjetovalištu za mentalno zdravlje. Tražimo volontere za administrativne poslove, organizaciju radionica i podršku klijentima. Vaša empatija i spremnost na pomoć su ključni.', volunteersSignedUp: 0, volunteersNeeded: 5, tags: ['Zdravlje'],
        imageUrls: [
          'https://www.psiho.ba/wp-content/uploads/2020/09/mentalno-zdravlje.jpg',
          'https://www.zivotplus.ba/wp-content/uploads/2017/01/logo.png',
          'https://www.mentalno-zdravlje.ba/wp-content/uploads/2019/11/savjetovaliste.jpg'
        ]
      }
    ];
    const uniqueEvents = new Map<string, ActiveEvent>();
    allCombinedEvents.forEach(event => uniqueEvents.set(event.title + event.location, event));
    this.allEvents = Array.from(uniqueEvents.values());
  }

  // --- Search Logic ---
  performSearch(): void {
    const query = this.searchTerm.toLowerCase().trim();

    // Section 1: Events You Might Like
    this.eventsYouMightLike = this.originalEventsYouMightLike.filter(event =>
      this.matchEvent(event, query)
    );
    this.noEventsYouMightLikeResults = this.eventsYouMightLike.length === 0 && query !== '';

    // Section 2: Nearby Events
    this.nearbyEvents = this.originalNearbyEvents.filter(event =>
      this.matchEvent(event, query)
    );
    this.noNearbyEventsResults = this.nearbyEvents.length === 0 && query !== '';

    // Section 3: Category Filtered Events (applies category filter THEN search)
    let categoryFilteredSource = this.selectedCategory === 'SVE' ?
      [...this.allEvents] :
      this.allEvents.filter(event => event.category === this.selectedCategory);

    this.filteredEvents = categoryFilteredSource.filter(event =>
      this.matchEvent(event, query)
    );
    this.noCategoryEventsResults = this.filteredEvents.length === 0 && query !== '';

    // Re-check scroll button states after filtering might change content width
    this.updateScrollButtonState();
    this.updateNearbyScrollButtonState();
    this.cdr.detectChanges(); // Ensure UI updates
  }

  private matchEvent(event: ActiveEvent, query: string): boolean {
    if (!query) {
      return true; // If no query, all events match
    }
    const eventDate = `${event.day} ${event.month.toLowerCase()}`; // e.g., "5 avg"
    return event.title.toLowerCase().includes(query) ||
      event.organizerName.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      eventDate.includes(query);
  }

  // --- Category Filter Logic (for Section 3) ---
  filterEvents(category: string): void {
    this.selectedCategory = category;
    this.performSearch(); // Re-run search to apply category filter + current search term
  }

  // --- Scroll Logic (Unchanged from previous versions) ---
  scrollEvents(direction: 'left' | 'right'): void {
    this.performScroll(this.eventsContainer.nativeElement, direction);
  }

  onEventsScroll(): void {
    this.updateScrollButtonState();
  }

  private updateScrollButtonState(): void {
    this.updateArrowState(this.eventsContainer.nativeElement, 'events');
  }

  scrollNearbyEvents(direction: 'left' | 'right'): void {
    this.performScroll(this.nearbyEventsContainer.nativeElement, direction);
  }

  onNearbyEventsScroll(): void {
    this.updateNearbyScrollButtonState();
  }

  private updateNearbyScrollButtonState(): void {
    this.updateArrowState(this.nearbyEventsContainer.nativeElement, 'nearbyEvents');
  }

  private performScroll(container: HTMLElement, direction: 'left' | 'right'): void {
    if (!container) return;

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

  private updateArrowState(container: HTMLElement, type: 'events' | 'nearbyEvents'): void {
    if (!container) {
      if (type === 'events') {
        this.canScrollLeft = false;
        this.canScrollRight = false;
      } else {
        this.canNearbyScrollLeft = false;
        this.canNearbyScrollRight = false;
      }
      return;
    }

    const scrolledLeft = container.scrollLeft > 0;
    const scrolledRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1; // -1 for tolerance

    if (type === 'events') {
      this.canScrollLeft = scrolledLeft;
      this.canScrollRight = scrolledRight;
    } else {
      this.canNearbyScrollLeft = scrolledLeft;
      this.canNearbyScrollRight = scrolledRight;
    }
    this.cdr.detectChanges();
  }
}
