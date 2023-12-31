import { Injectable, NgZone, inject } from '@angular/core';
import { DocumentSnapshot, Firestore, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private fs: Firestore = inject(Firestore)
  private authService: AuthService = inject(AuthService)
  private ngZone: NgZone = inject(NgZone);

  private collection: any = collection(this.fs, 'rooms');

  constructor() { }

  createRoom(name: string) : Promise<any> {
    let room: Room = {
      name: name,
      owner: this.authService.userUid,
      reveal: false
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
      getDocs(userCollectionQuery)
        .then(querySnapshot => {
          observer.next(querySnapshot);

      const unsubscribe = onSnapshot(userCollectionQuery, {
        next: querySnapshot => {
          this.ngZone.run(() => {
            observer.next(querySnapshot)
          });
        },
        error: error => observer.error(error)
      });

      return { unsubscribe };
      })
      .catch(error => observer.error(error));
    });
  }

  getRoomDocumentOnSnapshot(id: string): Observable<any> {
    const roomDocRef = doc(this.fs, 'rooms', id);
  
    return new Observable(observer => {
      getDoc(roomDocRef)
        .then(docSnapshot => {
          observer.next(docSnapshot);
  
          const unsubscribe = onSnapshot(roomDocRef, {
            next: docSnapshot => {
              this.ngZone.run(() => {
                observer.next(docSnapshot)
              });
            },
            error: error => observer.error(error)
          });
  
          return { unsubscribe };
        })
        .catch(error => observer.error(error));
    });
  }

  async checkIfUserNameExists(roomId: string, userId: string) : Promise<boolean> {
    const userDoc = await getDoc(doc(this.fs, 'rooms', roomId, 'users', userId));
    return userDoc.exists() && userDoc.get('name');
  }

  addUserToRoom(roomId: string, user: RoomUser): Promise<any> {
    const userDocRef = doc(this.fs, 'rooms', roomId, 'users', this.authService.userUid);
    return setDoc(userDocRef, user);
  }

  removeUserFromRoom(roomId: string, userId: string): Promise<any> {
    const userDocRef = doc(this.fs, 'rooms', roomId, 'users', userId);
    return deleteDoc(userDocRef);
  }

  async revealRoom(roomId: string, reveal: boolean) : Promise<any> {
    const roomDocRef = doc(this.fs, 'rooms', roomId);
    try {
      await setDoc(roomDocRef, { reveal }, { merge: true })
    } catch (error) {
      console.error('Error updating room reveal value:', error);
    }
  }

  async clearAllSelectedValues(roomId: string): Promise<void> {
    const roomDocRef = doc(this.fs, 'rooms', roomId);
  
    try {
      const userCollectionRef = collection(roomDocRef, 'users');
      const userQuerySnapshot = await getDocs(userCollectionRef);
  
      for (const userDoc of userQuerySnapshot.docs) {
        const userDocRef = doc(userCollectionRef, userDoc.id);
        await setDoc(userDocRef, { selectedValue: null }, { merge: true });
      }
    } catch (error) {
      console.error('Error clearing selected values:', error);
    }
  }
}

export interface Room {
  name: string,
  owner: string,
  reveal: boolean
}

export interface RoomUser {
  name: string,
  selectedValue: string
}
