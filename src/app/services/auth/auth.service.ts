import { Injectable, inject } from '@angular/core';
import { Auth, signInAnonymously, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private _userUid: string;

  constructor() {
  }

  signIn() {
    signInAnonymously(this.auth).then((result) => {
      this._userUid = result.user.uid;
      console.log(this._userUid);
    });
  }

  get userUid() {
    return this._userUid;
  }
}


