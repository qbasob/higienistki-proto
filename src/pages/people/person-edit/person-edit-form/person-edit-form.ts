import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CustomValidators } from '../../../../validators/custom-validators';


@Component({
  selector: 'person-edit-form',
  templateUrl: 'person-edit-form.html',
})
export class PersonEditFormComponent implements OnInit {
  @Input('personData')
  public person: Person = { id: null, name: null, gender: Gender.Pani }; //default value
  @Input('formData')
  public formDir;

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
      phone: [null, [Validators.required, Validators.minLength(9)]],
      officesNo: [null, [Validators.required, Validators.min(1)]],
      sonicareUser: false,
      sonicareRecom: false,
      wantCodes: false,
      gotStarter: false,
      starterNo: [null, CustomValidators.requireIfOther('gotStarter', true)],
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
