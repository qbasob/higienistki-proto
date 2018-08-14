import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Office } from '../../../../shared/office.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertController, PopoverController } from 'ionic-angular';
import { OfficeInfoPopoverPage } from '../../office-info-popover/office-info-popover';

@Component({
  selector: 'office-edit-form',
  templateUrl: 'office-edit-form.html',
})
export class OfficeEditFormComponent implements OnInit {
  @Input('officeData')
  public office: Office = { id: null, name: '' }; //default value

  @Output()
  onFormInit = new EventEmitter<FormGroup>();

  public officeFormGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.officeFormGroup = this.formBuilder.group({
      id: null,
      name: [null, [Validators.required, Validators.minLength(5)]],
      nip: [null, Validators.required],
      street: [null, Validators.required],
      buildingNo: [null, Validators.required],
      localNo: null,
      postal: [null, Validators.required],
      city: [null, Validators.required],
      // county: null,
      voivodeship: [null, Validators.required],
      phone: [null, Validators.required],
      krsName: [null, Validators.required],
      locationInfo: null
    });
    this.officeFormGroup.patchValue(this.office);

    this.onFormInit.emit(this.officeFormGroup);
  }

  nameInfo(event) {
    // const alert = this.alertCtrl.create({
    //   title: 'Co to oznacza?',
    //   subTitle: 'Nazwa pod jaką występuje publicznie gabinet/szyld gabinetu.',
    //   buttons: ['Rozumiem']
    // });
    // alert.present();
    this._createPopover(event, 'Nazwa pod jaką występuje publicznie gabinet/szyld gabinetu.');
  }

  locationInfo(event) {
    // const alert = this.alertCtrl.create({
    //   title: 'Co to oznacza?',
    //   subTitle: 'Np. w podwórzu, wewnątrz centrum handlowego, w większej przychodni etc.',
    //   buttons: ['Rozumiem']
    // });
    // alert.present();
    this._createPopover(event, 'Np. w podwórzu, wewnątrz centrum handlowego, w większej przychodni etc.')
  }

  private _createPopover(event, content) {
    const popover = this.popoverCtrl.create(OfficeInfoPopoverPage, { content });
    popover.present({
      ev: event //przekazujemy event, żeby popover wiedział skąd ma się wysunąć
    });
  }
}
