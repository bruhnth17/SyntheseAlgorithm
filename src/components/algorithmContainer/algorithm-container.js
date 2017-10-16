import {DataStorage} from '../dataStorageContainer/data-storage';
import {inject} from 'aurelia-framework';

@inject(DataStorage)
export class AlgorithmContainer {
  constructor(dataStorage) {
    this.count; //I know its ugly, but I don't care right now
    this.current; //current DomElement that is used in Algorithm
    this.stepsLR = 0;
    this.stepsRR = 0;
    this.stepsEL = 0;
    //this.stepsCF = 0;
    this.algoStep = 1;
    this.AlgoStepEnum = {
      LEFTREDUCTION: 1,
      RIGHTREDUCTION: 2,
      ELIMINATE: 3,
      CONFLATE: 4
    };
    //this.json = dataStorage.getData();
    this.json = {"numAttributes":4,"dependencies":[[["A"],["A","D"]],[["B"],["B","C"]],[["B","C","D"],["B","C"]],[["A","B","C"],["C","D"]]]}
    this.log = {};

    /**
     * gets current Attribute with the count
     * as reference.
     */
    this.getAttribute = function() {
      let step = 0;
      let forms = document.getElementsByClassName('dependency');

      if (this.algoStep === this.AlgoStepEnum.LEFTREDUCTION) {
        for (let i = 0; i < forms.length; i++) {
          let left = forms[i].firstChild.childNodes;
          for (let j = 0; j < left.length - 1; j++) {
            if (this.count !== step) {
              step += 1;
            } else {
              return left[j];
            }
          }
        }
      }

      if (this.algoStep === this.AlgoStepEnum.RIGHTREDUCTION) {
        let count = this.count - this.stepsLR;
        for (let i = 0; i < forms.length; i++) {
          let right = forms[i].lastChild.childNodes;
          for (let j = 0; j < right.length - 1; j++) {
            if (count !== step) {
              step += 1;
            } else {
              return right[j];
            }
          }
        }
      }
    };

    this.stepForward = function() {
      if (this.current !== undefined) {
        this.current.className = '';
      }
      this.current = this.getAttribute();
      this.current.className = 'current-attribute';
    };

    this.stepBack = function() {
      this.current.className = '';
      this.current = this.getAttribute();
      this.current.className = 'current-attribute';
    };


    /**
     * Counts the number of steps needed for each State in the Algorithm
     * gets called when Class is created
     */
    this.init = function() {
      let forms = document.getElementsByClassName('dependency');
      for (let i = 0; i < forms.length; i++) {
        let left = forms[i].firstChild.childNodes;
        for (let j = 0; j < left.length - 1; j++) {
          this.stepsLR += 1;
        }
        let right = forms[i].lastChild.childNodes;
        for (let j = 0; j < right.length - 1; j++) {
          this.stepsRR += 1;
        }
        this.stepsEL += 1;
      }
    };

    /**
     * Checks with the help of count, which state of
     * the algorithm it is in
     */
    this.updateState = function() {
      if (this.count < this.stepsLR) {
        this.algoStep = 1; //LEFTREDUCTION
      } else if (this.count < (this.stepsRR + this.stepsLR)) {
        this.algoStep = 2; //RIGHTREDUCTION
      }
    };
  }

  //Executed when NextBtn is pressed
  nextPressed() {
    if (this.count !== undefined) {
      this.count += 1;
    } else {
      this.init();
      this.count = 0;
    }
    this.updateState();
    this.stepForward();
  }

  //Executed when BackBtn is pressed
  backPressed() {
    if (this.count !== undefined) {
      if (this.count > 0) {
        this.count -= 1;
        this.updateState();
        this.stepBack();
      }
    }
  }

}
