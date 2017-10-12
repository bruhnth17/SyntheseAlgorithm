import {DataStorage} from '../dataStorageContainer/data-storage';
import {inject} from 'aurelia-framework';

@inject(DataStorage)
export class AlgorithmContainer {
  constructor(dataStorage) {
    this.json = dataStorage.getData();
    console.log(this.json);
  }
}
