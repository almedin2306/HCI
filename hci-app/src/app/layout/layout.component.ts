// src/app/layout/layout-volunteer.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  constructor(public router: Router) { // Inject Router
    // `public` makes it directly accessible in the template
  }

  // You can add a method to check if a specific path is active
  // This helps handle the root/home scenario explicitly
  isLinkActive(url: string): boolean {
    // Check if the current router URL starts with the provided URL
    // For '/home', it will be active when router.url is '/home' or '/' if it's the root redirect
    return this.router.url === url || (url === '/home' && this.router.url === '/');
  }
}
