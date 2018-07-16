import { Component, Input } from '@angular/core';
import { Person, Gender } from '../../../../shared/person.model';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'person-edit-form',
  templateUrl: 'person-edit-form.html'
})
export class PersonEditFormComponent {
  @Input('group')
  public personFormGroup: FormGroup;
  @Input('person')
  public person: Person = { name: '', gender: Gender.Pani }; //default value

  public Gender = Gender; // do używania w template

  constructor( ) { }
}
