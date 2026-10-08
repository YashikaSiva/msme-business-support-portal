import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityChecker } from './eligibility-checker';

describe('EligibilityChecker', () => {
  let component: EligibilityChecker;
  let fixture: ComponentFixture<EligibilityChecker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EligibilityChecker],
    }).compileComponents();

    fixture = TestBed.createComponent(EligibilityChecker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
