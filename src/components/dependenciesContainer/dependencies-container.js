import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class DependenciesContainer {
  constructor(eventAggregator) {
    this.numAttributes;
    this.ea = eventAggregator;
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('numbers', response => {
      this.adjustDependencyOptions(response.attr.id, response.dep.id);
    });
  }

  /**
   * Adjust form for entering dependencies
   * @param {int} attr number of attributes shown in form
   * @param {int} dep number of dependencies shown in form
   */
  adjustDependencyOptions(attr, dep) {
    //console.log('adjustDependencyOptions');
    let dependencies = document.getElementsByClassName('dependency');
    let attributes = document.getElementsByClassName('attribute');
    let attributeArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, attr);

    for (let i = 0; i < dependencies.length; i++) {
      if (parseInt(dependencies[i].id, 10) > dep) {
        dependencies[i].classList.add('hidden');
      } else {
        dependencies[i].classList.remove('hidden');
      }
    }

    for (let i = 0; i < attributes.length; i++) {
      let containsClass = false;
      attributeArray.forEach(function(c) {
        containsClass = containsClass || attributes[i].classList.contains(c);
      });

      if (containsClass) {
        attributes[i].parentNode.classList.remove('hidden');
      } else {
        attributes[i].parentNode.classList.add('hidden');
      }
    }
    this.numAttributes = attr;
  }

  removeRotate() {
    document.getElementsByClassName('form')[0].classList.remove('rotate');
  }

  /**
   * Create JSON Object with the filled in Dependencies
   * Example:
   * AEH -> BD :: {id : {left: ['A', 'E', 'H'], right: ['B', 'D'] }}
   */
  evaluateDependencies() {
    let count = 0;
    let result = {
      'numAttributes': '',
      'dependencies': {}
    };
    let dependencies = document.getElementsByClassName('dependency');

    for (let i = 0; i < dependencies.length; i++) {
      let arrayLeft = [];
      let arrayRight = [];
      let leftInputs = dependencies[i].firstChild.childNodes;

      for (let j = 0; j < leftInputs.length; j++) {
        if (leftInputs[j].firstChild.checked) {
          arrayLeft.push(leftInputs[j].lastChild.innerHTML);
        }
      }

      let rightInputs = dependencies[i].firstChild.childNodes;
      for (let j = 0; j < rightInputs.length; j++) {
        if (rightInputs[j].firstChild.checked) {
          arrayRight.push(rightInputs[j].lastChild.innerHTML);
        }
      }
      result.dependencies[count.toString()] = {'left': arrayLeft, 'right': arrayRight};
      result.numAttributes = this.numAttributes;
      count++;
    }
    //console.log(result);
    this.ea.publish('evaluateDependencies', result);
    //window.dependencyJson = result;
  }
}
