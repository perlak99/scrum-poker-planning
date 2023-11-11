import { Injectable, inject } from '@angular/core';
import { DocumentSnapshot, Firestore, addDoc, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  fs: Firestore = inject(Firestore)
  authService: AuthService = inject(AuthService)
  collection: any = collection(this.fs, 'rooms');

  constructor() { }

  createRoom(name: string) : Promise<any> {
    let room: Room = {
      name: name,
      owner: this.authService.userUid,
      users: []
    }

    return addDoc(this.collection, room);
  }

  getRoom(id: string) : Promise<DocumentSnapshot<any>> {
    const docRef = doc(this.collection, id);
    return getDoc(docRef);
  }

  async updateUserSelectedValue(roomId: string, userId: string, selectedValue: any) : Promise<any> {
    const roomDocRef = doc(this.fs, 'rooms', roomId);
    const userDocRef = doc(roomDocRef, 'users', userId);

    try {
      await setDoc(userDocRef, { selectedValue }, { merge: true })
    } catch (error) {
      console.error('Error updating user selected value:', error);
    }
  }

  getUserCollectionOnSnapshot(id: string): Observable<any> {
    const userCollectionQuery = query(collection(this.fs, 'rooms', id, 'users'));
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userCollectionQuery, {
        next: querySnapshot => observer.next(querySnapshot),
        error: error => observer.error(error)
      });
      return { unsubscribe };
    });
  }
}

export interface Room {
  name: string,
  owner: string,
  users: RoomUser[]
}

export interface RoomUser {
  id: string,
  selectedValue: number
}
