import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomUser, RoomsService } from '../services/rooms/rooms.service';
import { AuthService } from '../services/auth/auth.service';
import { Observable, catchError, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private roomsService: RoomsService = inject(RoomsService);
  private authService: AuthService = inject(AuthService);

  private roomId: string;
  name: string;

  users$: Observable<RoomUser[]>;

  fibonacci = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roomId = params['id'];
      this.roomsService.getRoom(this.roomId).then((doc) => {
        this.name = doc.get('name');
        this.initUsersObservable();
      });
    });
  }

  chooseNumber(number: number) {
    this.roomsService.updateUserSelectedValue(this.roomId, this.authService.userUid, number);
  }

  initUsersObservable() {
    this.users$ = this.roomsService.getUserCollectionOnSnapshot(this.roomId).pipe(
      map(querySnapshot => querySnapshot.docs.map(doc => doc.data())),
      tap(data => {
        console.log(data);
      }),
      catchError(error => {
        console.error(error);
        throw error;
      })
    );
  }
}
