import { ExplainLeftRightreduction } from "./explainationText/explainLeftRightreduction";
import { inject } from "aurelia-framework";

@inject(ExplainLeftRightreduction)
export class Algorithm {

  constructor(ExplainLeftRightreduction) {
    this.domElem;
    this.explainLeftRightreduction = ExplainLeftRightreduction;
    this.log = { "steps": [] };

    this.stepBack = function () { };
    this.do = function (step, domElem) {
      this.domElem = domElem;
      switch (step) {
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
    this.traverseDomTree = function (callback) {
      const forms = document.getElementsByClassName("dependency");
      let domObj = [],
        l = [],
        r = [];

      for (let i = 0; i < forms.length; i++) {
        let formDeleted = forms[i].classList.contains("deleted");
        let leftSide = forms[i].firstChild.childNodes;
        for (let j = 0; j < leftSide.length - 1; j++) {
          let deleted = leftSide[j].className.includes("deleted");
          if (callback(leftSide[j]) && !deleted && !formDeleted) {
            l.push(leftSide[j].innerHTML);
          }
        }
        let rightSide = forms[i].lastChild.childNodes;
        for (let j = 0; j < rightSide.length - 1; j++) {
          let deleted = rightSide[j].className.includes("deleted");
          if (callback(rightSide[j]) && !deleted && !formDeleted) {
            r.push(rightSide[j].innerHTML);
          }
        }
        if(l.length > 0 && r.length > 0) {
          domObj.push({ "left": l, "right": r, dependency: i+1 });
        }
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
    this.containsOtherArray = function (arr1, arr2) {
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
    this.leftReduction = function (span) {
      let startingElements = [],
          elementsToFind = [],
          question = "",
          modifiedDom = this.traverseDomTree((a) => { return true; });

      //startingElements are siblings of the span
      let siblingsDom = span.parentNode.childNodes;
      for (let i = 0; i < siblingsDom.length - 1; i++) {
        let deleted = siblingsDom[i].className.includes("deleted");
        if (siblingsDom[i].innerHTML !== span.innerHTML && !deleted) {
          startingElements.push(siblingsDom[i].innerHTML);
        }
      }
      this.explainLeftRightreduction.setStartingElements(startingElements);

      //elementsToFind are right side of dependency
      let elementsToFindDom = span.parentNode.parentNode.lastChild.childNodes;
      for (let i = 0; i < elementsToFindDom.length - 1; i++) {
        elementsToFind.push(elementsToFindDom[i].innerHTML);
      }
      this.explainLeftRightreduction.setElementsToFind(elementsToFind);

      if (startingElements.length === 0) {
        question = "Can <b>" + elementsToFind.join(", ") + " </b> be found with <b>∅</b>?";
      } else {
        question = "Can <b>" + elementsToFind.join(", ") + "</b> be found with <b>" + startingElements.join(", ") + "</b>?";
      }

      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for (let i = 0, length = modifiedDom.length; i < length; i++) {
          let left = modifiedDom[i].left;
          if (this.containsOtherArray(startingElements, left)) {
            let tempAttr = [];
            for (let l = 0; l < modifiedDom[i].right.length; l++) {
              if (!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                tempAttr.push(modifiedDom[i].right[l]);
                if (this.containsOtherArray(startingElements, elementsToFind)) {
                  this.explainLeftRightreduction.pushConnection({
                    "reached": tempAttr,
                    "used": left,
                    "dependency": modifiedDom[i].dependency
                  });
                  this.log.steps.push({
                    "domElem": span,
                    "question": question,
                    "removed": true,
                    "reachMessage": this.explainLeftRightreduction.createExplainationTest(),
                  });
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
            this.explainLeftRightreduction.pushConnection({
              "reached": tempAttr,
              "used": left,
              "dependency": modifiedDom[i].dependency
            });
          }
        }
      } while (addedSomethingNew);

      this.log.steps.push({
        "domElem": span,
        "removed": false,
        "question": question,
      });

      this.explainLeftRightreduction.clear();
      return false;
    };

    /**
     * Function for right reduction
     * @param {DomElement} span selected Span
     * @return {bool} true when span can be removed
     */
    this.rightReduction = function (span) {
      let startingElements = [],
          elementToFind = span.innerHTML,
          question = "",
          modifiedDom = this.traverseDomTree((a) => {
            return (span !== a);
          });
      this.explainLeftRightreduction.setElementsToFind([elementToFind]);


      //starting elements are left side of dependency
      let startingElementsDom = span.parentNode.parentNode.firstChild.childNodes;
      for (let i = 0; i < startingElementsDom.length - 1; i++) {
        if (startingElementsDom[i].innerHTML && !startingElementsDom[i].className.includes("deleted")) {
          startingElements.push(startingElementsDom[i].innerHTML);
        }
      }
      this.explainLeftRightreduction.setStartingElements(startingElementsDom);

      let oldRightSide = [];
      for (let i = 0; i < span.parentNode.childNodes.length - 1; i++) {
        if (!span.parentNode.childNodes[i].className.includes("deleted")) {
          oldRightSide.push(span.parentNode.childNodes[i].innerHTML);
        }
      }

      let newRightSide = [];
      for (let i = 0; i < span.parentNode.childNodes.length - 1; i++) {
        if (span.parentNode.childNodes[i].innerHTML !== span.innerHTML
          && !span.parentNode.childNodes[i].className.includes("deleted")) {
          newRightSide.push(span.parentNode.childNodes[i].innerHTML);
        }
      }

      if (startingElementsDom.length === 0) {
        question = "Can <b>" + elementToFind + "</b> still be reached with " + "</b>∅ -> " + newRightSide.join(", ") + " </b>&nbsp; instead of <b>" + startingElements.join(", ") + " -> &nbsp;" + oldRightSide.join(", ") + "</b>&nbsp; when you start with <b>" + startingElements.join(", ") + "</b>?";
      } else if (oldRightSide.length === 1) {
        question = "Can <b>" + elementToFind + "</b> still be reached with " + "<b>" + startingElements.join(", ") + " -> ∅</b>&nbsp; instead of <b>" + startingElements.join(", ") + " -> &nbsp;" + oldRightSide.join(", ") + "</b>&nbsp; when you start with <b>" + startingElements.join(", ") + "</b>?";
      } else {
        question = "Can <b>" + elementToFind + "</b> still be reached with " + "<b>" + startingElements.join(", ") + " -> " + newRightSide.join(", ") + "</b>&nbsp; instead of <b>" + startingElements.join(", ") + " -> &nbsp;" + oldRightSide.join(", ") + "</b>&nbsp; when you start with <b>" + startingElements.join(", ") + "</b>?";
      }

      //check if element to find is alreade on left side
      for(let i = 0; i<startingElements.length; i++) {
        if (startingElements[i] === elementToFind) {
          this.log.steps.push({
            "domElem": span,
            "question": question,
            "removed": true,
            "reachMessage": [elementToFind + " was also on the left side of the dependency"],
          });
          return true;
        }
      };

      let addedSomethingNew;
      do {
        addedSomethingNew = false;
        for (var i = 0; i < modifiedDom.length; i++) {
          let left = modifiedDom[i].left;
          if (this.containsOtherArray(startingElements, left)) {
            let tempAttr = [];
            for (let l = 0; l < modifiedDom[i].right.length; l++) {
              if (!startingElements.includes(modifiedDom[i].right[l])) {
                startingElements.push(modifiedDom[i].right[l]);
                tempAttr.push(modifiedDom[i].right[l]);
                if (startingElements.includes(elementToFind)) {
                  this.explainLeftRightreduction.pushConnection({
                    "reached": tempAttr,
                    "used": left,
                    "dependency": modifiedDom[i].dependency
                  });
                  this.log.steps.push({
                    "domElem": span,
                    "question": question,
                    "removed": true,
                    "reachMessage": this.explainLeftRightreduction.createExplainationTest(),
                  });
                  return true;
                } else {
                  addedSomethingNew = true;
                }
              }
            }
            this.explainLeftRightreduction.pushConnection({
              "reached": tempAttr,
              "used": left,
              "dependency": modifiedDom[i].dependency
            });
          }
        }
      } while (addedSomethingNew);

      this.log.steps.push({
        "domElem": span,
        "question": question,
        "removed": false
      });

      this.explainLeftRightreduction.clear();
      return false;
    };

    /**
     * Function to eliminate
     * eliminates when right side of form is empty
     * @param {DomObject} form form that"s checked
     * @return {bool} true if can be removed
     */
    this.eliminate = function (form) {
      let rightChildren = form.lastChild.childNodes;
      for (let i = 0; i < rightChildren.length - 1; i++) {
        if (!rightChildren[i].className.includes("deleted")) {
          this.log.steps.push({
            "domElem": form,
            "question": "Are there no Attributes on the right side?",
            "removed": false
          });
          return false;
        }
      }
      this.log.steps.push({
        "domElem": form,
        "question": "Are there no Attributes on the right side?",
        "removed": true,
        "reachMessage": ["Dependency had no more Attributes on the right side"]
      });
      return true;

    };

    /**
     * Function to conflate
     * combines dependencies if the left side is the same
     * @param {json} dependencies that are checked
     * @return {json} conflated dependencies 
     */
    this.confluate = function (forms) {
      // https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
      Array.prototype.unique = function () {
        var a = this.concat();
        for (var i = 0; i < a.length; ++i) {
          for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
              a.splice(j--, 1);
          }
        }

        return a;
      };
      Array.prototype.equals = function (a) {
        if (a === this) return true;
        if (a == null) return false;
        if (a.length != this.length) return false;

        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== this[i]) return false;
        }
        return true;
      }

      const modifiedDom = this.traverseDomTree((x) => { return true; });
      var newDom = [];

      for (let i = 0; i < modifiedDom.length; i++) {
        let duplicate = false;
        for (let j = 0; j < modifiedDom.length; j++) {
          if (i !== j && (modifiedDom[i] !== undefined) && modifiedDom[j] !== undefined) {
            if (modifiedDom[j].left.equals(modifiedDom[i].left)) {
              duplicate = true;
              let right = modifiedDom[j].right;
              delete modifiedDom[j];
              modifiedDom[i].right = modifiedDom[i].right.concat(right).unique();
              this.log.steps.push({
                "domElem": forms[j],
                "conflate": true,
                "question": "Do two Dependencies have the same left side?",
                "removed": true,
                "reachMessage": [(j + 1) + ". Dependency had the same Attributes on the left side as the " + modifiedDom[i].dependency + ". Dependecy "]
              });
            }
          }
        }
      }
      modifiedDom.forEach(entry => {
        if(entry) {
          newDom.push({
            "left": entry.left,
            "right": entry.right
          })
        }
      }, this);
      return newDom;
    };
  }
}
