import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyScheme } from './apply-scheme';

describe('ApplyScheme', () => {
  let component: ApplyScheme;
  let fixture: ComponentFixture<ApplyScheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyScheme],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplyScheme);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
