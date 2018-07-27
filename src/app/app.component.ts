import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import { EventsPage } from '../pages/events/events';
import { OfficesPage } from '../pages/offices/offices';
import { SettingsPage } from '../pages/settings/settings';
import { PeoplePage } from '../pages/people/people';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent'
import { style, animate, transition, trigger } from '@angular/core';
import { PeopleStore } from '../providers/people-store/people-store';
import { OfficesStore } from '../providers/offices-store/offices-store';
import { EventsStore } from '../providers/events-store/events-store';

import { ENV } from '@app/env';
import { AuthService } from '../providers/auth-service/auth-service';

@Component({
  templateUrl: 'app.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class MyApp {
  rootPage: any = 'LoginPage';

  @ViewChild(Nav) nav: Nav;
  public isOnline: boolean;
  private online$: Observable<Event>;
  private offline$: Observable<Event>;
  public isDev: boolean;

  // rootPage: any = EventsPage;

  pages: Array<{title: string, component: any}>;
  // nie można DI NavControllera w Root Componencie, oficjalne rozwiązanie z dokumentacji Ionica:
  // https://ionicframework.com/docs/api/navigation/NavController/#navigating-from-the-root-component
  @ViewChild('content') navCtrl: NavController;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private events: Events,
    private storage: Storage,
    private peopleStore: PeopleStore,
    private officesStore: OfficesStore,
    private eventsStore: EventsStore,
    private authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.rootPage = EventsPage;
    }

    this.isOnline = navigator.onLine;
    this.online$ = Observable.fromEvent(window, 'online');
    this.offline$ = Observable.fromEvent(window, 'offline');

    this.online$.subscribe(e => {
      this.isOnline = true;
      this.peopleStore.syncIfNeeded()
        .subscribe();
      this.officesStore.syncIfNeeded()
        .subscribe();
      this.eventsStore.syncIfNeeded()
        .subscribe();
    });
    this.offline$.subscribe(e => {
      this.isOnline = false;
    });

    // this.storage.get('hasSeenTutorial')
    //   .then((hasSeenTutorial) => {
    //     if (!hasSeenTutorial) {
    //       this.rootPage = 'WelcomeSlidesPage';
    //     }
    //     this.initializeApp();
    //   });

    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Wizyty', component: EventsPage },
      { title: 'Gabinety', component: OfficesPage },
      { title: 'Uczestnicy', component: PeoplePage },
      { title: 'Ustawienia', component: SettingsPage }
    ];

    if(ENV.mode === 'Development') {
      this.isDev = true;
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#085c86");
      this.splashScreen.hide();
      this.handleErrorEvents();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  handleErrorEvents() {
    /*this.events.subscribe('UNHANDLED_ERROR', (error: Error) => {
      this.navCtrl.setRoot('ErrorPage', { err: error }); // sprawdzić czy działa ErrorPage jako string - strony są lazy loaded więc nie powinno się do nich odnosić obiektem
    });*/
    this.events.subscribe('TOKEN_ERROR', (_error: Error) => {
      this.authService.logout();
      this.navCtrl.setRoot('LoginPage');
    });
  }
}
