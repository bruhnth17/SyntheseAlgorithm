import {DataStorage} from '../dataStorageContainer/data-storage';
import {Algorithm} from './algorithm/algorithm';
import {inject} from 'aurelia-framework';

@inject(DataStorage, Algorithm)
export class AlgorithmContainer {
  constructor(dataStorage, algorithm) {
    this.stepHeadline = "Leftreduction";
    this.count; //I know its ugly, but I don't care right now
    this.current; //current DomElement that is used in Algorithm
    this.algorithm = algorithm;
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
    //this.json = dataStorage.getData(); //TODO: change name… not actually json
    //console.log(JSON.stringify(this.json));
    this.json = /*DUMMYDATA*/ {"numAttributes":6,"dependencies":[[["D"],["B","C","D","F"]],[["B","C"],["A","E"]],[["A","D","E"],["B","C"]],[["B","F"],["A","D"]],[["E"],["F"]]]};
    
            


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

      if (this.algoStep === this.AlgoStepEnum.ELIMINATE) {
        let count = this.count - this.stepsLR - this.stepsRR;
        for (let i = 0; i < forms.length; i++) {
          if (count !== step) {
            step += 1;
          } else {
            return forms[i];
          }
        }
      }
    };

    this.changeClassOldAttribute = function() {
      if (this.current !== undefined) {
        if (this.current.className.includes('dependency')) {
          if (this.current.className.includes('deleted')) {
            this.current.className = 'dependency deleted';
          } else {
            this.current.className = 'dependency';
          }
        } else {
          if (this.current.className.includes('deleted')) {
            this.current.className = 'deleted';
          } else {
            this.current.className = '';
          }
        }
      }
    };

    this.stepForward = function() {
      this.changeClassOldAttribute();
      this.current = this.getAttribute();
      this.current.className += ' current-attribute';
      let remove = this.algorithm.do(this.algoStep, this.current);
      if(remove) {
        this.current.className += ' deleted';
      }
    };

    this.stepBack = function() {
      this.changeClassOldAttribute();
      this.current = this.getAttribute();
      this.current.className += ' current-attribute';
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
      let sum = this.stepsLR+this.stepsRR+this.stepsEL;
      document.getElementById('progress-outer').setAttribute('data-max', sum.toString());
    };

    /**
     * Checks with the help of count, which state of
     * the algorithm it is in
     */
    this.updateState = function() {
      let progressbarMax = parseInt(document.getElementById('progress-outer').getAttribute("data-max"));
      document.getElementById('progress-inner').style.width = ((this.count / progressbarMax)*100).toString() + '%';
      if (this.count < this.stepsLR) {
        this.algoStep = 1; //LEFTREDUCTION
      } else if (this.count < (this.stepsRR + this.stepsLR)) {
        this.algoStep = 2;
        this.stepHeadline = "Rightreduction"
      } else if (this.count < (this.stepsRR + this.stepsLR + this.stepsEL)) {
        this.algoStep = 3;
        this.stepHeadline = "Elemination"
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
