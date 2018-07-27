import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  constructor(
    public navCtrl: NavController,
    private authService: AuthService
  ) { }

  showTutorial() {
    this.navCtrl.setRoot('WelcomeSlidesPage');
  }

  logout() {
    this.authService.logout();
    // this.navCtrl.setRoot('LoginPage');
    this.navCtrl.setRoot('LoginPage');
  }
}
