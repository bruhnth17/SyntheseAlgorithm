import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class FormContainer {

  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.numAttr = this.numDep =  [
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

  rotate() {
    if ((2 < this.selectedAttr.id < 9) && (2 < this.selectedDep.id < 9)) {
      this.ea.publish('numbers', {'attr': this.selectedAttr, 'dep': this.selectedDep});
      document.getElementsByClassName('form')[0].classList.add('rotate');
    } else {
      alert('HACKERALERT');
    }
  }
}
