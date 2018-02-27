export class Algorithm {
  
  constructor() {
    this.domElem;
    this.explainText = [];
    this.log = {"steps" : []};
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
      const forms = document.getElementsByClassName('dependency');
      let domObj = [],
          l = [],
          r = [];

      for (let i = 0; i < forms.length; i++) {

        const leftSide = forms[i].firstChild.childNodes;
        for (let j = 0; j < leftSide.length - 1; j++) {
          let deleted = leftSide[j].className.includes('deleted');
          if (callback(leftSide[j]) && !deleted) {
            l.push(leftSide[j].innerHTML);
          }
        }
        const rightSide = forms[i].lastChild.childNodes;
        for (let j = 0; j < rightSide.length - 1; j++) {
          let deleted = rightSide[j].className.includes('deleted');
          if (callback(rightSide[j]) && !deleted) {
            r.push(rightSide[j].innerHTML);
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
      if (0 === arr2.length || 0 == arr1.length) {
        return false;
      }
      return arr2.every(function (value) {
        return (arr1.indexOf(value) >= 0);
      });
    };


    /**
     * Function for left reduction
     * @param {DomElement} span selected Span
     * @return {bool} true when span can be removed
     */
    this.leftReduction = function(span) {
      let startingElements = [],
          elementsToFind = [],
          question = '',
          modifiedDom = this.traverseDomTree(function(a) {
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

      if(startingElements.length === 0) {
        question = 'Can <b>' + elementsToFind.join(',') + '</b> be found with <b>∅</b>?';
      } else {
        question = 'Can <b>' + elementsToFind.join(',') + '</b> be found with <b>' + startingElements.join(',') + '</b>?';
      }

      let text = [];
      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          if (startingElements.sort().join(',').includes(left.sort().join(','))) {
            let tempAttr = [];
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                tempAttr.push(modifiedDom[i].right[l]);
                if(this.containsOtherArray(startingElements, elementsToFind)) {
                  text.push('You can reach Attribute/s ' + tempAttr + ' with Attribute/s '+ left + ' from the '+ (i+1) +'. Dependency.');
                  this.log.steps.push({
                    'domElem': span,
                    'question' : question,
                    'removed': true,
                    'reachMessage' : text,
                  });
                  console.log(text);
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
            text.push('You can reach Attribute ' + tempAttr.join(', ') + ' with Attribute/s '+ left + ' from the '+ (i+1) +'. Dependency.');
          }
        }
      } while(addedSomethingNew);
      this.log.steps.push({
        'domElem': span,
        'removed': false,
        'question': question,
      });
      return false;   
    };

    /**
     * Function for right reduction
     * @param {DomElement} span selected Span
     * @return {bool} true when span can be removed
     */
    this.rightReduction = function(span) {
      let startingElements = [],
          elementToFind = span.innerHTML,
          question = '',
          modifiedDom = this.traverseDomTree(function(a) {
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

      let oldRightSide = [];
      for (let i = 0; i < span.parentNode.childNodes.length - 1; i++) {
        if(!span.parentNode.childNodes[i].className.includes('deleted')) {
          oldRightSide.push(span.parentNode.childNodes[i].innerHTML);
        }
      }

      let newRightSide = [];
      for (let i = 0; i < span.parentNode.childNodes.length - 1; i++) {
        if(span.parentNode.childNodes[i].innerHTML !== span.innerHTML && !span.parentNode.childNodes[i].className.includes('deleted')) {
          // console.log(span.parentNode.childNodes.innerHTML, span.innerHTML);
          newRightSide.push(span.parentNode.childNodes[i].innerHTML);
        }
      }
      
      if(startingElementsDom.length === 0) {
        question = question = 'Can <b>' + elementToFind + '</b> still be reached with ' + '</b>∅ -> ' + newRightSide.join(',') + '</b> instead of <b>' + startingElements.join(',') + ' -> ' + oldRightSide.join(',') + '</b> when you start with <b>' + startingElements.join(',') + '</b>?';
      } else if(oldRightSide.length === 1) {
        question = 'Can <b>' + elementToFind + '</b> still be reached with ' + '<b>' + startingElements.join(',') + ' -> ∅</b>  instead of <b>' + startingElements.join(',') + ' -> ' + oldRightSide.join(',') + '</b> when you start with <b>' + startingElements.join(',') + '</b>?';
      } else {
        question = 'Can <b>' + elementToFind + '</b> still be reached with ' + '<b>' + startingElements.join(',') + ' ->' + newRightSide.join(',') + '</b> instead of <b>' + startingElements.join(',') + ' -> ' + oldRightSide.join(',') + '</b> when you start with <b>' + startingElements.join(',') + '</b>?';
      }

      let text = [];
      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for(var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          if (this.containsOtherArray(startingElements, left)) {
            let tempAttr = [];
            for(let l = 0; l < modifiedDom[i].right.length; l++) {
              if(!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                tempAttr.push(modifiedDom[i].right[l]);
                if(startingElements.includes(elementToFind)) {
                  text.push('You can reach Attribute ' + tempAttr.join(', ') + ' with Attribute/s '+ left + ' from the '+ (i+1) +'. Dependency.');
                  console.log(text);
                  this.log.steps.push({
                    'domElem': span,
                    'question': question,
                    'removed': true,
                    'reachMessage' : text,
                  });
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
            text.push('You can reach Attribute ' + tempAttr.join(', ') + ' with Attribute/s '+ left + ' from the '+ (i+1) +'. Dependency.');
          }
        }
      } while(addedSomethingNew);

      this.log.steps.push({
        'domElem': span,
        'question': question,
        'removed': false
      });
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
      for(let i = 0; i < rightChildren.length -1; i++) {
        if (!rightChildren[i].className.includes('deleted')) {
          this.log.steps.push({
            'domElem': form,
            'question': "Are there no Attributes on the right side?",
            'removed': false
          });
          return false;
        }
      }
      this.log.steps.push({
        'domElem': form,
        'question': "Are there no Attributes on the right side?",
        'removed': true,
        'reachMessage' : ['Dependency has no more Attributes on the right side']
      });
      return true;

    };
    this.confluate = function(form) {
      let leftChildren = form.firstChild.childNodes;
      //traverse leftchildren of domtree except own
      //if a.leftchidren == b.leftchidren
      //delete b, and add b.rightchildren to a.rightchildren
    };
  }
}
