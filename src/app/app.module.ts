import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { EventsPage } from '../pages/events/events';
import { OfficesPage } from '../pages/offices/offices';
import { OfficeEditPage } from '../pages/offices/office-edit/office-edit';
import { OfficeViewPage } from '../pages/offices/office-view/office-view';
import { OfficePopoverPage } from '../pages/offices/office-popover/office-popover';
import { PeoplePage } from '../pages/people/people';
import { PersonEditPage } from '../pages/people/person-edit/person-edit';
import { PersonViewPage } from '../pages/people/person-view/person-view';
import { PersonPopoverPage } from '../pages/people/person-popover/person-popover';
import { SettingsPage } from '../pages/settings/setings';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    EventsPage,
    OfficesPage,
    OfficeEditPage,
    OfficeViewPage,
    OfficePopoverPage,
    PeoplePage,
    PersonEditPage,
    PersonViewPage,
    PersonPopoverPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EventsPage,
    OfficesPage,
    OfficeEditPage,
    OfficeViewPage,
    OfficePopoverPage,
    PeoplePage,
    PersonEditPage,
    PersonViewPage,
    PersonPopoverPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
