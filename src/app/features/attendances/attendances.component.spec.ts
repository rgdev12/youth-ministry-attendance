import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attendances } from './attendances.component';

describe('Attendances', () => {
  let component: Attendances;
  let fixture: ComponentFixture<Attendances>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attendances]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Attendances);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
