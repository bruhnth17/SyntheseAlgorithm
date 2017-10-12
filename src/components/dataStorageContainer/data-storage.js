let instance = null;

export class DataStorage {
  constructor() {
    if (instance === null) {
      this.data = {};
      this.setData = function(json) {
        this.data = json;
      };
      this.getData = function() {
        return this.data;
      };
      instance = this;
    }
    return instance;
  }
}
