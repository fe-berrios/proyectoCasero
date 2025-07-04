import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeriasFavPage } from './ferias-fav.page';

describe('FeriasFavPage', () => {
  let component: FeriasFavPage;
  let fixture: ComponentFixture<FeriasFavPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FeriasFavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
