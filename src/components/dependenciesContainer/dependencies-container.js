import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class DependenciesContainer {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('numbers', response => {
      this.adjustDependencieOptions(response.attr.id, response.dep.id);
    });
  }

  adjustDependencieOptions(attr, dep) {
    console.log(attr, dep);
  }


  removeRotate() { //go Back
    document.getElementsByClassName('form')[0].classList.remove('rotate');
  }
}
