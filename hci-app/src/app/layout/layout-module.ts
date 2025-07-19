  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { LayoutComponent } from './layout.component';
  import { MatSidenavModule } from '@angular/material/sidenav';
  import { MatIconModule } from '@angular/material/icon';
  import { MatListModule } from '@angular/material/list';
  import { MatButtonModule } from '@angular/material/button';
  import { RouterModule } from '@angular/router';

  @NgModule({
    declarations: [LayoutComponent],
    imports: [
      CommonModule,
      MatSidenavModule,
      MatIconModule,
      MatListModule,
      MatButtonModule,
      RouterModule
    ],
    exports: [LayoutComponent]
  })
  export class LayoutModule {}
