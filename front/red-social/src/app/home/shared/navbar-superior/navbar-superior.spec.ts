import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarSuperior } from './navbar-superior';

describe('NavbarSuperior', () => {
  let component: NavbarSuperior;
  let fixture: ComponentFixture<NavbarSuperior>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarSuperior],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarSuperior);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
