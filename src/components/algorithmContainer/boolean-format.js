export class BooleanFormatValueConverter {
  toView(value) {
    if(value) {
      return "Yes"
    }
    return "No"
  }
}