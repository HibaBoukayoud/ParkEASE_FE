import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketValidationComponent } from './ticket-validation.component';

describe('TicketValidationComponent', () => {
  let component: TicketValidationComponent;
  let fixture: ComponentFixture<TicketValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
