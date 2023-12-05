import { Injectable, NgZone, inject } from '@angular/core';
import { Firestore, Timestamp, addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private fs: Firestore = inject(Firestore);
  private ngZone: NgZone = inject(NgZone);

  constructor() { }

  async addMessageToRoom(roomId: string, message: Message): Promise<any> {
    const messagesCollectionRef = collection(this.fs, 'rooms', roomId, 'messages');
    const request = {...message, timestamp: serverTimestamp()}
    return await addDoc(messagesCollectionRef, request);
  }

  getMessagesCollectionOnSnapshot(roomId: string): Observable<any> {
    const messageCollectionQuery = query(
      collection(this.fs, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc'));

    return new Observable(observer => {
      getDocs(messageCollectionQuery)
        .then(querySnapshot => {
          observer.next(querySnapshot);

      const unsubscribe = onSnapshot(messageCollectionQuery, {
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
}

export interface Message {
  message: string;
  user: string;
}
