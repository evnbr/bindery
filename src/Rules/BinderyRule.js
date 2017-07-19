export default class BinderyRule {
  constructor(options) {
    options = options ? options : {};
    this.name = options.name ? options.name : "Unnamed Bindery Rule";
    this.selector = "";

    for (let key in options) {
      this[key] = options[key];
    }
  }
}
