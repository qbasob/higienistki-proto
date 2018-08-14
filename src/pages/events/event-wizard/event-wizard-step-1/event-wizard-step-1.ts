import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, Events } from 'ionic-angular';
import { OfficesStore } from '../../../../providers/offices-store/offices-store';
import { Office } from '../../../../shared/office.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'page-event-wizard-step-1',
  templateUrl: 'event-wizard-step-1.html'
})
export class EventWizardStep1Page implements OnInit {
  public cities: Set<string>;
  public offices: Array<Office>;
  public filteredOffices: Array<Office>;
  public office: Office;
  public stepForm: FormGroup;
  private _stepData: any;
  public isNewOffice: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private appCtrl: App,
    private tabEvents: Events,
    private officesStore: OfficesStore,
    private formBuilder: FormBuilder

  ) {

    this.officesStore.records$.subscribe((offices) => {
      this.offices = offices;
      this.filteredOffices = offices;
      this.cities = new Set();
      offices.forEach((office, index) => {
        this.cities.add(office.city);
      });
    });

    this.office = { id: null, name: '' };
    this._stepData = {};
    this.isNewOffice = false;
  }

  ngOnInit(): void {
    this.stepForm = this.formBuilder.group({});
  }

  patchForm(formGroup: FormGroup) {
    this.stepForm = formGroup;
  }

  addNewOffice(officeSelect) {
    officeSelect.value = "";
    this.office = { id: null, name: '' };
    this.stepForm.reset();
    this.isNewOffice = true;
  }

  selectCity(city) {
    this.filteredOffices = this.offices.filter((office) => {
      if (office.city === city) {
        return true;
      }
    });
  }

  selectOffice(officeLocalId) {
    this.offices.some((office) => {
      if (office.localId === officeLocalId) {
        this.office = office;
        this.stepForm.patchValue(office);

        return true;
      }
    });
  }

  next() {
    if (this.stepForm.valid) {
      this._stepData = Object.assign({}, this.office, this.stepForm.value);
      this.tabEvents.publish('event-wizard-change-tab', 0, 1, {office: this._stepData});
    }
  }

  cancel() {
    const confirm = this.alertCtrl.create({
      title: 'Zmiany nie zostały zapisane',
      message: 'Czy na pewno wyjść z tworzenia wizyty bez zapisywania zmian?',
      buttons: [
        {
          text: 'Nie',
        },
        {
          text: 'Tak',
          cssClass: 'danger-button',
          handler: () => {
            this.appCtrl.getRootNav().pop();
          }
        }
      ]
    });
    confirm.present();
  }
}
