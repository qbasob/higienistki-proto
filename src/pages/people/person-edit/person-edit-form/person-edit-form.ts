import { Component, Input, OnInit } from '@angular/core';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, ControlContainer, FormGroupDirective } from '@angular/forms';

// magia działa dzięki temu:
// https://stackoverflow.com/questions/49747278/angular-5-nested-form-child-component
// i temu:
// https://youtu.be/CD_t3m2WMM8?t=25m23s

@Component({
  selector: 'person-edit-form',
  templateUrl: 'person-edit-form.html',
  // magia 1:
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class PersonEditFormComponent implements OnInit {
  @Input('personData')
  public person: Person = { name: '', gender: Gender.Pani }; //default value

  private parentForm: FormGroup;
  public personFormGroup: FormGroup;
  public Gender = Gender; // do używania w template

  constructor(
    private formBuilder: FormBuilder,
    // magia 2:
    private parent: FormGroupDirective
  ) { }

  ngOnInit() {
    // magia 3:
    this.parentForm = this.parent.form;

    this.personFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, this.customEmailValidator]],
      phone: '',
      officesNo: '',
      sonicareUser: '',
      sonicareRecom: '',
      wantCodes: '',
      gotStarter: '',
      starterNo: '',
      gotExpositor: '',
      agreeReg: '',
      agreeMark1: '',
      agreeMark2: '',
      agreeMark3: '',
      agreeMark4: '',
      additionalData: ''
    });
    this.personFormGroup.patchValue(this.person);

    // magia 4
    this.parentForm.addControl('personFormGroup', this.personFormGroup);
  }

  // fix, walidator emaila powinien przepuszczać puste pole, naprawione w Angularze 6
  private customEmailValidator(control: AbstractControl): ValidationErrors {
    if (!control.value) {
      return null;
    }

    return Validators.email(control);
  }
}
