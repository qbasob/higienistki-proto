import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Person } from '../../../shared/person.model';

@Component({
  selector: 'page-person-popover',
  templateUrl: 'person-popover.html'
})
export class PersonPopoverPage {
  // public person: Person;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    // this.person = navParams.get('person');
  }

  edit(/*person*/) {
    this.viewCtrl.dismiss('edit', null, { animate: false });
  }

  remove(/*person*/) {
    this.viewCtrl.dismiss('remove', null, { animate: false });
  }

}
