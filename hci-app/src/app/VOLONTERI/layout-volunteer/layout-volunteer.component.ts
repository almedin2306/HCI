// src/app/layout/layout-volunteer.component.ts
import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button'; // Import Router

@Component({
  selector: 'app-layout-volunteer',
  standalone: true,
  imports: [
    MatIcon,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconButton
  ],
  templateUrl: './layout-volunteer.component.html',
  styleUrls: ['./layout-volunteer.component.css']
})
export class LayoutVolunteerComponent {
  constructor(public router: Router) { // Inject Router
    // `public` makes it directly accessible in the template
  }

  // You can add a method to check if a specific path is active
  // This helps handle the root/home scenario explicitly
  isLinkActive(url: string): boolean {
    // Check if the current router URL starts with the provided URL
    // For '/home', it will be active when router.url is '/home' or '/' if it's the root redirect
    return this.router.url === url || (url === '/volunteer/home' && this.router.url === '/volunteer');
  }
}
