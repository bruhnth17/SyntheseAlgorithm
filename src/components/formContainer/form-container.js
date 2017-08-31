import {bindable} from 'aurelia-framework';

export class FormContainer {

  constructor() {
    this.headline = 'Schritt 1: Anzahl Attribute & Abhängigkeiten';
    this.numAttr = [
      {id: 3, label: '3'},
      {id: 4, label: '4'},
      {id: 5, label: '5'},
      {id: 6, label: '6'},
      {id: 7, label: '7'},
      {id: 8, label: '8'}
    ];
    this.numDep = [
      {id: 3, label: '3'},
      {id: 4, label: '4'},
      {id: 5, label: '5'},
      {id: 6, label: '6'},
      {id: 7, label: '7'},
      {id: 8, label: '8'}
    ];
    this.selectedAttr;
    this.selectedDep;
    this.nameAttr;
  }

  log() {
    console.log(this.nameAttr);
  }

  rotate() {
    document.getElementsByClassName('form')[0].classList.add('rotate');
  }
}
