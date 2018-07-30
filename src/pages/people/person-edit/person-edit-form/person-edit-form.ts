import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'person-edit-form',
  templateUrl: 'person-edit-form.html',
})
export class PersonEditFormComponent implements OnInit {
  @Input('personData')
  public person: Person = { id: null, name: null, gender: Gender.Pani }; //default value

  @Output()
  onFormInit = new EventEmitter<FormGroup>();

  public personFormGroup: FormGroup;
  public Gender = Gender; // do używania w template

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.personFormGroup = this.formBuilder.group({
      id: null,
      name: [null, [Validators.required, Validators.minLength(5)]],
      gender: [Gender.Pani, Validators.required],
      email: [null, [Validators.required, this.customEmailValidator]],
      phone: null,
      officesNo: null,
      sonicareUser: false,
      sonicareRecom: false,
      wantCodes: false,
      gotStarter: false,
      starterNo: null,
      gotExpositor: false,
      agreeReg: false,
      agreeMark1: false,
      agreeMark2: false,
      agreeMark3: false,
      agreeMark4: false,
      additionalData: null
    });
    this.personFormGroup.patchValue(this.person);

    this.onFormInit.emit(this.personFormGroup);
  }

  // fix, walidator emaila powinien przepuszczać puste pole, naprawione w Angularze 6
  private customEmailValidator(control: AbstractControl): ValidationErrors {
    if (!control.value) {
      return null;
    }

    return Validators.email(control);
  }
}
