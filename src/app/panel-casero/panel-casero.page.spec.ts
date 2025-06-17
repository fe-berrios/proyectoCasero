import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelCaseroPage } from './panel-casero.page';

describe('PanelCaseroPage', () => {
  let component: PanelCaseroPage;
  let fixture: ComponentFixture<PanelCaseroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelCaseroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
