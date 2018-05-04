export class ExplainLeftRightreduction {

  /*
   * connections = {
   *    "reached",
   *    "used",
   *    "dependency"
   *}
   */
  constructor() {
      this.connections = [];
      this.startingElements;
      this.elementsToFind;
  }

  pushConnection(connection) {
    this.connections.push(connection);
  }

  createExplainationTest() {
   const result = [];

   this.connections.forEach(entry => {
     if(entry.reached.length > 0)
        result.push("Reached " + entry.reached.join(", ") +  " with " +  entry.used.join(", ") + " in " +  entry.dependency + ". Dependency");
   })

    this.clear();
    return result;
  }

  clear() {
    this.connections = [];
    this.elementsToFind = [];
    this.startingElements = [];
  }

  setStartingElements(startingElements) {
    this.startingElements = startingElements;
  }

  setElementsToFind(elementsToFind) {
    this.elementsToFind = elementsToFind;
  }
}