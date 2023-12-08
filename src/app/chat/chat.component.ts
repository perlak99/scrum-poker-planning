import { Component, ElementRef, Input, Renderer2, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Observable, catchError, debounceTime, map, tap } from 'rxjs';
import { ChatService, Message } from '../services/chat/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  @Input()
  roomId: string;

  @Input()
  userName: string;

  @ViewChild('chatMessages') chatMessages: ElementRef;

  scrolledToBottom: boolean;

  private chatService: ChatService = inject(ChatService);

  chatMessages$: Observable<any[]>;
  newMessage: string = '';
  
  ngOnInit() {
    this.initChatMessagesObservable();
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomId'] && !changes['roomId'].firstChange) {
      this.initChatMessagesObservable();
    }
  }

  private initChatMessagesObservable() {
    this.chatMessages$ = this.chatService.getMessagesCollectionOnSnapshot(this.roomId).pipe(
      map(querySnapshot => {
        return querySnapshot.docs.map(doc => doc.data())
      }),
      catchError(error => {
        console.error(error);
        throw error;
      })
    );

    this.chatMessages$
    .subscribe(() => {
      if (this.scrolledToBottom) {
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom(): void {
    this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
    this.scrolledToBottom = true;
  }

  onScroll() : void {
    this.scrolledToBottom = Math.abs(this.chatMessages.nativeElement.scrollHeight - this.chatMessages.nativeElement.clientHeight - this.chatMessages.nativeElement.scrollTop) <= 1;
  }

  sendMessage() {
    const message: Message = {
      user: this.userName,
      message: this.newMessage,
    }

    this.chatService.addMessageToRoom(this.roomId, message);

    this.newMessage = "";
  }
}
