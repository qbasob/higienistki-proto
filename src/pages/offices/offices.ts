import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { OfficeViewPage } from './office-view/office-view';
import * as faker from 'faker';
import { Office } from '../../shared/office.model';
import { OfficeEditPage } from './office-edit/office-edit';

@Component({
  selector: 'page-offices',
  templateUrl: 'offices.html'
})
export class OfficesPage {
  offices: Array<Office>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController
  ) {
    this.offices = [];
    for (let i = 1; i < 11; i++) {
      this.offices.push({
        name: faker.company.companyName(),
        street: faker.address.streetName(),
        buildingNo: faker.random.number(100).toString(),
        localNo: faker.random.number(100).toString(),
        postal: faker.address.zipCode("##-###"),
        city: faker.address.city(),
        county: faker.address.county()
      });
    }
  }

  details(office) {
    this.navCtrl.push(OfficeViewPage, {
      office
    });
  }

  edit(office) {
    this.navCtrl.push(OfficeEditPage, {
      office
    });
  }

  remove(office) {
    const confirm = this.alertCtrl.create({
      title: 'Usuwanie gabinetu',
      message: `Czy na pewno usunąć gabinet ${office.name}?`,
      buttons: [
        {
          text: 'Anuluj',
        },
        {
          text: 'Usuń',
          cssClass: 'danger-button'
        }
      ]
    });
    confirm.present();
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }


}
