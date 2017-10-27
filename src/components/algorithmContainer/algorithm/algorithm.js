export class Algorithm {
  
  constructor() {
    this.domElem;
    this.explainText = [];
    this.log = {};
    this.stepBack = function() {};
    this.do = function(step, domElem) {
      this.domElem = domElem;
      switch(step) {
        case 1:
          return this.leftReduction(domElem);
        case 2:
          return this.rightReduction(domElem);
        case 3:
          return this.eliminate(domElem);
        case 4:
          return this.confluate(domElem);
        default:
          console.warn("Wrong step number: ", step);
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
          let deleted = left[j].className.includes('deleted');
          if (callback(left[j]) && !deleted) {
            l.push(left[j].innerHTML);
          }
        }
        let right = forms[i].lastChild.childNodes;
        for (let j = 0; j < right.length - 1; j++) {
          let deleted = right[j].className.includes('deleted');
          if (callback(right[j]) && !deleted) {
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
     * Helperfunction, that checks if all values from on array are in another array
     * @param {Array} arr1 bigger array, that may contain arr2
     * @param {Array} arr2 smaller array
     * @return {bool} true if all values from arr2 are in arr1  
     */
    this.containsOtherArray = function(arr1, arr2) {
      if (0 === arr2.length) {
        return false;
      }
      return arr2.every(function (value) {
        return (arr1.indexOf(value) >= 0);
      });
    }

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
        let deleted = siblingsDom[i].className.includes('deleted');
        if (siblingsDom[i].innerHTML !== span.innerHTML && !deleted) {
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
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          if (startingElements.sort().join(',').includes(left.sort().join(','))) {
            //console.log("can do smth with: ", left.join(','));
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                //console.log("You can reach Attribute " + modifiedDom[i].right[l] + " with Atribute/s "+ left + " from the " + (i+1) +". Dependency." )
                startingElements.push(modifiedDom[i].right[l]);
                //console.log("elements to find", elementsToFind.sort().join(','));
                //console.log("starting elem", startingElements.sort().join(','));
                if(this.containsOtherArray(startingElements, elementsToFind)) {
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
          }
        }
      } while(addedSomethingNew);
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
        if (startingElementsDom[i].innerHTML && !startingElementsDom[i].className.includes('deleted')) {
          startingElements.push(startingElementsDom[i].innerHTML);
        }
      }

      if(startingElements.includes(elementToFind)) {
        return true;
      }

      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          console.log('left', left.join(','));
          console.log('st', startingElements.join(','));
          if (this.containsOtherArray(startingElements, left)) {
            console.log('can do something with' + left.join(','))
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                console.log("You can reach Attribute " + modifiedDom[i].right[l] + " with the Attribute/s " + modifiedDom[i].left.join(',') + " from the " + (i+1) + ". Dependency" );
                startingElements.push(modifiedDom[i].right[l]);
                if(startingElements.includes(elementToFind)) {
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
          }
        }
      } while(addedSomethingNew);

      return false;
    };

    /**
     * Function to eliminate
     * eliminates when right side of form is empty
     * @param {DomObject} form form that's checked
     * @return {bool} true if can be removed
     */
    this.eliminate = function(form) {
      let rightChildren = form.lastChild.childNodes;
      console.log(rightChildren);
      for(let i = 0; i < rightChildren.length -1; i++) {
        if (!rightChildren[i].className.includes('deleted')) {
          console.log('false');
          return false;
        }
      }
      console.log('true');
      return true;

    };
    this.confluate = function(form) {};
  }
}
