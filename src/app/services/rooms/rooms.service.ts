import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  fs: Firestore = inject(Firestore)
  authService: AuthService = inject(AuthService)
  collection: any = collection(this.fs, 'rooms');

  constructor() { }

  createRoom(name: string) {
    let room: Room = {
      name: name,
      owner: this.authService.userUid
    }

    return addDoc(this.collection, room);
  }

  async getRoom(id: string) {
    const docRef = doc(this.collection, id);
    return await getDoc(docRef);
  }
}

export interface Room {
  name: string,
  owner: string,
}
