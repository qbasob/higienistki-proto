import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-office-info-popover',
  templateUrl: 'office-info-popover.html'
})
export class OfficeInfoPopoverPage {
  public content: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    // private viewCtrl: ViewController
  ) {
    this.content = navParams.get('content');
  }
}
