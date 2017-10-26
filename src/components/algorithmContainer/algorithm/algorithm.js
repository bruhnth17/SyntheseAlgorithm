export class Algorithm {
  
  constructor() {
    this.domElem;
    this.log = {};
    this.stepBack = function() {};
    this.do = function(step, domElem) {
      this.domElem = domElem;
      if (step === 1) {
        this.leftReduction(domElem);
      }
    };

    this.traverseDomTree = function(callback) {
      let forms = document.getElementsByClassName('dependency');
      let domObj = [];
      let l = [];
      let r = [];
      for (let i = 0; i < forms.length; i++) {
        let left = forms[i].firstChild.childNodes;
        for (let j = 0; j < left.length - 1; j++) {
          if (callback(left[j])) {
            l.push(left[j].innerHTML);
          }
        }
        let right = forms[i].lastChild.childNodes;
        for (let j = 0; j < right.length - 1; j++) {
          if (callback(right[j])) {
            r.push(right[j].innerHTML);
          }
        }
        domObj.push({'left': l, 'right': r});
        l = [];
        r = [];
      }
      return domObj;
    };

    /**
     * Function for left reduction
     * @param {DomElem} span selected Span
     * @return {bool} true when span can be removed
     */
    this.leftReduction = function(span) {
      let startingElements = [];
      let elementsToFind = [];
      let modifiedDom = this.traverseDomTree(function(a) {
        return true;
      });

      //Fill starting elements
      let siblingsDom = span.parentNode.childNodes;
      for (let i = 0; i < siblingsDom.length - 1; i++) {
        if (siblingsDom[i].innerHTML !== span.innerHTML) {
          startingElements.push(siblingsDom[i].innerHTML);
        }
      }
      //Fill elementsToFind
      let elementsToFindDom = span.parentNode.parentNode.lastChild.childNodes;
      for (let i = 0; i < elementsToFindDom.length - 1; i++) {
        elementsToFind.push(elementsToFindDom[i].innerHTML);
      }
      //If there are no starting elements, left reduction is not possible
      if (startingElements === []) {
        return false;
      }

      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for(let i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          if (left.sort().join(',') === startingElements.sort().join(',')) {
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
              }
            }
            modifiedDom.splice(i,1);
            addedSomethingNew = true;
          }
        }
      } while(addedSomethingNew);

      if(startingElements.sort().join(',').includes(elementsToFind.sort().slice())) {
        console.log('CAN GET REMOVEEEEEED');
        return true;
      }
      return false;
    };

    /**
     * Function for right reduction
     * @param {DomElem} span selected Span
     * @return {bool} true when span can be removed
     */
    this.rightReduction = function(span) {};
    this.eliminate = function(form) {};
    this.confluate = function(form) {};
  }
}
