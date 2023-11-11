import { Component, inject } from '@angular/core';
import { RoomsService } from '../services/rooms/rooms.service';
import { DocumentReference } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  roomName: string;

  roomService: RoomsService = inject(RoomsService);

  router: Router = inject(Router);
  
  createRoom() : void {
    this.roomService.createRoom(this.roomName).then((doc: DocumentReference) => {
      this.router.navigate(['room/' + doc.id]);
    });
  }
}
