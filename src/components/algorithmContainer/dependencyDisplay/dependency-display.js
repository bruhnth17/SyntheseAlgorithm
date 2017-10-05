import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(eventAggregator)
export class DependenciesDisplay {
  constructor() {
    this.ea = eventAggregator;
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('evaluateDependencies', response => {
      this.loadDependencies(response);
    });
  }

  loadDependencies(dependencyJson) {
    let numAttributes = dependencyJson.numAttributes;
    let dependencies = dependencyJson.dependencies;
  }

}