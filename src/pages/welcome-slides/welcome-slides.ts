import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, Slides, MenuController } from 'ionic-angular';
import { EventsPage } from '../events/events';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the WelcomeSlidesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcome-slides',
  templateUrl: 'welcome-slides.html',
})
export class WelcomeSlidesPage {

  showSkip = true;

  @ViewChild('slides') slides: Slides;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public storage: Storage
  ) { }

  // POMIŃ/KONTYNUUJ
  startApp() {
    this.storage.set('hasSeenTutorial', 'true').then(() => {
      this.navCtrl.setRoot(EventsPage)
    });
  }

  // na ostatniej stronie nie pokazujemy POMIŃ
  onSlideChangeStart(slider: Slides) {
    this.showSkip = !slider.isEnd();
  }

  // przewija na początek
  ionViewWillEnter() {
    this.slides.update();
  }

  // wyłączenie menu na wejściu
  ionViewDidEnter() {
    this.menu.enable(false);
  }

  // pokazanie menu na wyjściu
  ionViewDidLeave() {
    this.menu.enable(true);
  }

}
