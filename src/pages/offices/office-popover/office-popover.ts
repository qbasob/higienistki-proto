import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Office } from '../../../shared/office.model';

@Component({
  selector: 'page-office-popover',
  templateUrl: 'office-popover.html'
})
export class OfficePopoverPage {
  // public office: Office;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    // this.office = navParams.get('office');
  }

  edit(/*office*/) {
    this.viewCtrl.dismiss('edit', null, { animate: false });
  }

  remove(/*office*/) {
    this.viewCtrl.dismiss('remove', null, { animate: false });
  }

}
