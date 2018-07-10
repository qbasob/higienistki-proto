import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { Office } from '../../../shared/office.model';
import { OfficePopoverPage } from '../office-popover/office-popover';
import { OfficeEditPage } from '../office-edit/office-edit';

@Component({
  selector: 'page-office-view',
  templateUrl: 'office-view.html'
})
export class OfficeViewPage {
  public office: Office;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController
  ) {
    this.office = navParams.get('office');
  }

  presentPopover(event, office: Office) {
    const popover = this.popoverCtrl.create(OfficePopoverPage, { office });
    popover.present({
      ev: event //przekazujemy event, żeby popover wiedział skąd ma się wysunąć
    });
    popover.onDidDismiss((action: string) => {
      switch (action) {
        case 'edit':
          this.edit(this.office);
          break;
        case 'remove':
          this.remove(this.office);
          break;

        default:
          break;
      }
    });
  }

  // skopiowane z offices.ts, pomyśleć nad sposobem DRY
  edit(office) {
    this.navCtrl.push(OfficeEditPage, {
      office
    });
  }
  // skopiowane z offices.ts, pomyśleć nad sposobem DRY
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
}
