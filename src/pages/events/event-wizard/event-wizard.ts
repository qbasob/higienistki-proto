import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams, Events, Tabs, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { EventWizardStep1Page } from './event-wizard-step-1/event-wizard-step-1';
import { EventWizardStep2Page } from './event-wizard-step-2/event-wizard-step-2';
import { EventWizardStep3Page } from './event-wizard-step-3/event-wizard-step-3';
import { EventWizardStep4Page } from './event-wizard-step-4/event-wizard-step-4';
import { EventWizardStep5Page } from './event-wizard-step-5/event-wizard-step-5';
import { EventWizardStep6Page } from './event-wizard-step-6/event-wizard-step-6';
import { EventWizardStep7Page } from './event-wizard-step-7/event-wizard-step-7';
import { EventWizardStep8Page } from './event-wizard-step-8/event-wizard-step-8';
import { EventWizardStep9Page } from './event-wizard-step-9/event-wizard-step-9';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Office } from '../../../shared/office.model';
import { OfficesStore } from '../../../providers/offices-store/offices-store';
import { EventsStore } from '../../../providers/events-store/events-store';

// import { Person } from '../../../shared/person.model';

@Component({
  selector: 'page-event-wizard',
  templateUrl: 'event-wizard.html'
})
export class EventWizardPage implements OnInit, OnDestroy {
  @ViewChild('eventWizardTabs') tabRef: Tabs;

  steps: any[];
  stepsEnabled: boolean[];
  stepsVisible: boolean[];
  tab3Params: any;
  tab9Params: any;


  private eventForm: FormGroup;
  // private office: Office;
  // private people: Array<Person>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private tabEvents: Events,
    private formBuilder: FormBuilder,
    private officesStore: OfficesStore,
    private eventsStore: EventsStore,
    private loadingCtrl: LoadingController
  ) {
    this.steps = [];
    this.steps[0] = EventWizardStep1Page;
    this.steps[1] = EventWizardStep2Page;
    this.steps[2] = EventWizardStep3Page;
    this.steps[3] = EventWizardStep4Page;
    this.steps[4] = EventWizardStep5Page;
    this.steps[5] = EventWizardStep6Page;
    this.steps[6] = EventWizardStep7Page;
    this.steps[7] = EventWizardStep8Page;
    this.steps[8] = EventWizardStep9Page;

    this.stepsEnabled = [];
    this.stepsEnabled[0] = true; // pierwszy krok
    this.stepsEnabled[1] = false; // drugi krok
    this.stepsEnabled[2] = false; // trzeci krok
    this.stepsEnabled[3] = false; // itd.
    this.stepsEnabled[4] = false;
    this.stepsEnabled[5] = false;
    this.stepsEnabled[6] = false;
    this.stepsEnabled[7] = false;
    this.stepsEnabled[8] = false;

    this.stepsVisible = [];
    this.stepsVisible[0] = true; // pierwszy krok
    this.stepsVisible[1] = true; // drugi krok
    this.stepsVisible[2] = true; // trzeci krok
    this.stepsVisible[3] = false; // itd.
    this.stepsVisible[4] = false;
    this.stepsVisible[5] = false;
    this.stepsVisible[6] = false;
    this.stepsVisible[7] = false;
    this.stepsVisible[8] = false;

    this.tab3Params = {};
    this.tab9Params = {};


    this.eventForm = this.formBuilder.group({
      id: null,
      date: null,
      photoOutside: [null, Validators.required],
      photoInsideWaiting: null,
      noPhotoInsideWaiting: null,
      noPhotoInsideWaitingWhy: null,
      photoInsideOffice: null,
      noPhotoInsideOffice: null,
      noPhotoInsideOfficeWhy: null,
      isOfficeNetwork: null,
      networkOfficesCount: null,
      chairsCount: null,
      doctorsCount: null,
      hasOfficeHigienists: null,
      higienistsCount: null,
      isBuyingSonicare: null,
      doQualify: null,
      office: null,
      people: null
    });
  }

  // poniższe potrzebne żeby się Ionic nie wywalał po ponownym wejściu w tabsy
  ngOnInit () {
    this.tabEvents.subscribe('event-wizard-change-tab', (from: number, to: number, eventData: any = {}) => {
      // enablowanie następnego kroku, tylko po kliknięciu w formularzu
      this.stepsEnabled[to] = true;
      // jeżeli idziemy na stronę 2 to przekazujemy jej aktualne dane office
      if (to === 2) {
        this.tab3Params.office = this.eventForm.value.office;
      }
      // jeżeli idziemy na ostatnią stronę, to przekazujemy jej from (żeby wiedziała czy był przeskok)
      if(to === 8) {
        this.tab9Params.from = from;
      }
      this.tabRef.select(to);
      this.eventForm.patchValue(eventData);

      console.log("eventData", eventData);
      console.log("eventForm", this.eventForm.value);
    });

    this.tabEvents.subscribe('event-wizard-finish-tab', () => {
      let loading = this.loadingCtrl.create({
        content: 'Zapisywanie...'
      });
      loading.present();
      // koniec formularza
      // musimy zaktualizować/dodać office
      const office = this.eventForm.value.office;
      let officeSave: Observable<Office>;
      // jeżeli nowy office
      if (office.id === null) {
        officeSave = this.officesStore.addRecord(office)
      }
      // jeżeli edytujemy office
      else {
        officeSave = this.officesStore.editRecord(office)
      }

      // po zapisie office dostajemy go z powrotem, podmieniamy w evencie i zapisujemy event
      officeSave
        .switchMap((office: Office) => {
          this.eventForm.value.office = office;
          return this.eventsStore.addRecord(this.eventForm.value);
        })
        .finally(() => {
          loading.dismiss();
          this.navCtrl.pop();
        })
        .subscribe()
    });
  }
  ngOnDestroy() {
    this.tabEvents.unsubscribe('event-wizard-change-tab');
    this.tabEvents.unsubscribe('event-wizard-finish-tab');
  }
  updateTabs(event: any) {
    const currentIndex: number = event.index;

    this.stepsVisible = this.stepsVisible.map((_value, index, array) => {
      // jeżeli jesteśmy na kroku 0, to pokazujemy 0,1,2
      if (currentIndex === 0 && index <= 2) {
        return true;
      }
      // jeżeli jesteśmy na ostatnim kroku, to pokazujemy ostatni i dwa wcześniej
      else if (currentIndex === this.stepsVisible.length - 1 && index >= this.stepsVisible.length - 3) {
        return true;
      }
      // jeżeli jesteśmy na innym z kroków to pokazujemy tylko te o 1 większe i mniejsze od niego
      else if (index >= currentIndex - 1 && index <= currentIndex + 1 ) {
        return true;
      }
      return false;
    });
  }
}
