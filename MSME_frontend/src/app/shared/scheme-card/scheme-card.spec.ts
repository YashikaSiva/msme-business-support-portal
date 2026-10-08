import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeCard } from './scheme-card';

describe('SchemeCard', () => {
  let component: SchemeCard;
  let fixture: ComponentFixture<SchemeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SchemeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
