import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoomsService } from '../services/rooms/rooms.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private roomsService: RoomsService = inject(RoomsService);
  private routeSub: Subscription;

  name: string;
  
  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.roomsService.getRoom(params["id"]).then(room => {
        this.name = room.data()["name"];
      })
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
