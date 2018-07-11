import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { EventsPage } from '../pages/events/events';
import { EventWizardPage } from '../pages/events/event-wizard/event-wizard';
import { EventWizardStep1Page } from '../pages/events/event-wizard/event-wizard-step-1/event-wizard-step-1';
import { OfficesPage } from '../pages/offices/offices';
import { OfficeEditPage } from '../pages/offices/office-edit/office-edit';
import { OfficeViewPage } from '../pages/offices/office-view/office-view';
import { OfficePopoverPage } from '../pages/offices/office-popover/office-popover';
import { PeoplePage } from '../pages/people/people';
import { PersonEditPage } from '../pages/people/person-edit/person-edit';
import { PersonViewPage } from '../pages/people/person-view/person-view';
import { PersonPopoverPage } from '../pages/people/person-popover/person-popover';
import { PersonViewAcceptPage } from '../pages/people/person-view-accept/person-view-accept';
import { SettingsPage } from '../pages/settings/settings';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EventWizardStep2Page } from '../pages/events/event-wizard/event-wizard-step-2/event-wizard-step-2';
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    EventsPage,
    EventWizardPage,
    EventWizardStep1Page,
    EventWizardStep2Page,
    OfficesPage,
    OfficeEditPage,
    OfficeViewPage,
    OfficePopoverPage,
    PeoplePage,
    PersonEditPage,
    PersonViewPage,
    PersonPopoverPage,
    PersonViewAcceptPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EventsPage,
    EventWizardPage,
    EventWizardStep1Page,
    EventWizardStep2Page,
    OfficesPage,
    OfficeEditPage,
    OfficeViewPage,
    OfficePopoverPage,
    PeoplePage,
    PersonEditPage,
    PersonViewPage,
    PersonPopoverPage,
    PersonViewAcceptPage,
    SettingsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
