import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RoomsService } from '../services/rooms/rooms.service';
import { AuthService } from '../services/auth/auth.service';
import { catchError, map, mergeMap, tap } from 'rxjs';
import { NameDialogComponent } from './name-dialog/name-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private roomsService: RoomsService = inject(RoomsService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private dialog: MatDialog = inject(MatDialog);

  private roomId: string;

  averageValue: number = 0;
  name: string;
  username: string;
  fibonacci = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  users$ = this.route.params.pipe(
    mergeMap(params => {
      const roomId = params['id'];
      this.roomId = roomId;
      return this.roomsService.getRoom(roomId);
    }),
    mergeMap(doc => {
      this.name = doc.get('name');
      return this.roomsService.getUserCollectionOnSnapshot(this.roomId);
    }),
    map(querySnapshot => querySnapshot.docs.map(doc => doc.data())),
    tap(result => this.calculateAverage(result)),
    catchError(error => {
      console.error(error);
      throw error;
    })
  );


  @HostListener('window:beforeunload')
  beforeUnloadHandler() {
    this.ngOnDestroy();
  }

  calculateAverage(users: any[]) {
    if (users.length > 0) {
      this.averageValue = (users.reduce((acc, obj) => acc + obj.selectedValue, 0) / users.length) ?? 0;
    }
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.ngOnDestroy();
      }
    });
    this.checkUserNameAndOpenDialog();
  }

  ngOnDestroy() {
    this.roomsService.removeUserFromRoom(this.roomId, this.authService.userUid);
  }

  chooseNumber(number: number) {
    this.roomsService.updateUserSelectedValue(this.roomId, this.authService.userUid, number);
  }

  checkUserNameAndOpenDialog(): void {
    if (!this.username) {
      const dialogRef = this.dialog.open(NameDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.username = result;
          this.roomsService.addUserToRoom(this.roomId, {
            name: this.username,
            selectedValue: null
          });
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }
}
