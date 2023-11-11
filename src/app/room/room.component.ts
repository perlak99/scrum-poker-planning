import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomsService } from '../services/rooms/rooms.service';
import { AuthService } from '../services/auth/auth.service';
import { Subscription, catchError, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private roomsService: RoomsService = inject(RoomsService);
  private authService: AuthService = inject(AuthService);

  private roomId: string;
  users: any[] = [];
  name: string;
  selectedValue: number;

  private routeParamsSubscription: Subscription;
  private userCollectionSubscription: Subscription;

  fibonacci = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  users$ = this.route.params.pipe(
    switchMap(params => {
      this.roomId = params["id"];
      this.roomsService.getRoom(this.roomId).then((doc) => {
        this.name = doc.get("name");
      })
      return this.roomsService.getUserCollectionOnSnapshot(this.roomId);
    }),
    tap(querySnapshot => {
      this.users = querySnapshot.docs.map(doc => doc.data());
      console.log(this.users);
    }),
    catchError(error => {
      console.error(error);
      throw error;
    })
  );
  
  constructor() {
    this.routeParamsSubscription = this.route.params.subscribe();
    this.userCollectionSubscription = this.users$.subscribe();
  }

  chooseNumber(number: number) {
    this.selectedValue = number;
    this.roomsService.updateUserSelectedValue(this.roomId, this.authService.userUid, number);
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
    this.userCollectionSubscription.unsubscribe();
  }
}
