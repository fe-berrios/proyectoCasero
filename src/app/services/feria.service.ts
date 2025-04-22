import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeriaService {

  constructor(private fireStore: AngularFirestore) {}

  async createFeria(feria: any) {
    const docRef = this.fireStore.collection('ferias').doc(feria.id);
    const docActual = await lastValueFrom(docRef.get());
    if (docActual?.exists) {
      return false;
    }

    await docRef.set(feria);
    return true;
  }

  getFerias() {
    return this.fireStore.collection('ferias').valueChanges();
  }

  getFeria(id: string) {
    return this.fireStore.collection('ferias').doc(id).valueChanges();
  }

  updateFeria(feria: any): Promise<any> {
    return this.fireStore.collection('ferias').doc(feria.id).update(feria);
  }

  deleteFeria(id: string): Promise<any> {
    return this.fireStore.collection('ferias').doc(id).delete();
  }
}