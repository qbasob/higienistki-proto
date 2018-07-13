import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { EventsPage } from '../pages/events/events';
import { EventEditPage } from '../pages/events/event-edit/event-edit';
import { EventViewPage } from '../pages/events/event-view/event-view';
import { EventPopoverPage } from '../pages/events/event-popover/event-popover';
import { EventWizardPage } from '../pages/events/event-wizard/event-wizard';
import { EventWizardStep1Page } from '../pages/events/event-wizard/event-wizard-step-1/event-wizard-step-1';
import { EventWizardStep2Page } from '../pages/events/event-wizard/event-wizard-step-2/event-wizard-step-2';
import { EventWizardStep3Page } from '../pages/events/event-wizard/event-wizard-step-3/event-wizard-step-3';
import { EventWizardStep4Page } from '../pages/events/event-wizard/event-wizard-step-4/event-wizard-step-4';
import { EventWizardStep5Page } from '../pages/events/event-wizard/event-wizard-step-5/event-wizard-step-5';
import { EventWizardStep6Page } from '../pages/events/event-wizard/event-wizard-step-6/event-wizard-step-6';
import { EventWizardStep7Page } from '../pages/events/event-wizard/event-wizard-step-7/event-wizard-step-7';
import { EventWizardStep8Page } from '../pages/events/event-wizard/event-wizard-step-8/event-wizard-step-8';
import { EventWizardStep9Page } from '../pages/events/event-wizard/event-wizard-step-9/event-wizard-step-9';
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
import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    EventsPage,
    EventEditPage,
    EventViewPage,
    EventPopoverPage,
    EventWizardPage,
    EventWizardStep1Page,
    EventWizardStep2Page,
    EventWizardStep3Page,
    EventWizardStep4Page,
    EventWizardStep5Page,
    EventWizardStep6Page,
    EventWizardStep7Page,
    EventWizardStep8Page,
    EventWizardStep9Page,
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
    EventEditPage,
    EventViewPage,
    EventPopoverPage,
    EventWizardPage,
    EventWizardStep1Page,
    EventWizardStep2Page,
    EventWizardStep3Page,
    EventWizardStep4Page,
    EventWizardStep5Page,
    EventWizardStep6Page,
    EventWizardStep7Page,
    EventWizardStep8Page,
    EventWizardStep9Page,
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
