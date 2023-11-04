import { Component, inject } from '@angular/core';
import { Room, RoomsService } from './services/rooms/rooms.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'scrum-poker-planning';

  roomsService = inject(RoomsService);

  rooms$: Observable<Room[]>;

  constructor() {
    this.rooms$ = this.roomsService.getRooms();
  }
}
