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
      this.adjustDependencyOptions(response.attr.id, response.dep.id);
    });
  }

  adjustDependencyOptions(attr, dep) {
    //console.log('adjustDependencyOptions');
    let dependencies = document.getElementsByClassName('dependency');
    console.log(dependencies);
    for (let i = 0; i < dependencies.length; i++) {
      if (parseInt(dependencies[i].id) > dep) {
        dependencies[i].classList.add('hide');
      } else {
        dependencies[i].classList.remove('hide');
      }
    }
  }


  removeRotate() { //go Back
    document.getElementsByClassName('form')[0].classList.remove('rotate');
  }
}
