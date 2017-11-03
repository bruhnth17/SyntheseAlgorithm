import {DataStorage} from '../dataStorageContainer/data-storage';
import {Algorithm} from './algorithm/algorithm';
import {inject} from 'aurelia-framework';

@inject(DataStorage, Algorithm)
export class AlgorithmContainer {
  constructor(dataStorage, algorithm) {
    this.stepHeadline = 'Leftreduction';
    this.question = '';
    this.answer = '';
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
     * @return {DomObject} current attribute
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

    //changes class of previous attribute, to not highlight it anymore
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
      this.question = this.algorithm.log.steps.last().question;
      this.answer = this.algorithm.log.steps.last().removed;
    };

    this.stepBack = function() {
      console.log(this.algorithm.log);
      this.changeClassOldAttribute();
      this.current = this.getAttribute();
      let lastStep = this.algorithm.log.steps.last();
      let oldDomElem = lastStep.domElem;
      if(lastStep.removed) {
        console.log('was removed', oldDomElem);
        oldDomElem.className = oldDomElem.className.replace('deleted', '');
      }
      this.algorithm.log.steps.splice(-1,1);
      this.question = this.algorithm.log.steps.last().question;
      this.answer = this.algorithm.log.steps.last().removed;
      this.current.className += ' current-attribute';
    };


    /**
     * Counts the number of steps needed for each state in the algorithm
     * and sets right value for progressbar
     * gets called when Class is created
     */
    this.init = function() {

      if (!Array.prototype.last){
        Array.prototype.last = function(){
            return this[this.length - 1];
        };
      };

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
     * Checks which step of the algorithm it is in
     * Changes Headline if new step
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
