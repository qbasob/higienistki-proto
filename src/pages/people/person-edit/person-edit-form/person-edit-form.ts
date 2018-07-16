import { Component, Input, OnInit } from '@angular/core';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'person-edit-form',
  templateUrl: 'person-edit-form.html',
})
export class PersonEditFormComponent implements OnInit {
  @Input('personData')
  public person: Person = { name: '', gender: Gender.Pani }; //default value

  @Input('formData')
  private parentForm: FormGroup;

  public personFormGroup: FormGroup;
  public Gender = Gender; // do używania w template

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
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
