import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RoomService } from '../services/room/room.service';
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
  private roomService: RoomService = inject(RoomService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private dialog: MatDialog = inject(MatDialog);

  private roomId: string;

  userId: string;
  averageValue: number = 0;
  name: string;
  username: string;
  reveal: boolean;
  fibonacci = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

  users$ = this.route.params.pipe(
    mergeMap(params => {
      const roomId = params['id'];
      return this.roomService.getUserCollectionOnSnapshot(roomId);
    }),
    map(querySnapshot => querySnapshot.docs.map(doc => ( {id: doc.id, ...doc.data()} ))),
    tap(result => {
      this.calculateAverage(result)
    }),
    catchError(error => {
      console.error(error);
      throw error;
    })
  );

  room$ = this.route.params.pipe(
    mergeMap(params => {
      const roomId = params['id'];
      this.roomId = roomId;
      return this.roomService.getRoomDocumentOnSnapshot(this.roomId);
    }),
    tap(doc => {
      this.name = doc.get('name');
      this.reveal = doc.get('reveal');
    }),
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
    const selectedValues = users.map(user => user.selectedValue).filter(value => value !== null && value !== undefined);

    if (selectedValues.length > 0) {
        this.averageValue = selectedValues.reduce((acc, value) => acc + value, 0) / selectedValues.length;
    } else {
        this.averageValue = 0;
    }
  }

  ngOnInit() {
    this.room$.subscribe();

    this.authService.userUid$.subscribe((result) => {
      this.userId = result;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.ngOnDestroy();
      }
    });
    
    this.checkUserNameAndOpenDialog();
  }

  ngOnDestroy() {
    this.roomService.removeUserFromRoom(this.roomId, this.userId);
  }

  chooseNumber(number: number) {
    this.roomService.updateUserSelectedValue(this.roomId, this.userId, number);
  }

  revealScore() {
    this.roomService.revealRoom(this.roomId, !this.reveal);
  }

  clearScore() {
    this.roomService.revealRoom(this.roomId, false);
    this.roomService.clearAllSelectedValues(this.roomId);
  }

  checkUserNameAndOpenDialog(): void {
    if (!this.username) {
      const dialogRef = this.dialog.open(NameDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.username = result;
          this.roomService.addUserToRoom(this.roomId, {
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
