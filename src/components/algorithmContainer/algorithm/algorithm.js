export class Algorithm {
  
  constructor() {
    this.domElem;
    this.log = {};
    this.stepBack = function() {};
    this.do = function(step, domElem) {
      this.domElem = domElem;
      if (step === 1) {
        return this.leftReduction(domElem);
      }
      if(step === 2) {
        return this.rightReduction(domElem);
      }
    };

    /**
     * Traverses dom Tree and manipulates it with
     * the callback the way it is needed for each step
     * @param {function} callback should return false if domElem should not be in the returned "Domtree"
     * @return Array of Objects {left: [], right: []} – Each Object represents dependencies
     */
    this.traverseDomTree = function(callback) {
      let forms = document.getElementsByClassName('dependency');
      let domObj = [];
      let l = [];
      let r = [];
      for (let i = 0; i < forms.length; i++) {
        let left = forms[i].firstChild.childNodes;
        for (let j = 0; j < left.length - 1; j++) {
          if (callback(left[j]) && !left[j].className.includes('deleted')) {
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
      console.log(domObj);
      return domObj;
    };

    /**
     * Function for left reduction
     * @param {DomElement} span selected Span
     * @return {bool} true when span can be removed
     */
    this.leftReduction = function(span) {
      let startingElements = [];
      let elementsToFind = [];
      let modifiedDom = this.traverseDomTree(function(a) {
        return true;
      });

      //startingElements are siblings of the span
      let siblingsDom = span.parentNode.childNodes;
      for (let i = 0; i < siblingsDom.length - 1; i++) {
        if (siblingsDom[i].innerHTML !== span.innerHTML && !siblingsDom[i].className.includes('deleted')) {
          startingElements.push(siblingsDom[i].innerHTML);
        }
      }
      //elementsToFind are right side of dependency
      let elementsToFindDom = span.parentNode.parentNode.lastChild.childNodes;
      for (let i = 0; i < elementsToFindDom.length - 1; i++) {
        elementsToFind.push(elementsToFindDom[i].innerHTML);
      }
      //If there are no starting elements, left reduction is not possible
      if (startingElements === []) {
        return false;
      }

      let addedSomethingNew;
      console.log('need:' ,elementsToFind.sort().slice(','));
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          console.log('left', left.sort().join(','));
          console.log('st', startingElements.sort().join(','));
          if (startingElements.sort().join(',').includes(left.sort().join(','))) {
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                modifiedDom[i].left.splice(l,1);
                addedSomethingNew = true;
              }
            }
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
     * @param {DomElement} span selected Span
     * @return {bool} true when span can be removed
     */
    this.rightReduction = function(span) {
      let startingElements = [];
      let elementToFind = span.innerHTML;
      let modifiedDom = this.traverseDomTree(function(a) {
        if(span === a) {
          return false;
        }
        return true;
      });

      //starting elements are left side of dependency
      let startingElementsDom = span.parentNode.parentNode.firstChild.childNodes;
      for (let i = 0; i < startingElementsDom.length - 1; i++) {
        if (startingElementsDom[i].innerHTML !== span.innerHTML && !startingElementsDom[i].className.includes('deleted')) {
          startingElements.push(startingElementsDom[i].innerHTML);
        }
      }

      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          console.log('left', left.sort().join(','));
          console.log('st', startingElements.sort().join(','));
          if (startingElements.sort().join(',').includes(left.sort().join(','))) {
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                modifiedDom[i].right.splice(l,1);
                addedSomethingNew = true;
              }
            }
            console.log(modifiedDom);
          }
        }
      } while(addedSomethingNew);
      console.log(startingElements);
      console.log(elementToFind);

      if(startingElements.sort().join(',').includes(elementToFind)) {
        console.log('CAN GET REMOVEEEEEED');
        return true;
      }
      return false;
    };

    this.eliminate = function(form) {};
    this.confluate = function(form) {};
  }
}
