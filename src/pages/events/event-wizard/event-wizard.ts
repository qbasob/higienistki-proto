import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { NavController, NavParams, Events, Tabs } from 'ionic-angular';
import { EventWizardStep1Page } from './event-wizard-step-1/event-wizard-step-1';
import { EventWizardStep2Page } from './event-wizard-step-2/event-wizard-step-2';

@Component({
  selector: 'page-event-wizard',
  templateUrl: 'event-wizard.html'
})
export class EventWizardPage implements OnInit, OnDestroy {
  @ViewChild('eventWizardTabs') tabRef: Tabs;

  step1: any;
  step2: any;
  stepsEnabled: boolean[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.step1 = EventWizardStep1Page;
    this.step2 = EventWizardStep2Page;

    this.stepsEnabled = [];
    this.stepsEnabled[0] = true; // pierwszy krok
    this.stepsEnabled[1] = false; // drugi krok
    this.stepsEnabled[2] = false; // trzeci krok
  }

  // poniższe potrzebne żeby się Ionic nie wywalał po ponownym wejściu w tabsy
  ngOnInit () {
    this.events.subscribe('event-wizard-change-tab', (from: number, to: number) => {
      this.stepsEnabled[to] = true;
      this.tabRef.select(to);
    });
  }
  ngOnDestroy() {
    this.events.unsubscribe('event-wizard-change-tab');
  }
}
