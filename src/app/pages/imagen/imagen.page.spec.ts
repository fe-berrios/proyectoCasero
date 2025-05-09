import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImagenPage } from './imagen.page';

describe('ImagenPage', () => {
  let component: ImagenPage;
  let fixture: ComponentFixture<ImagenPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
