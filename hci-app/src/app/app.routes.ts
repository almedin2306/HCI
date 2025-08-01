// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { LayoutComponent } from './layout/layout.component';
import { VolunteersComponent } from './volunteers/volunteers.component'; // Make sure to create this
import { EventsComponent } from './events/events.component'; // Make sure to create this
import { AdminComponent } from './admin/admin.component'; // Make sure to create this
import { SettingsComponent } from './settings/settings.component'; // Make sure to create this
import {LayoutOrganizerComponent} from './ORGANIZACIJA/layout-organizer/layout-organizer.component';
import {OrganizerHomeComponent} from './ORGANIZACIJA/organizer-home.component/organizer-home.component';
import {LayoutVolunteerComponent} from './VOLONTERI/layout-volunteer/layout-volunteer.component';
import {VolunteerHomeComponent} from './VOLONTERI/volunteer-home.component/volunteer-home.component';
import {VolunteerEventsComponent} from './VOLONTERI/volunteer-events/volunteer-events.component';
import {VolunteerMyEvents} from './VOLONTERI/volunteer-my-events/volunteer-my-events';

export const routes: Routes = [
  {
    path: '', // This means the base URL (e.g., http://localhost:4200/)
    component: LayoutComponent, // The LayoutVolunteerComponent is loaded here
    children: [ // Routes defined here will load their components INTO LayoutVolunteerComponent's <router-outlet>
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirects default to /home
      { path: 'home', component: HomeComponent }, // When /home, HomeComponent loads in router-outlet
      { path: 'organizations', component: OrganizationsComponent }, // When /organizations, OrganizationsComponent loads in router-outlet
      { path: 'volunteers', component: VolunteersComponent },
      { path: 'events', component: EventsComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'settings', component: SettingsComponent },

      // ... add other child routes here
    ],
  },
  { path: 'organization',
    component: LayoutOrganizerComponent ,
    children: [ // Routes defined here will load their components INTO LayoutVolunteerComponent's <router-outlet>
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirects default to /home
      { path: 'home', component: HomeComponent }, // When /home, HomeComponent loads in router-outlet
      { path: 'organizations', component: OrganizerHomeComponent }, // When /organizations, OrganizationsComponent loads in router-outlet
      { path: 'volunteers', component: VolunteersComponent },
      { path: 'events', component: EventsComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: 'volunteer',
    component: LayoutVolunteerComponent ,
    children: [ // Routes defined here will load their components INTO LayoutVolunteerComponent's <router-outlet>
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirects default to /home
      { path: 'home', component: VolunteerHomeComponent }, // When /home, HomeComponent loads in router-outlet
      { path: 'organizations', component: VolunteerEventsComponent}, // When /organizations, OrganizationsComponent loads in router-outlet
      { path: 'volunteers', component: VolunteerMyEvents },
      { path: 'events', component: EventsComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', redirectTo: 'home' } // Catch-all for undefined routes
];
