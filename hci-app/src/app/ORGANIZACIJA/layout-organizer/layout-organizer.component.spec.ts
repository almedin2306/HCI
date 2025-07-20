import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutOrganizerComponent } from './layout-organizer.component';

describe('LayoutOrganizer', () => {
  let component: LayoutOrganizerComponent;
  let fixture: ComponentFixture<LayoutOrganizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutOrganizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutOrganizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
