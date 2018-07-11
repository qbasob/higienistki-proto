import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomeSlidesPage } from './welcome-slides';

@NgModule({
  declarations: [
    WelcomeSlidesPage,
  ],
  imports: [
    IonicPageModule.forChild(WelcomeSlidesPage),
  ],
})
export class WelcomeSlidesPageModule {}
