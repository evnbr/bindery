export default class BinderyRule {
  constructor(options) {
    this.name = options.name ? options.name : "Unnamed Bindery Rule";
    this.selector = "";

    for (let key in options) {
      if (key in this) {
        this[key] = options[key];
      }
    }
  }
}
