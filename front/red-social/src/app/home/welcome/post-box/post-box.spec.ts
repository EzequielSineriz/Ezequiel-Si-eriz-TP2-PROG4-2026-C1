import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostBox } from './post-box';

describe('PostBox', () => {
  let component: PostBox;
  let fixture: ComponentFixture<PostBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostBox],
    }).compileComponents();

    fixture = TestBed.createComponent(PostBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
