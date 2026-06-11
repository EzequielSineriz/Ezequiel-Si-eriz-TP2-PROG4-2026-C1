import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideIzquierdo } from './aside-izquierdo';

describe('AsideIzquierdo', () => {
  let component: AsideIzquierdo;
  let fixture: ComponentFixture<AsideIzquierdo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideIzquierdo],
    }).compileComponents();

    fixture = TestBed.createComponent(AsideIzquierdo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
