import { Component, inject } from '@angular/core';
import { RoomService } from '../services/room/room.service';
import { DocumentReference } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  roomName: string;

  roomService: RoomService = inject(RoomService);

  router: Router = inject(Router);
  
  createRoom() : void {
    this.roomService.createRoom(this.roomName).then((doc: DocumentReference) => {
      this.router.navigate(['room/' + doc.id]);
    });
  }
}
