export class BooleanFormatValueConverter {
  toView(value) {
    let answer = '';
    console.log(answer);
    if(typeof value !== 'undefined') {
      if(value) {
        answer = 'Yes';
      } else {
        answer = 'No';
      }
    }
    return answer;
  }
}