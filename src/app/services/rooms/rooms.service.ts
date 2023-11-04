import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  fs: Firestore = inject(Firestore)

  collection: any = collection(this.fs, 'rooms');

  constructor() { }

  getRooms() : Observable<Room[]> {
    return collectionData(this.collection);
  }
}

export interface Room {
  id: any,
  name: any,
  owner: any,
}
