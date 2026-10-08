import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeDetails } from './scheme-details';

describe('SchemeDetails', () => {
  let component: SchemeDetails;
  let fixture: ComponentFixture<SchemeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemeDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(SchemeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
