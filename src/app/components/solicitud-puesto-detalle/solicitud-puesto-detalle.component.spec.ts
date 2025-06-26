import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SolicitudPuestoDetalleComponent } from './solicitud-puesto-detalle.component';

describe('SolicitudPuestoDetalleComponent', () => {
  let component: SolicitudPuestoDetalleComponent;
  let fixture: ComponentFixture<SolicitudPuestoDetalleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudPuestoDetalleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudPuestoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
