import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  authService: AuthService = inject(AuthService);

  ngOnInit() {
    this.authService.signIn();
  }
  
  title = 'Scrum poker planning';
}
