import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, signInAnonymously, user } from '@angular/fire/auth';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private authStateSubject = new BehaviorSubject<string>(null);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      const userUid = user ? user.uid : null;
      this.authStateSubject.next(userUid);
    });
  }

  signIn() {
    signInAnonymously(this.auth);
  }

  get userUid$() {
    return this.authStateSubject.asObservable();
  }

  get userUid(): string {
    return this.authStateSubject.getValue();
  }
}


