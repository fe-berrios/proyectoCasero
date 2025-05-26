import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrarPuestosPage } from './administrar-puestos.page';

describe('AdministrarPuestosPage', () => {
  let component: AdministrarPuestosPage;
  let fixture: ComponentFixture<AdministrarPuestosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrarPuestosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
