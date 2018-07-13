import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-event-popover',
  templateUrl: 'event-popover.html'
})
export class EventPopoverPage {
  // public event: Event;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    // this.event = navParams.get('event');
  }

  edit(/*event*/) {
    this.viewCtrl.dismiss('edit', null, { animate: false });
  }

  remove(/*event*/) {
    this.viewCtrl.dismiss('remove', null, { animate: false });
  }

}
